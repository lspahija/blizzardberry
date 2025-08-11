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
import { useMemo } from 'react';

export default function LandingPage() {

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  }), []);

  const cardVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  }), []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Gradient Background */}
      <motion.div
        className="bg-gradient-to-br from-brand/10 to-brand/5 border-b border-border"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="relative flex flex-col items-center justify-center text-center pt-16 pb-24 max-w-4xl mx-auto px-6 sm:px-8 lg:px-2">
          <svg
            className="hidden lg:block absolute h-auto w-16 lg:w-20 flex-shrink-0 p-2 left-0 translate-y-20 lg:-translate-y-42 -translate-x-4 lg:-translate-x-8 xl:-translate-x-20"
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
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter mb-6 z-10 leading-tight"
            variants={itemVariants}
          >
            Give Your Users an
            <br />
            <span className="text-brand"> AI Agent </span>
          </motion.h1>

          <svg
            className="hidden lg:block absolute w-16 lg:w-20 h-auto flex-shrink-0 right-0 bottom-0 -translate-y-12 lg:-translate-y-24 translate-x-15 lg:translate-x-15 xl:translate-x-15"
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

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl z-10 leading-relaxed"
            variants={itemVariants}
          >
            Go beyond a simple chatbot. Give your users an AI agent that can
            complete tasks, manage accounts, and navigate your app.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 sm:space-x-4 z-10 w-full sm:w-auto px-4 sm:px-0"
            variants={itemVariants}
          >
            <div className="relative group w-full sm:w-auto">
              <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
              <Button
                size="lg"
                className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-lg"
                asChild
              >
                <Link href="/login">
                  <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Get Started Now
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
              >
                <Link href="/contact">Talk With Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

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
              From Finding to <em>Doing</em>.
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Standard search bars and chatbots find information.
              <br />
              Our AI agent gets things done. Transform user interaction from a
              frustrating search into an effortless action.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                icon: Zap,
                title: 'From Intent to Action, Instantly',
                text: "Our agent doesn't just talk; it acts. It securely connects to your app's APIs to turn user requests directly into results.",
                bullets: [
                  'Execute commands like "Upgrade my account."',
                  'Connect users to key functions and workflows.',
                  'Create the most direct path from request to conversion.',
                ],
              },
              {
                icon: Code,
                title: 'Learns Your App in Minutes',
                text: 'Forget building complex, manual conversation flows. Our agent learns everything it needs to know directly from your existing content.',
                bullets: [
                  'Instantly train on your documentation or knowledge base.',
                  'Becomes a product expert, ready to answer any question.',
                  'Embed anywhere on your site with a single line of code.',
                ],
              },
              {
                icon: Rocket,
                title: 'Drive Adoption, Not Just Support Tickets',
                text: 'Turn user assistance from a cost center into an engine for growth. Our agent helps users succeed while reducing your support burden.',
                bullets: [
                  'Provide 24/7 self-service to solve user problems.',
                  'Proactively guide users to discover and adopt features.',
                  'Increase engagement, retention, and user success.',
                ],
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2, margin: '-20px' }}
                style={{ willChange: 'auto' }}
                className="group"
              >
                <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg h-full transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <item.icon className="w-8 h-8 sm:w-10 sm:h-10 text-brand mb-3 sm:mb-4" />
                    <CardTitle className="text-xl sm:text-2xl font-semibold leading-tight">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
                      {item.text}
                    </p>
                    {item.bullets && (
                      <ul className="space-y-2">
                        {item.bullets.map((bullet, bulletIndex) => (
                          <li
                            key={bulletIndex}
                            className="flex items-start space-x-3"
                          >
                            <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0 mt-2" />
                            <span className="text-sm sm:text-base text-muted-foreground">
                              {bullet}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section - Redesigned with alternating layout */}
      <motion.section
        className="py-20 sm:py-28 bg-gradient-to-b from-background to-muted/10"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: '-50px' }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center mb-16 sm:mb-20"
            variants={itemVariants}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 sm:mb-8 leading-tight">
              Everything You Need
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground/80 max-w-4xl mx-auto font-medium">
              A complete platform to build, deploy, and manage intelligent AI
              agents that work seamlessly with your existing systems
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center mb-20 sm:mb-24">
            {/* Custom Actions */}
            <div className="lg:col-span-7">
              <Card className="border-2 border-border/30 bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:border-brand/30">
                <CardContent className="p-6 sm:p-8 lg:p-10 xl:p-14">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
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
              <Card className="border-2 border-border/40 bg-gradient-to-br from-card to-card/90 rounded-2xl p-6 sm:p-8 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-xl hover:border-primary/20">
                <div className="flex items-center space-x-4 mb-4">
                  <MessageSquare className="h-6 w-6 text-brand" />
                  <h4 className="text-xl font-bold text-foreground">
                    Natural Language
                  </h4>
                </div>
                <p className="text-base sm:text-base text-muted-foreground/80 font-medium">
                  Users interact naturally - no commands to learn
                </p>
              </Card>

              <Card className="border-2 border-border/40 bg-gradient-to-br from-card to-card/90 rounded-2xl p-6 sm:p-8 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-xl hover:border-primary/20">
                <div className="flex items-center space-x-4 mb-4">
                  <Zap className="h-6 w-6 text-brand" />
                  <h4 className="text-xl font-bold text-foreground">
                    Real-time
                  </h4>
                </div>
                <p className="text-base sm:text-base text-muted-foreground/80 font-medium">
                  Instant responses and live interactions
                </p>
              </Card>
            </div>
          </div>

          {/* Knowledge Base - Reversed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 lg:order-1">
              <Card className="border-2 border-border/40 bg-gradient-to-br from-card to-card/90 rounded-2xl p-6 sm:p-8 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-xl hover:border-primary/20">
                <div className="flex items-center space-x-4 mb-4">
                  <Users className="h-6 w-6 text-brand" />
                  <h4 className="text-xl font-bold text-foreground">
                    User Context
                  </h4>
                </div>
                <p className="text-base sm:text-base text-muted-foreground/80 font-medium">
                  Personalized experiences based on user data
                </p>
              </Card>

              <Card className="border-2 border-border/40 bg-gradient-to-br from-card to-card/90 rounded-2xl p-6 sm:p-8 transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-xl hover:border-primary/20">
                <div className="flex items-center space-x-4 mb-4">
                  <Shield className="h-6 w-6 text-brand" />
                  <h4 className="text-xl font-bold text-foreground">
                    Secure & Private
                  </h4>
                </div>
                <p className="text-base sm:text-base text-muted-foreground/80 font-medium">
                  Encrypted communications and data protection
                </p>
              </Card>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2">
              <Card className="border-2 border-border/30 bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:border-brand/30">
                <CardContent className="p-6 sm:p-8 lg:p-10 xl:p-14">
                  <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                    <div className="bg-primary/15 p-3 sm:p-4 rounded-3xl self-start">
                      <FileText className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
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
                          <FileText className="h-5 w-5 text-primary" />
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
              From customer support to e-commerce, see how AI agents are
              revolutionizing user experiences across different sectors
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 mb-20">
            {/* Customer Support */}
            <motion.div className="group" variants={itemVariants}>
              <Card className="border-2 border-border/30 bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:-translate-y-1 h-full">
                <CardHeader className="pb-6 sm:pb-8 pt-6 sm:pt-10 px-6 sm:px-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-0 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="bg-blue-500/15 p-3 sm:p-4 rounded-3xl self-start">
                        <MessageSquare className="h-8 sm:h-10 w-8 sm:w-10 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                          Customer Support
                        </h3>
                        <p className="text-base sm:text-lg text-muted-foreground/80 font-medium leading-relaxed mb-4">
                          24/7 intelligent assistance that answers FAQs
                          instantly, creates support tickets, processes refunds,
                          and schedules appointments through natural
                          conversation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mock conversation */}
                  <div className="bg-muted/50 rounded-2xl p-3 sm:p-4 space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="bg-blue-500 text-white rounded-full p-1 flex-shrink-0">
                        <Users className="h-3 w-3" />
                      </div>
                      <div className="bg-background rounded-lg px-3 py-2 max-w-[160px] sm:max-w-[200px] border-[2px] border-border">
                        <p className="text-xs sm:text-sm">
                          Hi! I need to cancel my order #1234
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-[180px] sm:max-w-[200px]">
                        <p className="text-xs sm:text-sm">
                          Done! Your order has been cancelled and you&apos;ll
                          receive a full refund within 3-5 days.
                        </p>
                      </div>
                      <div className="bg-blue-500 text-white rounded-full p-1 flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            {/* E-commerce */}
            <motion.div className="group" variants={itemVariants}>
              <Card className="border-2 border-border/30 bg-gradient-to-br from-card to-card/80 rounded-3xl shadow-xl overflow-hidden transition-all duration-300 ease-out hover:scale-[1.01] hover:shadow-2xl hover:-translate-y-1 h-full">
                <CardHeader className="pb-6 sm:pb-8 pt-6 sm:pt-10 px-6 sm:px-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-0 sm:mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="bg-green-500/15 p-3 sm:p-4 rounded-3xl self-start">
                        <Globe className="h-8 sm:h-10 w-8 sm:w-10 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                          E-commerce
                        </h3>
                        <p className="text-base sm:text-lg text-muted-foreground/80 font-medium leading-relaxed mb-4">
                          Smart shopping assistance that provides intelligent
                          product recommendations, adds items to cart, processes
                          orders, and tracks shipments seamlessly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Mock shopping interaction */}
                  <div className="bg-muted/50 rounded-2xl p-3 sm:p-4 space-y-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <div className="bg-green-500 text-white rounded-full p-1 flex-shrink-0">
                        <Users className="h-3 w-3" />
                      </div>
                      <div className="bg-background rounded-lg px-3 py-2 max-w-[160px] sm:max-w-[200px] border-[2px] border-border">
                        <p className="text-xs sm:text-sm">
                          Find me a floral dress under $150
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 justify-end">
                      <div className="bg-green-500 text-white rounded-lg px-3 py-2 max-w-[180px] sm:max-w-[200px]">
                        <p className="text-xs sm:text-sm">
                          Perfect! Found this lovely maxi dress. Added to your
                          cart!
                        </p>
                      </div>
                      <div className="bg-green-500 text-white rounded-full p-1 flex-shrink-0">
                        <Zap className="h-3 w-3" />
                      </div>
                    </div>
                  </div>

                  {/* Product preview */}
                  <div className="bg-background/50 rounded-xl p-3 mb-4 border-[2px] border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-br from-sage-400 to-sage-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm sm:text-lg">👗</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-xs sm:text-sm truncate">
                          Vintage Floral Maxi Dress
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Size M • Long sleeves • Button front
                        </div>
                        <div className="text-green-600 font-bold text-xs sm:text-sm">
                          $138
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
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
                    <p className="text-base sm:text-base text-muted-foreground">{item.description}</p>
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
              Ready to Transform Your Webapp?
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
