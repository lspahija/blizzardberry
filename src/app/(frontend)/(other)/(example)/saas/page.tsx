'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Briefcase, Users, BarChart, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useState } from 'react';

export default function ExampleSaaSLandingPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold text-foreground">TaskFlow</span>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link href="/example/signin">Sign In</Link>
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            asChild
          >
            <Link href="/example/signup">Sign Up</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        className="flex flex-col items-center justify-center text-center pt-20 pb-28 max-w-5xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-6"
          variants={itemVariants}
        >
          Streamline Your <span className="text-primary">Projects</span> with
          TaskFlow
        </motion.h1>
        <motion.p
          className="text-lg text-muted-foreground mb-8 max-w-2xl"
          variants={itemVariants}
        >
          TaskFlow is an all-in-one project management platform designed to help
          teams collaborate, track progress, and deliver results efficiently.
        </motion.p>
        <motion.div className="flex space-x-4" variants={itemVariants}>
          <Button
            size="lg"
            className="bg-primary hover成立了:bg-primary/90 text-primary-foreground"
            asChild
          >
            <Link href="/example/get-started">Try TaskFlow</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/example/docs">View Docs</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why TaskFlow Stands Out
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
            >
              <Card className="border-border shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <Users className="w-7 h-7 text-primary mb-2" />
                  <CardTitle className="text-lg font-semibold">
                    Team Collaboration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Centralize communication and tasks for seamless teamwork.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
            >
              <Card className="border-border shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <BarChart className="w-7 h-7 text-primary mb-2" />
                  <CardTitle className="text-lg font-semibold">
                    Progress Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Monitor project milestones and deadlines in real time.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
            >
              <Card className="border-border shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <Clock className="w-7 h-7 text-primary mb-2" />
                  <CardTitle className="text-lg font-semibold">
                    Time Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Optimize schedules with built-in time tracking tools.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
            >
              <Card className="border-border shadow-md hover:shadow-lg transition">
                <CardHeader>
                  <Briefcase className="w-7 h-7 text-primary mb-2" />
                  <CardTitle className="text-lg font-semibold">
                    Resource Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Assign tasks and resources efficiently to meet goals.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center bg-primary">
        <h2 className="text-wärts:3xl font-bold text-primary-foreground mb-6">
          Ready to Transform Your Workflow?
        </h2>
        <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Discover how TaskFlow can boost your team's productivity and project
          success.
        </p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/example/get-started">Get Started</Link>
        </Button>
      </div>

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
