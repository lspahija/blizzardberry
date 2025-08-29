'use client';

import { useState } from 'react';

export default function NewAgentUIPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Ethereal Mist Component Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '250px',
          height: isExpanded || isHovered ? '160px' : '120px',
          pointerEvents: 'auto',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          transform:
            isExpanded || isHovered ? 'translateY(-40px)' : 'translateY(0)',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Blurred Mist Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.9,
            filter: 'blur(10px)',
            borderRadius: '50px',
            overflow: 'hidden',
          }}
        >
          {/* First gradient layer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(255, 69, 0, 0.6), rgba(255, 165, 0, 0.4), rgba(138, 43, 226, 0.3), rgba(0, 191, 255, 0.5), rgba(255, 69, 0, 0.6))',
              backgroundSize: '600% 600%',
              animation: 'gradient 15s ease infinite',
            }}
          />
          {/* Second gradient layer for more flow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(-45deg, rgba(0, 191, 255, 0.5), rgba(138, 43, 226, 0.3), rgba(255, 165, 0, 0.4), rgba(255, 69, 0, 0.6), rgba(0, 191, 255, 0.5))',
              backgroundSize: '600% 600%',
              animation: 'gradientReverse 20s ease infinite',
              opacity: 0.6,
              mixBlendMode: 'screen',
            }}
          />
          {/* Shimmering slivers */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.2) 50%, transparent 60%)',
              backgroundSize: '200% 200%',
              animation: 'shimmer 10s linear infinite',
              mixBlendMode: 'overlay',
              opacity: 0.3,
            }}
          />
        </div>
        {/* Sharp Text Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            textAlign: 'center',
            zIndex: 10,
            letterSpacing: '0.5px',
            lineHeight: '1.3',
            padding: '0 10px',
            maxWidth: '230px',
            overflow: isExpanded || isHovered ? 'visible' : 'hidden',
            height: isExpanded || isHovered ? 'auto' : '28px',
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
          }}
          className={`mist-text ${isExpanded || isHovered ? 'expanded' : ''}`}
        >
          <div
            style={{
              transition: 'all 0.3s ease',
              transform:
                isExpanded || isHovered
                  ? 'translateY(-15px)'
                  : 'translateY(0px)',
            }}
            className="text-content"
          >
            Hi! I'm your AI Agent
            <br />
            How can I help you today?
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }

        @keyframes gradientReverse {
          0% {
            background-position: 100% 100%;
          }
          50% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 100% 100%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% -200%;
          }
          100% {
            background-position: 200% 200%;
          }
        }

        .mist-text:hover {
          height: 60px !important;
        }

        .mist-text:hover .text-content {
          transform: translateY(-5px);
        }

        .mist-text.expanded {
          height: 60px !important;
        }

        .mist-text.expanded .text-content {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}