'use client';

import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'agent' | 'user';
  timestamp: Date;
}

export default function NewAgentUIPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI Agent. How can I help you today?",
      sender: 'agent',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  // Calculate dynamic height based on content
  const getExpandedHeight = () => {
    const baseHeight = 120; // Header + input area
    const messageHeight = 40; // Approximate height per message
    const maxHeight = 500;
    const minHeight = 200;

    const contentHeight = baseHeight + messages.length * messageHeight;
    return Math.min(Math.max(contentHeight, minHeight), maxHeight);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ethereal Mist Component Container */}
      <div
        className={`agent-widget ${isExpanded ? 'expanded' : ''}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: isExpanded ? '400px' : '250px',
          height: isExpanded
            ? `${getExpandedHeight()}px`
            : isHovered
              ? '160px'
              : '120px',
          pointerEvents: 'auto',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          transform: 'translateY(0) translateZ(0)', // Force GPU acceleration
          cursor: isExpanded ? 'default' : 'pointer',
          borderRadius: '50px',
          // WebKit-specific fixes
          WebkitTransform: 'translateY(0) translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          willChange: 'transform',
        }}
        onMouseEnter={() => {
          setIsHovered(true);
          setIsExpanded(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsExpanded(false);
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Soft Edge Background Layer with WebKit fixes */}
        <div
          style={{
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            borderRadius: '53px',
            opacity: 0.6,
            filter: 'blur(8px)',
            WebkitFilter: 'blur(8px)',
            overflow: 'hidden',
            // WebKit-specific fixes
            WebkitBackfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0) scale(1.001)', // Slight scale to prevent edge artifacts
            transform: 'translateZ(0) scale(1.001)',
            WebkitMaskImage: '-webkit-radial-gradient(center, white, white)', // Forces compositing
            maskImage: 'radial-gradient(center, white, white)',
          }}
        >
          {/* Gradient background for soft edge */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(255, 69, 0, 0.7), rgba(255, 165, 0, 0.5), rgba(138, 43, 226, 0.4), rgba(0, 191, 255, 0.6), rgba(255, 69, 0, 0.7))',
              backgroundSize: '600% 600%',
              animation: 'gradient 15s ease infinite',
              borderRadius: '53px', // Match parent radius
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
            }}
          />
        </div>

        {/* Main Blurred Mist Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.9,
            filter: 'blur(10px)',
            WebkitFilter: 'blur(10px)',
            borderRadius: '50px',
            overflow: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            WebkitMaskImage: '-webkit-radial-gradient(center, white, white)', // Forces compositing
            maskImage: 'radial-gradient(center, white, white)',
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
              borderRadius: '50px',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
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
              borderRadius: '50px',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
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
              borderRadius: '50px',
              WebkitBackfaceVisibility: 'hidden',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
            }}
          />
        </div>

        {/* Mask overlay to ensure clean edges in Safari */}
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            right: '-5px',
            bottom: '-5px',
            borderRadius: '55px',
            pointerEvents: 'none',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 70%, transparent 100%)',
            maskImage:
              'radial-gradient(ellipse at center, black 70%, transparent 100%)',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: 2,
          }}
        />

        {/* Sharp Text Overlay */}
        <div
          style={{
            position: 'absolute',
            top: isExpanded ? '0' : isHovered ? '50%' : '25%',
            left: isExpanded ? '0' : '50%',
            width: isExpanded ? '100%' : 'auto',
            height: isExpanded ? '100%' : 'auto',
            transform: isExpanded
              ? 'none'
              : isHovered
                ? 'translate(-50%, -50%)'
                : 'translate(-50%, 0)',
            WebkitTransform: isExpanded
              ? 'none'
              : isHovered
                ? 'translate(-50%, -50%)'
                : 'translate(-50%, 0)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            textAlign: isExpanded ? 'left' : 'center',
            zIndex: 10,
            letterSpacing: '0.5px',
            lineHeight: '1.3',
            padding: isExpanded ? '0' : '0 10px',
            maxWidth: isExpanded ? 'none' : '230px',
            transition: 'all 0.3s ease',
            pointerEvents: isExpanded ? 'auto' : 'none',
          }}
          className={`mist-text ${isExpanded || isHovered ? 'expanded' : ''}`}
        >
          {!isExpanded ? (
            <div
              style={{
                transition: 'all 0.3s ease',
                transform: 'translateY(0px)',
              }}
              className="text-content"
            >
              {messages.filter((m) => m.sender === 'agent').slice(-1)[0]?.text}
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      alignSelf:
                        message.sender === 'agent' ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      backgroundColor:
                        message.sender === 'agent'
                          ? 'rgba(255,255,255,0.05)'
                          : 'rgba(255,255,255,0.03)',
                      fontSize: '12px',
                      lineHeight: '1.4',
                    }}
                  >
                    {message.text}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    width: '350px',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputText.trim()) {
                      const newMessage: Message = {
                        id: Date.now().toString(),
                        text: inputText.trim(),
                        sender: 'user',
                        timestamp: new Date(),
                      };
                      setMessages([...messages, newMessage]);
                      setInputText('');
                    }
                  }}
                />
              </div>
            </div>
          )}
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

        .mist-text:not(.expanded) {
          mask-image: linear-gradient(
            to bottom,
            black 0px,
            black 30px,
            transparent 55px
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            black 0px,
            black 30px,
            transparent 55px
          );
          max-height: 55px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .agent-widget.expanded {
            left: 20px !important;
            right: 20px !important;
            width: calc(100vw - 40px) !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
