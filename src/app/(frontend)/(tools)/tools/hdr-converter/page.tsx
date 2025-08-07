'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Download, Zap, ArrowRight } from 'lucide-react';

// Cache ImageMagick initialization
let magickInitPromise: Promise<{
  ImageMagick: any;
  MagickFormat: any;
  ColorSpace: any;
  EvaluateOperator: any;
  Channels: any;
  Percentage: any;
}> | null = null;

// Cache profile data
let profileBytes: Uint8Array | null = null;

async function initializeMagick() {
  if (magickInitPromise) {
    return magickInitPromise;
  }

  magickInitPromise = (async () => {
    // Dynamic import for @imagemagick/magick-wasm
    const {
      initializeImageMagick,
      ImageMagick,
      MagickFormat,
      ColorSpace,
      EvaluateOperator,
      Channels,
      Percentage,
    } = await import('@imagemagick/magick-wasm');

    // Get WASM bytes from public folder
    const wasmResponse = await fetch('/hdr/magick.wasm');
    const wasmBytes = new Uint8Array(await wasmResponse.arrayBuffer());

    // Initialize ImageMagick with WASM bytes
    await initializeImageMagick(wasmBytes);

    // Load and cache ICC profile - essential for HDR
    if (!profileBytes) {
      const profileResponse = await fetch('/hdr/2020_profile.icc');
      profileBytes = new Uint8Array(await profileResponse.arrayBuffer());
    }

    return {
      ImageMagick,
      MagickFormat,
      ColorSpace,
      EvaluateOperator,
      Channels,
      Percentage,
    };
  })();

  return magickInitPromise;
}

