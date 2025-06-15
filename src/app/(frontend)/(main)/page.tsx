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
import { Code, Rocket, Zap } from 'lucide-react';

// Reusable component for the drop-shadow effect on buttons and cards
const ShadowWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative">
    <div className="absolute inset-0 rounded-lg bg-shadow/40 translate-x-1 translate-y-1 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"></div>
    {children}
  </div>
);

export default function LandingPage() {
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
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-border sticky top-0 bg-background z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">
            <span>Blizzard</span>
            <span className="text-brand">Berry</span>
          </span>
        </div>
        <div className="hidden md:flex space-x-6">
          <Link
            href="/product"
            className="text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Product
          </Link>
          <Link
            href="/docs"
            className="text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Docs
          </Link>
          <Link
            href="/blog"
            className="text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Blog
          </Link>
          <Link
            href="/pricing"
            className="text-foreground hover:-translate-y-0.5 transition-transform"
          >
            Pricing
          </Link>
        </div>
        <div className="flex space-x-3">
          <div className="relative group">
            <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
            <Button
              variant="outline"
              className="relative bg-background text-foreground border-[3px] border-border"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
            <Button
              className="relative bg-primary text-primary-foreground border-[3px] border-border"
              asChild
            >
              <Link href="/login">Try For Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div
        className="relative flex flex-col items-center justify-center text-center pt-16 pb-24 max-w-4xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <svg
          className="absolute h-auto w-16 sm:w-20 md:w-24 flex-shrink-0 p-2 md:relative sm:absolute lg:absolute left-0 lg:-translate-x-full lg:ml-32 md:translate-x-10 sm:-translate-y-16 md:-translate-y-0 -translate-x-2 lg:-translate-y-1"
          viewBox="0 0 91 98"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m35.878 14.162 1.333-5.369 1.933 5.183c4.47 11.982 14.036 21.085 25.828 24.467l5.42 1.555-5.209 2.16c-11.332 4.697-19.806 14.826-22.888 27.237l-1.333 5.369-1.933-5.183C34.56 57.599 24.993 48.496 13.201 45.114l-5.42-1.555 5.21-2.16c11.331-4.697 19.805-14.826 22.887-27.237Z"
            className="fill-brand stroke-foreground"
            strokeWidth="3.445"
          ></path>
          <path
            d="M79.653 5.729c-2.436 5.323-9.515 15.25-18.341 12.374m9.197 16.336c2.6-5.851 10.008-16.834 18.842-13.956m-9.738-15.07c-.374 3.787 1.076 12.078 9.869 14.943M70.61 34.6c.503-4.21-.69-13.346-9.49-16.214M14.922 65.967c1.338 5.677 6.372 16.756 15.808 15.659M18.21 95.832c-1.392-6.226-6.54-18.404-15.984-17.305m12.85-12.892c-.41 3.771-3.576 11.588-12.968 12.681M18.025 96c.367-4.21 3.453-12.905 12.854-14"
            className="stroke-foreground"
            fill="none"
            strokeWidth="2.548"
            strokeLinecap="round"
          ></path>
        </svg>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4"
          variants={itemVariants}
        >
          Give Your Users an
          <br />
          <span className="text-primary"> AI Agent </span>
        </motion.h1>

        <svg
          className="w-16 lg:w-20 h-auto lg:absolute flex-shrink-0 right-0 bottom-0 md:block hidden translate-y-10 md:translate-y-20 lg:translate-y-4 lg:-translate-x-12 -translate-x-10"
          viewBox="0 0 92 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m35.213 16.953.595-5.261 2.644 4.587a35.056 35.056 0 0 0 26.432 17.33l5.261.594-4.587 2.644A35.056 35.056 0 0 0 48.23 63.28l-.595 5.26-2.644-4.587a35.056 35.056 0 0 0-26.432-17.328l-5.261-.595 4.587-2.644a35.056 35.056 0 0 0 17.329-26.433Z"
            className="fill-chart-5 stroke-foreground"
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
          className="text-lg text-muted-foreground mb-8 max-w-2xl"
          variants={itemVariants}
        >
          Our AI agents learn your documentation to provide instant answers and
          execute actions on your users' behalf. Let users navigate your app,
          manage their accounts, and complete workflows—all through a simple
          conversation.
        </motion.p>
        <motion.div className="flex space-x-4" variants={itemVariants}>
          <div className="relative group">
            <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
            <Button
              size="lg"
              className="relative bg-primary text-primary-foreground border-[3px] border-border"
              asChild
            >
              <Link href="/login">Get Started Now</Link>
            </Button>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
            <Button
              size="lg"
              variant="outline"
              className="relative bg-background text-foreground border-[3px] border-border"
              asChild
            >
              <Link href="https://github.com/your-repo" target="_blank">
                Talk With Us
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Value Proposition Section */}
      <div className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            More Than a Chatbot. An Agent Working for Your Users
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
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
                className="group"
              >
                <ShadowWrapper>
                  <Card className="relative bg-card text-card-foreground border-[3px] border-border rounded-lg shadow-none flex flex-col">
                    <CardHeader className="pb-4">
                      <item.icon className="w-8 h-8 text-primary mb-3" />
                      <CardTitle className="text-xl font-semibold leading-tight">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-base text-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </CardContent>
                  </Card>
                </ShadowWrapper>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 text-center bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Webapp?
          </h2>
          <p className="text-lg mb-6">
            Create an agent for your users in minutes.
          </p>
          <div className="relative inline-block group">
            <div className="absolute inset-0 rounded bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
            <Button
              size="lg"
              className="relative bg-background text-foreground border-[3px] border-border"
              asChild
            >
              <Link href="/login">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
