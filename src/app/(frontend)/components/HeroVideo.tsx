'use client';

import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { useState } from 'react';

interface HeroVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  className?: string;
}

export default function HeroVideo({ 
  videoSrc, 
  posterSrc, 
  className = "" 
}: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const togglePlay = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause();
      } else {
        videoRef.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!videoSrc) {
    // Placeholder when no video is provided
    return (
      <motion.div
        className={`relative aspect-[13/10] bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border-[3px] border-border shadow-2xl overflow-hidden ${className}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/5 to-brand/10">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-brand/20 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-brand" />
            </div>
            <p className="text-muted-foreground/60 text-lg font-medium">
              Demo Video Coming Soon
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`relative aspect-[13/10] rounded-2xl border-[2px] border-border shadow-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <video
        ref={setVideoRef}
        className="w-full h-full object-cover scale-[1.35] -translate-y-1"
        poster={posterSrc}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        playsInline
        preload="metadata"
        autoPlay
        muted
        loop
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom Play/Pause Overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        onClick={togglePlay}
      >
        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
          {isPlaying ? (
            <Pause className="w-8 h-8 text-gray-800" />
          ) : (
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {!videoRef && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
}