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
  Clock,
  CheckCircle2,
  Play,
  Globe,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-sm px-4 py-6 space-y-4 fixed top-[75px] left-0 right-0 bottom-0 z-40">
          <Link
            href="/docs"
            className="block text-center text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Docs
          </Link>
          <Link
            href="/pricing"
            className="block text-center text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="block text-center text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Contact
          </Link>
          <div className="flex flex-col space-y-3 pt-6 mt-4 border-t border-border">
            <div className="relative group">
              <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
              <Button
                variant="outline"
                className="relative bg-background text-foreground border-[3px] border-border hover:bg-background/90 w-full"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
              <Button
                className="relative bg-secondary text-secondary-foreground border-[3px] border-border hover:bg-secondary/90 w-full"
                asChild
              >
                <Link href="/login">Try For Free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

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
        viewport={{ once: true, amount: 0.3 }} // Reduced amount to trigger earlier
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
                text: 'Our agent doesn\'t just talk; it acts. It securely connects to your app\'s APIs to turn user requests directly into results.',
                bullets: [
                  'Execute commands like "Upgrade my account."',
                  'Connect users to key functions and workflows.',
                  'Create the most direct path from request to conversion.'
                ]
              },
              {
                icon: Code,
                title: 'Learns Your App in Minutes',
                text: 'Forget building complex, manual conversation flows. Our agent learns everything it needs to know directly from your existing content.',
                bullets: [
                  'Instantly train on your documentation or knowledge base.',
                  'Becomes a product expert, ready to answer any question.',
                  'Embed anywhere on your site with a single line of code.'
                ]
              },
              {
                icon: Rocket,
                title: 'Drive Adoption, Not Just Support Tickets',
                text: 'Turn user assistance from a cost center into an engine for growth. Our agent helps users succeed while reducing your support burden.',
                bullets: [
                  'Provide 24/7 self-service to solve user problems.',
                  'Proactively guide users to discover and adopt features.',
                  'Increase engagement, retention, and user success.'
                ]
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                style={{ willChange: 'transform, opacity' }} // Optimize rendering
                transition={{ duration: 0.3 }} // Faster animation
                className="group"
              >
                <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
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
                          <li key={bulletIndex} className="flex items-start space-x-3">
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
        className="py-12 sm:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              A complete platform to build, deploy, and manage intelligent AI agents that work seamlessly with your existing systems
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* Feature Row 1 - Premium Design */}
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand/5 via-transparent to-primary/5 rounded-[3rem] blur-3xl -m-8"></div>
              
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center space-x-3 bg-brand/10 backdrop-blur-sm rounded-full px-6 py-3 border border-brand/20">
                    <Zap className="h-5 w-5 text-brand" />
                    <span className="text-sm font-semibold text-brand uppercase tracking-wide">Custom Actions</span>
                  </div>
                  
                  <div>
                    <h3 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                      Turn Conversations Into Actions
                    </h3>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                      Don't just chat with users—actually help them complete tasks. From upgrading accounts to processing orders, your agent does the work.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Code, text: "Client-side actions", desc: "Direct DOM manipulation" },
                      { icon: Globe, text: "API integration", desc: "Connect to any service" },
                      { icon: Zap, text: "Workflow automation", desc: "Multi-step processes" },
                      { icon: Shield, text: "Secure execution", desc: "Encrypted & validated" }
                    ].map((item, index) => (
                      <div key={index} className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                        <div className="bg-brand/10 p-2 rounded-xl group-hover:bg-brand/20 transition-colors">
                          <item.icon className="h-5 w-5 text-brand" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">{item.text}</div>
                          <div className="text-sm text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="relative">
                  {/* Floating cards with premium shadows */}
                  <div className="space-y-6">
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.02, rotateX: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5 rounded-3xl blur-xl transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                      <Card className="relative bg-card/90 backdrop-blur-xl border-0 rounded-3xl shadow-2xl overflow-hidden">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-500/10 p-2 rounded-xl">
                                <MessageSquare className="h-5 w-5 text-green-500" />
                              </div>
                              <span className="font-semibold">User Request</span>
                            </div>
                            <div className="text-xs bg-muted/50 px-2 py-1 rounded-full">Live</div>
                          </div>
                          <div className="bg-muted/30 rounded-2xl p-4 mb-4">
                            <p className="text-sm">"Upgrade my account to Pro plan"</p>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Processing upgrade...</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      className="relative group ml-12"
                      whileHover={{ scale: 1.02, rotateX: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-bl from-primary/20 to-primary/5 rounded-3xl blur-xl transform -translate-x-4 translate-y-4 group-hover:-translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                      <Card className="relative bg-card/90 backdrop-blur-xl border-0 rounded-3xl shadow-2xl overflow-hidden">
                        <CardContent className="p-8">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-500/10 p-2 rounded-xl">
                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                              </div>
                              <span className="font-semibold">Action Complete</span>
                            </div>
                            <div className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">Success</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 mb-4">
                            <p className="text-sm text-green-800 dark:text-green-200">Account upgraded to Pro! You now have access to all premium features.</p>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span>Completed in 1.2s</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Feature Row 2 - Knowledge Base */}
            <motion.div 
              className="relative"
              variants={itemVariants}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-l from-primary/5 via-transparent to-brand/5 rounded-[3rem] blur-3xl -m-8"></div>
              
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div className="order-2 lg:order-1 relative">
                  {/* Knowledge base visualization */}
                  <div className="relative">
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl blur-xl transform -translate-x-4 translate-y-4 group-hover:-translate-x-6 group-hover:translate-y-6 transition-transform"></div>
                      <Card className="relative bg-card/90 backdrop-blur-xl border-0 rounded-3xl shadow-2xl overflow-hidden">
                        <CardContent className="p-8">
                          <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                              <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold">Knowledge Base</h4>
                              <p className="text-sm text-muted-foreground">1,247 documents processed</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {[
                              { name: "API Documentation", status: "Indexed", color: "green" },
                              { name: "User Guide", status: "Processing", color: "yellow" },
                              { name: "FAQ Database", status: "Indexed", color: "green" },
                              { name: "Product Specs", status: "Indexed", color: "green" }
                            ].map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{doc.name}</span>
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  doc.color === 'green' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'
                                }`}>
                                  {doc.status}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Floating search results */}
                    <motion.div
                      className="absolute -right-8 -bottom-8 lg:-right-12 lg:-bottom-12"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <Card className="bg-card/95 backdrop-blur-xl border-0 rounded-2xl shadow-xl p-4 w-64">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium">Smart Search Active</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Found 12 relevant answers in 0.03s
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2 space-y-8">
                  <div className="inline-flex items-center space-x-3 bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 border border-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Knowledge Base</span>
                  </div>
                  
                  <div>
                    <h3 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                      Instant Product Expert
                    </h3>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                      Upload your docs once, get an AI expert forever. Your agent learns everything about your product and provides accurate, contextual answers.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: FileText, text: "Document processing", desc: "PDFs, docs, web pages" },
                      { icon: MessageSquare, text: "Smart search", desc: "Semantic understanding" },
                      { icon: Zap, text: "Auto-updates", desc: "Sync with your content" },
                      { icon: Users, text: "Context awareness", desc: "Personalized responses" }
                    ].map((item, index) => (
                      <div key={index} className="group flex items-start space-x-4 p-4 rounded-2xl hover:bg-muted/50 transition-all duration-300">
                        <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">{item.text}</div>
                          <div className="text-sm text-muted-foreground">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Use Cases Section - Redesigned with visual examples */}
      <motion.section
        className="py-16 sm:py-20 bg-muted/20 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            variants={itemVariants}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Transform Every Industry
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              From customer support to e-commerce, see how AI agents are revolutionizing user experiences across different sectors
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Customer Support */}
            <motion.div 
              className="group"
              variants={itemVariants}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform"></div>
                <Card className="relative border-[3px] border-border bg-card rounded-3xl shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl">
                          <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">Customer Support</h3>
                          <p className="text-muted-foreground">24/7 intelligent assistance</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mock conversation */}
                    <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <Users className="h-3 w-3" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 max-w-[200px]">
                          <p className="text-sm">Hi! I need to cancel my order #1234</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 justify-end">
                        <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-[200px]">
                          <p className="text-sm">I found your order and processing the cancellation now!</p>
                        </div>
                        <div className="bg-blue-500 text-white rounded-full p-1">
                          <Zap className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: CheckCircle2, text: "Answer FAQs instantly" },
                        { icon: CheckCircle2, text: "Create support tickets" },
                        { icon: CheckCircle2, text: "Process refunds" },
                        { icon: CheckCircle2, text: "Schedule appointments" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* E-commerce */}
            <motion.div 
              className="group"
              variants={itemVariants}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-bl from-green-500/10 to-emerald-500/10 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform"></div>
                <Card className="relative border-[3px] border-border bg-card rounded-3xl shadow-xl overflow-hidden group-hover:shadow-2xl transition-all duration-500">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-2xl">
                          <Globe className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">E-commerce</h3>
                          <p className="text-muted-foreground">Smart shopping assistance</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mock shopping interaction */}
                    <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-start space-x-2">
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <Users className="h-3 w-3" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 max-w-[200px]">
                          <p className="text-sm">Find me a blue laptop under $800</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2 justify-end">
                        <div className="bg-green-500 text-white rounded-lg px-3 py-2 max-w-[200px]">
                          <p className="text-sm">Found 3 perfect matches! Adding the top one to your cart.</p>
                        </div>
                        <div className="bg-green-500 text-white rounded-full p-1">
                          <Zap className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { icon: CheckCircle2, text: "Product recommendations" },
                        { icon: CheckCircle2, text: "Add to cart" },
                        { icon: CheckCircle2, text: "Process orders" },
                        { icon: CheckCircle2, text: "Track shipments" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <item.icon className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            variants={itemVariants}
          >
            {[
              { number: "90%", label: "Faster Response Time", description: "Compared to traditional support" },
              { number: "24/7", label: "Always Available", description: "Never miss a customer inquiry" },
              { number: "3x", label: "Higher Conversion", description: "Turn browsers into buyers" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-brand mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </div>
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
        viewport={{ once: true }}
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
                <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
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
