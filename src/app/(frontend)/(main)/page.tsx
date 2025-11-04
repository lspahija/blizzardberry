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
import {
  Code,
  Rocket,
  Zap,
  FileText,
  MessageSquare,
  Users,
  Shield,
  CheckCircle2,
  Play,
  Globe,
} from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import HeroVideo from '@/app/(frontend)/components/HeroVideo';
import { useVideoIntersection } from '@/app/(frontend)/hooks/useVideoIntersection';
import ProxyDemo from '@/app/(frontend)/components/ProxyDemo';

export default function LandingPage() {
  const [selectedVideo, setSelectedVideo] = useState('order-cancellation');
  const [demoVideoRef, setDemoVideoRef] = useState<HTMLVideoElement | null>(null);
  const { containerRef: demoVideoContainerRef } = useVideoIntersection(demoVideoRef);

  const demoVideos = [
    {
      id: 'order-cancellation',
      title: 'Order Cancellation',
      description: 'Cancel orders instantly',
      videoSrc: '/demo-order-cancellation-video.mp4',
      color: 'blue',
      activeClasses: 'border-blue-500 bg-blue-500/10 shadow-lg',
      inactiveClasses:
        'border-border bg-card hover:border-blue-500/50 hover:bg-blue-500/5',
      numberActiveClasses: 'bg-blue-500 text-white',
      numberInactiveClasses: 'bg-muted text-muted-foreground',
    },
    {
      id: 'subscription-update',
      title: 'Subscription Update',
      description: 'Manage subscriptions',
      videoSrc: '/demo-subscription-update-video.mp4',
      color: 'cyan',
      activeClasses: 'border-cyan-500 bg-cyan-500/10 shadow-lg',
      inactiveClasses:
        'border-border bg-card hover:border-cyan-500/50 hover:bg-cyan-500/5',
      numberActiveClasses: 'bg-cyan-500 text-white',
      numberInactiveClasses: 'bg-muted text-muted-foreground',
    },
    {
      id: 'address-update',
      title: 'Address Update',
      description: 'Update user information',
      videoSrc: '/demo-address-update-video.mp4',
      color: 'teal',
      activeClasses: 'border-teal-500 bg-teal-500/10 shadow-lg',
      inactiveClasses:
        'border-border bg-card hover:border-teal-500/50 hover:bg-teal-500/5',
      numberActiveClasses: 'bg-teal-500 text-white',
      numberInactiveClasses: 'bg-muted text-muted-foreground',
    },
  ];

  // Auto-cycle through videos when each video ends
  const handleVideoEnded = () => {
    setSelectedVideo((currentVideo) => {
      const currentIndex = demoVideos.findIndex(
        (video) => video.id === currentVideo
      );
      const nextIndex = (currentIndex + 1) % demoVideos.length;
      return demoVideos[nextIndex].id;
    });
  };

  const handleHeroCtaClick = () => {
    posthog.capture('homepage_hero_cta_clicked', {
      cta_text: 'Try The Demo',
      section: 'hero',
    });
  };

  const handleContactCtaClick = () => {
    posthog.capture('homepage_contact_cta_clicked', {
      cta_text: 'Talk With Us',
      section: 'hero',
    });
  };

  const handleFinalCtaClick = () => {
    posthog.capture('homepage_final_cta_clicked', {
      cta_text: 'Create an Agent',
      section: 'cta',
    });
  };

  const containerVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, staggerChildren: 0.1 },
      },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
      },
    }),
    []
  );

  const cardVariants = useMemo(
    () => ({
      hidden: { opacity: 0, scale: 0.98 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: 'easeOut' },
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Gradient Background */}
      <motion.div
        className="bg-gradient-to-br from-brand/10 to-brand/5 border-b border-border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12 sm:pt-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-8 lg:gap-16 items-center min-h-[300px] sm:min-h-[400px]">
            {/* Left Column - Text Content */}
            <div className="relative text-center lg:text-left">
              <svg
                className="hidden lg:block absolute h-auto w-16 lg:w-20 flex-shrink-0 p-2 left-0 -top-8 lg:-top-16 -translate-x-4 lg:-translate-x-8"
                viewBox="0 0 91 98"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="m35.878 14.162 1.333-5.369 1.933 5.183c4.47 11.982 14.036 21.085 25.828 24.467l5.42 1.555-5.209 2.16c-11.332 4.697-19.806 14.826-22.888 27.237l-1.333 5.369-1.933-5.183C34.56 57.599 24.993 48.496 13.201 45.114l-5.42-1.555 5.21-2.16c11.331-4.697 19.805-14.826 22.887-27.237Z"
                  className="fill-brand stroke-foreground"
                  strokeWidth="3.445"
                ></path>
                <path
                  d="M79.653 5.729c-2.436 5.323-9.515 15.25-18.341 12.374m9.197 16.336c2.6-5.851 10.008-16.834 18.842-13.956m-9.738-15.07c-.374 3.787 1.076 12.078 9.869 14.943M70.61 34.6c.503-4.21-.69-13.346-9.49-16.214M14.922 65.967c1.338 5.677 6.372 16.756 15.808 15.659M18.21 95.832c-1.392-6.226-6.54-18.404-15.984-17.305m12.85-12.892c-.41 3.771-3.576 11.588-12.968 12.681M18.025 96c.367-4.2 3.453-12.905 12.854-14"
                  className="stroke-foreground"
                  fill="none"
                  strokeWidth="2.548"
                  strokeLinecap="round"
                ></path>
              </svg>

              <motion.h1
                className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter mb-6 sm:mb-4 z-10 leading-tight"
                variants={itemVariants}
              >
                Give Your Users an{' '}
                <span className="text-brand whitespace-nowrap">AI Agent</span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-6 lg:mb-8 lg:max-w-lg z-10 leading-relaxed"
                variants={itemVariants}
              >
                Add an agent to your web app with a single snippet of JavaScript
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:space-x-4 z-10 w-full sm:w-auto px-12 sm:px-0"
                variants={itemVariants}
              >
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                  <Button
                    size="lg"
                    className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-lg"
                    asChild
                    onClick={handleHeroCtaClick}
                  >
                    <Link href="https://demo.blizzardberry.com/">
                      <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Try The Demo
                    </Link>
                  </Button>
                </div>
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="relative bg-background text-foreground border-[3px] border-border hover:bg-background/90 w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-lg"
                    asChild
                    onClick={handleContactCtaClick}
                  >
                    <Link href="/contact">Talk With Us</Link>
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Video Container */}
            <div className="relative flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-3xl lg:max-w-4xl">
                {/* Decorative SVG for right side */}
                <svg
                  className="hidden lg:block absolute w-16 lg:w-20 h-auto flex-shrink-0 -bottom-6 right-0 translate-x-6 translate-y-6 lg:translate-x-12 lg:translate-y-8"
                  viewBox="0 0 92 80"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
                    className="fill-primary stroke-foreground"
                    strokeWidth="2.868"
                  ></path>
                  <path
                    d="M75.062 40.108c1.07 5.255 1.072 16.52-7.472 19.54m7.422-19.682c1.836 2.965 7.643 8.14 16.187 5.121-8.544 3.02-8.207 15.23-6.971 20.957-1.97-3.343-8.044-9.274-16.588-6.254M12.054 28.012c1.34-5.22 6.126-15.4 14.554-14.369M12.035 28.162c-.274-3.487-2.93-10.719-11.358-11.75C9.104 17.443 14.013 6.262 15.414.542c.226 3.888 2.784 11.92 11.212 12.95"
                    className="stroke-foreground"
                    fill="none"
                    strokeWidth="2.319"
                    strokeLinecap="round"
                  ></path>
                </svg>

                {/* Video Component */}
                <HeroVideo videoSrc="/new-demo-video.mp4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Proxy Demo Section */}
      <motion.section
        className="py-12 sm:py-16 bg-background"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: '-10px' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <ProxyDemo />
        </div>
      </motion.section>

      <motion.section
        className="py-12 sm:py-16 bg-muted/30"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: '-10px' }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-2">
          <motion.div
            className="text-center mb-10 sm:mb-14"
            variants={itemVariants}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              A new kind of user interface
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Users want to interact with your app using natural language. Our
              AI agent translates conversations into actions.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
            {/* Custom Actions */}
            <div className="lg:col-span-7">
              <Card className="group border-2 border-border/30 bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:border-brand/30 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="px-6 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8 xl:px-14 xl:py-10 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                    <div className="bg-brand/15 p-3 sm:p-4 rounded-3xl self-start">
                      <Zap className="h-8 sm:h-10 w-8 sm:w-10 text-brand" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                        Turn Conversations Into Actions
                      </h3>
                      <p className="text-lg sm:text-xl text-muted-foreground/80 mb-6 sm:mb-8 font-medium leading-relaxed">
                        Don&apos;t just chat with users—actually help them
                        complete tasks. From upgrading accounts to processing
                        orders, your agent does the work.
                      </p>

                      {/* Demo conversation */}
                      <div className="bg-muted/50 rounded-2xl p-3 sm:p-4 space-y-3 mb-4 sm:mb-6">
                        <div className="flex items-start space-x-2">
                          <div className="bg-blue-500 text-white rounded-full p-1 flex-shrink-0">
                            <Users className="h-3 w-3" />
                          </div>
                          <div className="bg-background rounded-lg px-3 py-2 max-w-[180px] sm:max-w-[200px] border-[2px] border-border">
                            <p className="text-xs sm:text-sm">
                              Upgrade my account to Pro plan
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 justify-end">
                          <div className="bg-brand text-primary-foreground rounded-lg px-3 py-2 max-w-[200px] sm:max-w-[250px]">
                            <p className="text-xs sm:text-sm">
                              Processing upgrade... Done! You now have Pro
                              access.
                            </p>
                          </div>
                          <div className="bg-brand text-primary-foreground rounded-full p-1 flex-shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground/80 font-medium">
                        Supports client-side actions, server-side integration,
                        API orchestration, and workflow automation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4 sm:space-y-6">
              <Card className="group border-3 border-border/50 bg-gradient-to-br from-slate-50/50 via-card to-slate-50/30 dark:from-slate-950/20 dark:via-card dark:to-slate-900/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:border-slate-400/40 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start space-x-5 mb-5">
                    <div className="bg-slate-100 dark:bg-slate-900/30 p-3 rounded-2xl group-hover:bg-slate-200 dark:group-hover:bg-slate-800/40 transition-colors duration-300">
                      <MessageSquare className="h-7 w-7 text-slate-600 dark:text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors duration-300">
                        Natural Language
                      </h4>
                      <p className="text-base sm:text-lg text-muted-foreground/90 font-medium leading-relaxed">
                        Users interact naturally - no commands to learn, no
                        complex interfaces to master
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-medium text-sm">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                    <span>Intuitive Conversations</span>
                  </div>
                </div>
              </Card>

              <Card className="group border-3 border-border/50 bg-gradient-to-br from-cyan-50/50 via-card to-cyan-50/30 dark:from-cyan-950/20 dark:via-card dark:to-cyan-900/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:border-cyan-400/40 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start space-x-5 mb-5">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-3 rounded-2xl group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/40 transition-colors duration-300">
                      <Rocket className="h-7 w-7 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors duration-300">
                        Real-time
                      </h4>
                      <p className="text-base sm:text-lg text-muted-foreground/90 font-medium leading-relaxed">
                        Instant responses and live interactions with millisecond
                        response times
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-medium text-sm">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                    <span>Lightning Fast</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Interactive Demo Video Section */}
          <motion.div
            className="mt-10 sm:mt-12 mb-10 sm:mb-12"
            variants={itemVariants}
          >
            <div className="text-center mb-10 sm:mb-14">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                Experience the Power of AI Agents
              </h3>
              <p className="text-lg sm:text-xl text-muted-foreground">
                From customer support to e-commerce, see how our AI agents are
                revolutionizing user experiences across industries.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Video Player */}
              <div className="lg:col-span-8">
                <div className="w-full">
                  <div 
                    ref={demoVideoContainerRef}
                    className="relative aspect-[1468/1080] rounded-2xl border-[3px] border-border shadow-2xl overflow-hidden"
                  >
                    <video
                      key={selectedVideo}
                      ref={setDemoVideoRef}
                      className="w-full h-full object-cover object-center"
                      playsInline
                      preload="metadata"
                      muted
                      onEnded={handleVideoEnded}
                    >
                      <source
                        src={
                          demoVideos.find((video) => video.id === selectedVideo)
                            ?.videoSrc
                        }
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>

              {/* Video Selector Tabs */}
              <div className="lg:col-span-4">
                <div className="space-y-4">
                  {demoVideos.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video.id)}
                      className={`w-full text-left p-3 sm:p-4 lg:p-6 rounded-xl border-2 transition-all duration-200 ${
                        selectedVideo === video.id
                          ? video.activeClasses
                          : video.inactiveClasses
                      }`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all duration-200 shadow-sm ${
                            selectedVideo === video.id
                              ? video.numberActiveClasses +
                                ' shadow-md scale-105'
                              : video.numberInactiveClasses + ' hover:scale-105'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-foreground">
                            {video.title}
                          </h4>
                          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                            {video.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Knowledge Base - Reversed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
              <Card className="group border-3 border-border/50 bg-gradient-to-br from-teal-50/50 via-card to-teal-50/30 dark:from-teal-950/20 dark:via-card dark:to-teal-900/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:border-teal-400/40 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start space-x-5 mb-5">
                    <div className="bg-teal-100 dark:bg-teal-900/30 p-3 rounded-2xl group-hover:bg-teal-200 dark:group-hover:bg-teal-800/40 transition-colors duration-300">
                      <Users className="h-7 w-7 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors duration-300">
                        User Context
                      </h4>
                      <p className="text-base sm:text-lg text-muted-foreground/90 font-medium leading-relaxed">
                        Personalized experiences based on user data,
                        preferences, and interaction history
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-teal-600 dark:text-teal-400 font-medium text-sm">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                    <span>Smart Personalization</span>
                  </div>
                </div>
              </Card>

              <Card className="group border-3 border-border/50 bg-gradient-to-br from-indigo-50/50 via-card to-indigo-50/30 dark:from-indigo-950/20 dark:via-card dark:to-indigo-900/10 rounded-2xl p-6 sm:p-8 transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-2xl hover:border-indigo-400/40 hover:-translate-y-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start space-x-5 mb-5">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-2xl group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/40 transition-colors duration-300">
                      <Shield className="h-7 w-7 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors duration-300">
                        Secure & Private
                      </h4>
                      <p className="text-base sm:text-lg text-muted-foreground/90 font-medium leading-relaxed">
                        End-to-end encrypted communications with
                        enterprise-grade data protection
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                    <span>Bank-Level Security</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <Card className="group border-2 border-border/30 bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:border-blue-400/40 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="px-6 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8 xl:px-14 xl:py-10 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-4 sm:mb-6">
                    <div className="bg-blue-500/15 p-3 sm:p-4 rounded-3xl self-start">
                      <FileText className="h-8 sm:h-10 w-8 sm:w-10 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                        Instant Product Expert
                      </h3>
                      <p className="text-lg sm:text-xl text-muted-foreground/80 mb-6 sm:mb-8 font-medium leading-relaxed">
                        Upload your docs once, get an AI expert forever. Your
                        agent learns everything about your product and provides
                        accurate, contextual answers.
                      </p>

                      {/* Knowledge base demo */}
                      <div className="bg-muted/50 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Knowledge Base</span>
                          <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                            1,247 docs
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>API Documentation</span>
                            <span className="text-green-600">✓ Indexed</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>User Guide</span>
                            <span className="text-green-600">✓ Indexed</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>FAQ Database</span>
                            <span className="text-green-600">✓ Indexed</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground/80 font-medium">
                        Features advanced document processing, smart search,
                        auto-updates, and context awareness.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Use Cases Section - Industry Examples */}
      <motion.section
        className="py-12 sm:py-16 bg-gradient-to-b from-muted/15 to-background overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: '-20px' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center mb-16 sm:mb-20"
            variants={itemVariants}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 sm:mb-8 leading-tight">
              Transform Your UX
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground/80 max-w-4xl mx-auto font-medium">
              Offer each of your users their own human-like assistant.
            </p>
          </motion.div>

          <div className="flex justify-center mb-20">
            {/* E-commerce Demo Video */}
            <motion.div className="group" variants={itemVariants}>
              <div className="relative w-full max-w-2xl lg:max-w-3xl scale-105">
                <HeroVideo videoSrc="/demo-ecommerce-shopping-video.mp4" />
              </div>
            </motion.div>
          </div>

          {/* Simple Impact Cards - Inspired by Docs Page */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            variants={itemVariants}
          >
            {[
              {
                icon: Zap,
                title: 'Zero Wait Time',
                description:
                  'Users get answers and complete tasks without waiting for human support',
              },
              {
                icon: Globe,
                title: 'Available 24/7',
                description:
                  'Never miss a customer inquiry, regardless of time zone or business hours',
              },
              {
                icon: Rocket,
                title: 'More Conversions',
                description:
                  'Turn casual browsers into engaged users who complete their goals',
              },
            ].map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl hover:-translate-y-2">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-6 w-6 text-brand" />
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-base sm:text-base text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-12 sm:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: '-30px' }}
      >
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-2 text-center">
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 sm:mb-8 leading-tight">
              Ready to Transform Your Web App?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 sm:mb-10">
              Create your first AI agent in minutes and transform how users
              interact with your website.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative group w-full sm:w-auto">
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                <Button
                  asChild
                  size="lg"
                  className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-lg"
                  onClick={handleFinalCtaClick}
                >
                  <Link href="/login">
                    <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Create an Agent
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