export default function HDRConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    '/image/logo.png'
  );
  const [hdrImageUrl, setHdrImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // HDR adjustment controls - default to more impressive values
  const [brightness, setBrightness] = useState(3.5); // Multiply factor
  const [gamma, setGamma] = useState(0.5); // Pow factor
  const [saturation, setSaturation] = useState(140); // Saturation percentage (100 = normal)

  // Debounce timer for HDR conversion
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setHdrImageUrl(null);

      // Automatically convert to HDR with initial settings
      await convertToHDR(file);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Convert with specific settings
  const convertToHDRWithSettings = useCallback(
    async (
      file: File,
      brightnessValue: number,
      gammaValue: number,
      saturationValue: number
    ) => {
      setIsProcessing(true);

      try {
        // Use cached initialization (only slow on first use)
        const {
          ImageMagick,
          MagickFormat,
          ColorSpace,
          EvaluateOperator,
          Channels,
          Percentage,
        } = await initializeMagick();

        // Get image file as buffer
        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = new Uint8Array(arrayBuffer);

        // HDR processing with custom settings
        let resultBuffer: Uint8Array = new Uint8Array();

        ImageMagick.read(inputBuffer, (img: any) => {
          // Equivalent to: -colorspace RGB
          img.colorSpace = ColorSpace.RGB;

          // Equivalent to: -evaluate Multiply {brightnessValue}
          img.evaluate(
            Channels.All,
            EvaluateOperator.Multiply,
            brightnessValue
          );

          // Equivalent to: -evaluate Pow {gammaValue}
          img.evaluate(Channels.All, EvaluateOperator.Pow, gammaValue);

          // Equivalent to: -colorspace sRGB
          img.colorSpace = ColorSpace.sRGB;

          // Apply proper saturation control using ImageMagick's modulate
          if (saturationValue !== 100) {
            // Use modulate with Percentage objects: modulate(brightness, saturation, hue)
            img.modulate(
              new Percentage(100),
              new Percentage(saturationValue),
              new Percentage(100)
            );
          }

          // Equivalent to: -depth 16
          img.depth = 16;

          // Equivalent to: -profile 2020_profile.icc (essential for HDR)
          img.setProfile({ name: 'icc', data: profileBytes! });

          // Output as PNG for quality
          img.write(MagickFormat.Png, (data: any) => {
            resultBuffer = data;
          });
        });

        // Create blob and URL for download/display
        const blob = new Blob([resultBuffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setHdrImageUrl(url);
      } catch (error) {
        console.error('Error converting image:', error);
        alert('Failed to convert image to HDR');
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const convertToHDR = useCallback(
    async (file: File) => {
      // Use the current brightness, gamma, and saturation settings
      await convertToHDRWithSettings(file, brightness, gamma, saturation);
    },
    [brightness, gamma, saturation, convertToHDRWithSettings]
  );

  const downloadHDRImage = () => {
    if (hdrImageUrl) {
      const a = document.createElement('a');
      a.href = hdrImageUrl;
      a.download = `${selectedFile?.name?.replace(/\.[^/.]+$/, '') || 'image'}_hdr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Smooth debounced HDR processing
  const processHDR = useCallback(async () => {
    if (!selectedFile) return;

    // Cancel any existing processing
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce the actual processing
    debounceTimer.current = setTimeout(() => {
      void convertToHDRWithSettings(
        selectedFile,
        brightness,
        gamma,
        saturation
      );
    }, 300);
  }, [selectedFile, brightness, gamma, saturation, convertToHDRWithSettings]);

  // Auto-process when slider values change
  useEffect(() => {
    void processHDR();
  }, [processHDR]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Load example image on mount
  useEffect(() => {
    const loadExampleImage = async () => {
      try {
        const response = await fetch('/image/logo.png');
        const blob = await response.blob();
        const file = new File([blob], 'logo.png', { type: 'image/png' });
        setSelectedFile(file);
        await convertToHDRWithSettings(file, brightness, gamma, saturation);
      } catch (error) {
        console.error('Failed to load example image:', error);
      }
    };

    void loadExampleImage();
  }, [brightness, gamma, saturation, convertToHDRWithSettings]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HDR Converter Tool - Top Priority */}
      <motion.section
        className="py-8 sm:py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div className="text-center mb-12" variants={itemVariants}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-4 leading-tight text-foreground">
              HDR Image Converter
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Make your images pop with HDR brightness and color
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl p-6">
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Original Image */}
                <div
                  className="cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      Original
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                        isDragOver
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <img
                        src={previewUrl || undefined}
                        alt="Original"
                        className="w-full h-auto rounded-lg shadow-md"
                        style={{ maxHeight: '280px', objectFit: 'contain' }}
                      />
                      {isDragOver && (
                        <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/40 rounded-lg flex items-center justify-center">
                          <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                            Drop new image here
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Click to upload or drag & drop
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                </div>

                {/* HDR Result */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      HDR Enhanced
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="border-2 border-solid border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      {hdrImageUrl ? (
                        <img
                          src={hdrImageUrl}
                          alt="HDR Enhanced"
                          className="w-full h-auto rounded-lg shadow-md"
                          style={{ maxHeight: '280px', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[280px] text-muted-foreground">
                          {isProcessing ? (
                            <div className="text-center">
                              <div className="animate-spin w-8 h-8 border-2 border-brand border-t-transparent rounded-full mx-auto mb-2"></div>
                              <p>Converting to HDR...</p>
                            </div>
                          ) : (
                            <p>HDR result will appear here</p>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground text-center opacity-50">
                      Enhanced image appears here
                    </p>
                  </div>
                </div>
              </div>

              {/* HDR Controls */}
              <div className="mb-8 space-y-6">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-brand" />
                  <h3 className="text-lg font-semibold">Adjust HDR Settings</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Brightness Control */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="brightness"
                      className="text-sm font-medium flex items-center justify-between"
                    >
                      <span>Brightness</span>
                      <span className="text-brand font-semibold">
                        {brightness.toFixed(1)}x
                      </span>
                    </Label>
                    <input
                      id="brightness"
                      type="range"
                      min="0.5"
                      max="7.0"
                      step="0.1"
                      value={brightness}
                      onChange={(e) =>
                        setBrightness(parseFloat(e.target.value))
                      }
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <div className="text-center">
                        <div>0.5x</div>
                        <div className="text-[10px] mt-0.5">Darker</div>
                      </div>
                      <div className="text-center">
                        <div>7.0x</div>
                        <div className="text-[10px] mt-0.5">Brighter</div>
                      </div>
                    </div>
                  </div>

                  {/* Gamma Control */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="gamma"
                      className="text-sm font-medium flex items-center justify-between"
                    >
                      <span>Gamma</span>
                      <span className="text-brand font-semibold">
                        {gamma.toFixed(2)}
                      </span>
                    </Label>
                    <input
                      id="gamma"
                      type="range"
                      min="0.1"
                      max="2.0"
                      step="0.05"
                      value={gamma}
                      onChange={(e) => setGamma(parseFloat(e.target.value))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <div className="text-center">
                        <div>0.1</div>
                        <div className="text-[10px] mt-0.5">Dramatic</div>
                      </div>
                      <div className="text-center">
                        <div>2.0</div>
                        <div className="text-[10px] mt-0.5">Subtle</div>
                      </div>
                    </div>
                  </div>

                  {/* Saturation Control */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="saturation"
                      className="text-sm font-medium flex items-center justify-between"
                    >
                      <span>Saturation</span>
                      <span className="text-brand font-semibold">
                        {saturation}%
                      </span>
                    </Label>
                    <input
                      id="saturation"
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <div className="text-center">
                        <div>0%</div>
                        <div className="text-[10px] mt-0.5">Muted</div>
                      </div>
                      <div className="text-center">
                        <div>200%</div>
                        <div className="text-[10px] mt-0.5">Vibrant</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                  <Button
                    onClick={downloadHDRImage}
                    size="lg"
                    className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 w-full sm:w-auto text-lg px-8 py-4 rounded-lg"
                    disabled={!hdrImageUrl}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download HDR Image
                  </Button>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  HDR images display with enhanced brightness on compatible
                  screens.
                  <br />
                  If the image looks the same, try Chrome on your phone.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* BlizzardBerry Promotion */}
      <motion.section
        className="py-12 sm:py-16 bg-gradient-to-br from-brand/10 to-brand/5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-2 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">
              Need More Than Just Image Tools?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              BlizzardBerry helps you build AI agents that transform how users
              interact with your website. Give your users an AI that can
              actually take action, not just answer questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="relative group w-full sm:w-auto">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <Button
                  asChild
                  size="lg"
                  className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 w-full sm:w-auto text-lg px-8 py-4 rounded-lg"
                >
                  <Link href="/login">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Try BlizzardBerry Free
                  </Link>
                </Button>
              </div>
              <div className="relative group w-full sm:w-auto">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <Button
                  size="lg"
                  variant="outline"
                  className="relative bg-background text-foreground border-[3px] border-border hover:bg-background/90 w-full sm:w-auto text-lg px-8 py-4 rounded-lg"
                  asChild
                >
                  <Link href="/">Learn More</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
