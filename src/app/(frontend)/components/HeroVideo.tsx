'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { useVideoIntersection } from '@/app/(frontend)/hooks/useVideoIntersection';

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
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  // Hero videos need lower threshold since they're at top of page
  const { containerRef } = useVideoIntersection(videoRef, { 
    threshold: 0.3, // Only need 30% visible for hero videos
    rootMargin: '0px' // No margin buffer for hero videos
  });

  if (!videoSrc) {
    // Placeholder when no video is provided
    return (
      <motion.div
        className={`relative aspect-[1468/1080] bg-gradient-to-br from-muted/30 to-muted/50 rounded-2xl border-[3px] border-border shadow-2xl overflow-hidden ${className}`}
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
      ref={containerRef}
      className={`relative aspect-[1468/1080] rounded-2xl border-[3px] border-border shadow-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <video
        ref={setVideoRef}
        className="w-full h-full object-cover object-center"
        poster={posterSrc}
        playsInline
        preload="metadata"
        muted
        loop
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      

      {/* Loading indicator */}
      {!videoRef && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
}