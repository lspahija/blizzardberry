'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/app/(frontend)/components/ui/button';
import { RetroButton } from '@/app/(frontend)/components/ui/retro-button';
import { Menu, X } from 'lucide-react';

export function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMenuOpen]);

  const handleMenuClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleNavigation = () => {
    handleMenuClose();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur border-b border-border shadow-md px-8 sm:px-16 py-5 pt-6 pb-4 pl-8 pr-8 sm:pl-16 sm:pr-16">
        <div className="max-w-7xl mx-auto w-full flex flex-row items-center justify-between">
          <div className="flex items-center flex-shrink-0 min-w-[160px]">
            <Link href="/" className="flex items-center">
              <Image
                src="/image/logo.png"
                alt="BlizzardBerry Logo"
                width={60}
                height={60}
                className="object-contain"
                unoptimized={true}
              />
              <span className="text-3xl font-bold tracking-tight">
                <span>Blizzard</span>
                <span className="text-brand">Berry</span>
              </span>
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-10 flex-1 justify-center">
            <Link
              href="/docs"
              className="text-lg font-medium text-foreground hover:-translate-y-0.5 transition-transform"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="text-lg font-medium text-foreground hover:-translate-y-0.5 transition-transform"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-lg font-medium text-foreground hover:-translate-y-0.5 transition-transform"
            >
              Contact
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-6 min-w-[160px] justify-end">
            <RetroButton
              variant="outline"
              className="bg-background text-foreground hover:bg-background/90 font-medium px-6 h-10"
              asChild
              shadowColor="foreground"
            >
              <Link href="/login">Sign In</Link>
            </RetroButton>
            <RetroButton
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium px-6 h-10"
              asChild
              shadowColor="foreground"
              id="try-for-free-btn"
            >
              <Link href="/login">Try For Free</Link>
            </RetroButton>
          </div>
          <div className="flex lg:hidden items-center">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="icon"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Quirky yellow line pointing to Try For Free button */}
      <div className="hidden lg:block fixed top-28 right-16 z-[60] pointer-events-none">
        <div className="relative">
          {/* Message bubble positioned down and right of button */}
          <div
            className="text-yellow-400 px-3 py-2 text-lg font-bold transform -rotate-12 whitespace-nowrap"
            style={{ fontFamily: 'Comic Sans MS, cursive, sans-serif' }}
          >
            No credit card required!
          </div>
          {/* Curved yellow line pointing up and left to the Try For Free button */}
          <svg
            width="120"
            height="80"
            className="absolute -top-12 -left-8"
            viewBox="0 0 120 80"
          >
            <path
              d="M80 60 Q60 35 40 20"
              stroke="#fbbf24"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
            <polygon
              points="45,17 35,20 45,23"
              fill="#fbbf24"
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* Mobile menu overlay with smooth transitions */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleMenuClose}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        <div
          className={`absolute top-[75px] left-0 right-0 bottom-0 bg-background/95 backdrop-blur-sm px-4 py-6 space-y-4 transition-transform duration-200 ${
            isMenuOpen && !isClosing ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href="/docs"
            className="block text-center text-foreground hover:-translate-y-0.5 transition-transform mt-4"
            onClick={handleNavigation}
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="block text-center text-foreground hover:-translate-y-0.5 transition-transform"
            onClick={handleNavigation}
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="block text-center text-foreground hover:-translate-y-0.5 transition-transform"
            onClick={handleNavigation}
          >
            Contact
          </Link>
          <div className="flex flex-col space-y-3 pt-6 mt-4 border-t border-border">
            <RetroButton
              variant="outline"
              className="bg-background text-foreground hover:bg-background/90 w-full font-medium h-10"
              asChild
              shadowColor="foreground"
            >
              <Link href="/login" onClick={handleNavigation}>
                Sign In
              </Link>
            </RetroButton>
            <RetroButton
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full font-medium h-10"
              asChild
              shadowColor="foreground"
            >
              <Link href="/login" onClick={handleNavigation}>
                Try For Free
              </Link>
            </RetroButton>
          </div>
        </div>
      </div>
    </>
  );
}
