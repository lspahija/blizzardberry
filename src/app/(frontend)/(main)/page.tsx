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
            className="hidden lg:block absolute h-auto w-16 lg:w-20 flex-shrink-0 p-2 left-0 translate-y-20 lg:-translate-y-20 -translate-x-4 lg:-translate-x-8 xl:-translate-x-12"
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
            className="hidden lg:block absolute w-16 lg:w-20 h-auto flex-shrink-0 right-0 bottom-0 translate-y-12 lg:-translate-y-5 translate-x-15 lg:translate-x-15 xl:translate-x-15"
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
            Our AI Agent doesn't just find answers in your documentation—it
            takes action. Let your users manage their accounts, navigate your
            app, and complete workflows—all through a simple conversation.
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
          <motion.div className="text-center mb-10 sm:mb-14" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              More Than a Chatbot. An Agent Working for Your Users
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Transform how users interact with your website
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              {
                icon: Zap,
                title: 'From Intent to Action, Instantly',
                text: 'Connect your app\'s key functions to the agent. When a user says, "Upgrade my account" or "Add a teammate," our agent securely executes the command through your existing APIs. It\'s the most direct path from user request to conversion.',
              },
              {
                icon: Code,
                title: 'Learns Your App in Minutes',
                text: 'No need to manually build complex conversation flows. Simply point the agent to your documentation or knowledge base. It instantly becomes an expert on your product, ready to answer user questions with precision. Embed with a single code snippet.',
              },
              {
                icon: Rocket,
                title: 'Drive Adoption, Not Just Support Tickets',
                text: 'Empower users to solve their own problems and discover features 24/7. Our agent reduces support load while actively guiding users to success. Turn your user assistance from a cost center into a powerful engine for engagement and retention.',
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
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="py-12 sm:py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-2">
          <motion.div className="text-center mb-10 sm:mb-14" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Powerful Features
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Everything you need to create intelligent AI agents
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">Custom Actions</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Create client-side and server-side actions that your agent
                    can execute. From form submissions to API calls, your agent
                    can perform any task.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">Knowledge Base</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Upload documents, FAQs, and knowledge articles. Your agent
                    will use this information to provide accurate answers and
                    support.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">Natural Language</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Users can interact with your agent using natural language.
                    No need to learn specific commands or syntax.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">User Context</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Pass user information and preferences to your agent. Provide
                    personalized experiences based on user data.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">Secure & Private</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    All communications are encrypted. Your data stays private
                    and secure. No sensitive information is stored
                    unnecessarily.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">Real-time</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground">
                    Instant responses and real-time interactions. Your agent
                    responds immediately to user queries.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Use Cases Section */}
      <motion.section
        className="py-12 sm:py-16 bg-muted/30"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-2">
          <motion.div className="text-center mb-10 sm:mb-14" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              Popular Use Cases
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              See how others are using BlizzardBerry to enhance their websites
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">Customer Support</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4">
                    Provide instant customer support with AI agents that can:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Answer common questions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Create support tickets</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Schedule appointments</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Process refunds</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-2xl shadow-lg sm:shadow-2xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-brand" />
                    <CardTitle className="text-lg sm:text-xl">E-commerce</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base sm:text-lg text-muted-foreground mb-4">
                    Enhance your online store with AI agents that can:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Search and recommend products</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Add items to cart</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Process orders</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-brand flex-shrink-0" />
                      <span className="text-sm sm:text-base">Track shipments</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
