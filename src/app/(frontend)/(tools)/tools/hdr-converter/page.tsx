'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Download, Zap, Sparkles, ArrowRight } from 'lucide-react';

// Cache ImageMagick initialization
let magickInitPromise: Promise<{
  ImageMagick: any;
  MagickFormat: any;
  ColorSpace: any;
  EvaluateOperator: any;
  Channels: any;
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

  // HDR adjustment controls - default to higher brightness
  const [brightness, setBrightness] = useState(2.5); // Multiply factor
  const [gamma, setGamma] = useState(0.7); // Pow factor
  const [saturation, setSaturation] = useState(160); // Saturation percentage

  // Debounce timer for HDR conversion
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  // Track current conversion to cancel if needed
  const currentConversion = useRef<AbortController | null>(null);

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
  const convertToHDRWithSettings = useCallback(async (
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
        img.evaluate(Channels.All, EvaluateOperator.Multiply, brightnessValue);

        // Equivalent to: -evaluate Pow {gammaValue}
        img.evaluate(Channels.All, EvaluateOperator.Pow, gammaValue);

        // Equivalent to: -colorspace sRGB
        img.colorSpace = ColorSpace.sRGB;

        // Apply saturation control - enhanced color saturation
        if (saturationValue !== 150) {
          // Only apply if different from default 150%
          const saturationFactor = saturationValue / 150.0;
          // Use a simple RGB enhancement approach for vibrancy
          // This multiplies color differences from gray to enhance saturation
          img.evaluate(
            Channels.Red,
            EvaluateOperator.Multiply,
            0.5 + saturationFactor * 0.5
          );
          img.evaluate(
            Channels.Green,
            EvaluateOperator.Multiply,
            0.5 + saturationFactor * 0.5
          );
          img.evaluate(
            Channels.Blue,
            EvaluateOperator.Multiply,
            0.5 + saturationFactor * 0.5
          );
          img.evaluate(
            Channels.All,
            EvaluateOperator.Add,
            saturationFactor * 0.2
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
  }, []);

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


  // Handle slider input with debounced processing
  const handleSliderInput = useCallback(
    (newBrightness?: number, newGamma?: number, newSaturation?: number) => {
      // Update UI state immediately for smooth slider movement
      if (newBrightness !== undefined) setBrightness(newBrightness);
      if (newGamma !== undefined) setGamma(newGamma);
      if (newSaturation !== undefined) setSaturation(newSaturation);

      // Cancel any existing conversion and timer
      if (currentConversion.current) {
        currentConversion.current.abort();
        currentConversion.current = null;
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Schedule HDR conversion with debouncing
      if (selectedFile) {
        debounceTimer.current = setTimeout(() => {
          // Create new AbortController for this conversion
          const controller = new AbortController();
          currentConversion.current = controller;
          
          const brightnessValue = newBrightness ?? brightness;
          const gammaValue = newGamma ?? gamma;
          const saturationValue = newSaturation ?? saturation;
          void convertToHDRWithSettings(
            selectedFile,
            brightnessValue,
            gammaValue,
            saturationValue
          ).finally(() => {
            // Clear reference when done
            if (currentConversion.current === controller) {
              currentConversion.current = null;
            }
          });
        }, 150); // Reduced debounce time since we're now properly cancelling
      }
    },
    [selectedFile, brightness, gamma, saturation, convertToHDRWithSettings]
  );

  // Handle slider change (when user releases slider) - immediate processing
  const handleSliderChange = useCallback(
    (newBrightness?: number, newGamma?: number, newSaturation?: number) => {
      // Cancel any existing conversion and timer
      if (currentConversion.current) {
        currentConversion.current.abort();
        currentConversion.current = null;
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Process HDR conversion immediately when released
      if (selectedFile) {
        const controller = new AbortController();
        currentConversion.current = controller;
        
        const brightnessValue = newBrightness ?? brightness;
        const gammaValue = newGamma ?? gamma;
        const saturationValue = newSaturation ?? saturation;
        void convertToHDRWithSettings(
          selectedFile,
          brightnessValue,
          gammaValue,
          saturationValue
        ).finally(() => {
          // Clear reference when done
          if (currentConversion.current === controller) {
            currentConversion.current = null;
          }
        });
      }
    },
    [selectedFile, brightness, gamma, saturation, convertToHDRWithSettings]
  );

  // Cleanup timer and conversions on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (currentConversion.current) {
        currentConversion.current.abort();
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
          <motion.div className="text-center mb-8" variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 leading-tight">
              HDR Image Converter
            </h1>
            <p className="text-lg text-muted-foreground">
              Convert images to HDR format with enhanced brightness and color range
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-brand" />
                <h3 className="text-xl sm:text-2xl font-bold">
                  HDR Converter - {hdrImageUrl ? 'Ready!' : 'Loading example...'}
                </h3>
              </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Original - Clickable and Draggable */}
            <div>
              <h4 className="text-md font-medium mb-2">
                Original - Click or drag to replace
              </h4>
              <div
                className={`relative cursor-pointer transition-all duration-200 ${
                  isDragOver
                    ? 'ring-2 ring-blue-500 ring-opacity-50'
                    : 'hover:ring-2 hover:ring-gray-300'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <img
                  src={previewUrl || undefined}
                  alt="Original"
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                {isDragOver && (
                  <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                    <p className="text-blue-600 font-medium">
                      Drop new image here
                    </p>
                  </div>
                )}
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
              <h4 className="text-md font-medium mb-2">
                HDR Enhanced
              </h4>
              <div
                className={`${!hdrImageUrl ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                style={{ minHeight: '200px' }}
              >
                {hdrImageUrl ? (
                  <img
                    src={hdrImageUrl}
                    alt="HDR Enhanced"
                    className="w-full h-auto rounded-lg shadow-md"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[200px] text-gray-500">
                    {isProcessing
                      ? 'Converting to HDR...'
                      : 'HDR will appear here'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* HDR Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-5 w-5 text-brand" />
              <h4 className="text-lg font-bold">Unleash HDR Power</h4>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Brightness Control */}
              <div>
                <Label htmlFor="brightness" className="text-sm font-medium">
                  Brightness: {brightness.toFixed(1)}x
                </Label>
                <input
                  id="brightness"
                  type="range"
                  min="0.5"
                  max="7.0"
                  step="0.1"
                  value={brightness}
                  onInput={(e) =>
                    handleSliderInput(parseFloat((e.target as HTMLInputElement).value), undefined, undefined)
                  }
                  onChange={(e) =>
                    handleSliderChange(parseFloat(e.target.value), undefined, undefined)
                  }
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Dark (0.5x)</span>
                  <span>🌟 ULTRA BRIGHT (7x)</span>
                </div>
              </div>

              {/* Gamma Control */}
              <div>
                <Label htmlFor="gamma" className="text-sm font-medium">
                  Gamma: {gamma.toFixed(2)}
                </Label>
                <input
                  id="gamma"
                  type="range"
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={gamma}
                  onInput={(e) =>
                    handleSliderInput(undefined, parseFloat((e.target as HTMLInputElement).value), undefined)
                  }
                  onChange={(e) =>
                    handleSliderChange(undefined, parseFloat(e.target.value), undefined)
                  }
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>🔥 INSANE (0.1)</span>
                  <span>Flat (2.0)</span>
                </div>
              </div>

              {/* Saturation Control */}
              <div>
                <Label htmlFor="saturation" className="text-sm font-medium">
                  Saturation: {saturation}%
                </Label>
                <input
                  id="saturation"
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={saturation}
                  onInput={(e) =>
                    handleSliderInput(undefined, undefined, parseInt((e.target as HTMLInputElement).value))
                  }
                  onChange={(e) =>
                    handleSliderChange(undefined, undefined, parseInt(e.target.value))
                  }
                  className="w-full mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Muted (50%)</span>
                  <span>🌈 VIBRANT (300%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="relative group w-full sm:w-auto inline-block mb-4">
              <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
              <Button
                onClick={downloadHDRImage}
                size="lg"
                className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 text-lg px-8 py-4 rounded-lg"
                disabled={!hdrImageUrl}
              >
                <Download className="mr-2 h-4 w-4" />
                Download HDR Image
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              💡 HDR images display ultra-bright on HDR screens. Try viewing on your phone for the full effect!
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
              BlizzardBerry helps you build AI agents that transform how users interact with your website. Give your users an AI that can actually take action, not just answer questions.
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
