'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hdrImageUrl, setHdrImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // HDR adjustment controls - default to impressive HDR settings
  const [brightness, setBrightness] = useState(4.0); // Multiply factor
  const [gamma, setGamma] = useState(0.5); // Pow factor
  const [saturation, setSaturation] = useState(200); // Saturation percentage

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

  const convertToHDR = async (file: File) => {
    // Use the current brightness, gamma, and saturation settings
    await convertToHDRWithSettings(file, brightness, gamma, saturation);
  };

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

  // Add debouncing for smooth slider experience
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle slider changes with debouncing
  const handleSliderChange = useCallback(
    (newBrightness?: number, newGamma?: number, newSaturation?: number) => {
      if (!selectedFile || isProcessing) return;

      // Update state immediately for smooth UI
      if (newBrightness !== undefined) setBrightness(newBrightness);
      if (newGamma !== undefined) setGamma(newGamma);
      if (newSaturation !== undefined) setSaturation(newSaturation);

      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer to trigger conversion after user stops dragging
      debounceTimer.current = setTimeout(async () => {
        const brightnessValue = newBrightness ?? brightness;
        const gammaValue = newGamma ?? gamma;
        const saturationValue = newSaturation ?? saturation;
        await convertToHDRWithSettings(
          selectedFile,
          brightnessValue,
          gammaValue,
          saturationValue
        );
      }, 300); // 300ms delay
    },
    [selectedFile, brightness, gamma, saturation, isProcessing]
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Convert with specific settings
  const convertToHDRWithSettings = async (
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
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">HDR Image Converter</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Adds new HDR life into boring old images
        </p>
      </div>

      <div className="grid gap-6">
        {hdrImageUrl ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              ✨ HDR Conversion Complete!
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Original */}
              <div>
                <h4 className="text-md font-medium mb-2">Original</h4>
                <img
                  src={previewUrl}
                  alt="Original"
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>

              {/* HDR Result - Clickable and Draggable */}
              <div>
                <h4 className="text-md font-medium mb-2">HDR Enhanced - Click or drag to replace</h4>
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
                    src={hdrImageUrl}
                    alt="HDR Enhanced"
                    className="w-full h-auto rounded-lg shadow-md"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                      <p className="text-blue-600 font-medium">Drop new image here</p>
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
            </div>

            {/* HDR Controls */}
            <div className="mb-6 space-y-4">
              <h4 className="text-md font-medium">🚀 Unleash HDR Power</h4>

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
                    onChange={(e) =>
                      handleSliderChange(parseFloat(e.target.value), undefined)
                    }
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    disabled={isProcessing}
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
                    onChange={(e) =>
                      handleSliderChange(undefined, parseFloat(e.target.value))
                    }
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    disabled={isProcessing}
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
                    onChange={(e) =>
                      handleSliderChange(
                        undefined,
                        undefined,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full mt-2 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Muted (50%)</span>
                    <span>🌈 VIBRANT (300%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button onClick={downloadHDRImage} size="lg" className="mb-3">
                Download HDR Image
              </Button>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                HDR images display ultra-bright on HDR screens. Try Chrome on
                your phone if it looks the same.
              </p>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p className="text-lg mb-2">
                Drop your image here or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports JPG, PNG, WEBP, and other common image formats
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
              >
                Choose File
              </label>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
