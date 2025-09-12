'use client';

import { useEffect, useRef, useState } from 'react';

interface UseVideoIntersectionOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useVideoIntersection(
  videoRef: HTMLVideoElement | null,
  options: UseVideoIntersectionOptions = {}
) {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  
  const { threshold = 0.6, rootMargin = '-50px 0px' } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    // Mobile-friendly intersection observer configuration
    const observerOptions = {
      threshold,
      rootMargin,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        setIsInView(isVisible);
        
        if (videoRef) {
          if (isVisible) {
            videoRef.play().catch(() => {
              // Ignore autoplay failures (browser restrictions)
            });
          } else {
            videoRef.pause();
          }
        }
      });
    }, observerOptions);

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [videoRef, threshold, rootMargin]);

  // Handle video ref changes
  useEffect(() => {
    if (videoRef && isInView) {
      videoRef.play().catch(() => {
        // Ignore autoplay failures (browser restrictions)
      });
    }
  }, [videoRef, isInView]);

  return { containerRef, isInView };
}