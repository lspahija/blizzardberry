'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Bot,
  Zap,
  FileText,
  Code,
  Copy,
  CheckCircle2,
  Play,
  Settings,
  Users,
  MessageSquare,
  Globe,
  Shield,
  Clock,
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState('vanilla');

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

  const handleCopy = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(`${language}-${code.slice(0, 20)}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const standardCode = `<!-- 1. Agent Configuration - Set up user context and metadata -->
<script id="blizzardberry-config" type="text/javascript">
  window.agentUserConfig = {
    userId: "user_123",
    userHash: "hash_456",
    accountNumber: "1234567890",
    userMetadata: {
      name: "John Doe",
      email: "john@example.com",
      company: "Example Corp"
    }
  };
</script>

<!-- 2. Agent Script - Load the BlizzardBerry agent -->
<script
  id="blizzardberry-agent"
  src="https://blizzardberry.com/agent/agent.js"
  type="text/javascript"
  data-agent-id="your-agent-id"
></script>

<!-- 3. Custom Actions - Define what your agent can do -->
<script id="blizzardberry-actions" type="text/javascript">
  window.agentActions = {
    // Example: Submit a contact form
    submitContactForm: async (userConfig, name, email, message) => {
      // Your custom action logic here
      return { status: 'success', message: 'Form submitted' };
    },
    
    // Example: Search products
    searchProducts: async (userConfig, query) => {
      // Your custom action logic here
      return { status: 'success', results: [] };
    }
  };
</script>`;

  const nextJsCode = `import Script from 'next/script';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        
        {/* 1. Agent Configuration - Set up user context and metadata */}
        <Script id="blizzardberry-config" strategy="afterInteractive">
          {\`
            window.agentUserConfig = {
              userId: "user_123",
              userHash: "hash_456",
              accountNumber: "1234567890",
              userMetadata: {
                name: "John Doe",
                email: "john@example.com",
                company: "Example Corp"
              }
            };
          \`}
        </Script>
        
        {/* 2. Agent Script - Load the BlizzardBerry agent */}
        <Script
          id="blizzardberry-agent"
          src="https://blizzardberry.com/agent/agent.js"
          strategy="afterInteractive"
          data-agent-id="your-agent-id"
        />
        
        {/* 3. Custom Actions - Define what your agent can do */}
        <Script id="blizzardberry-actions" strategy="afterInteractive">
          {\`
            window.agentActions = {
              // Example: Submit a contact form
              submitContactForm: async (userConfig, name, email, message) => {
                // Your custom action logic here
                return { status: 'success', message: 'Form submitted' };
              },
              
              // Example: Search products
              searchProducts: async (userConfig, query) => {
                // Your custom action logic here
                return { status: 'success', results: [] };
              }
            };
          \`}
        </Script>
      </body>
    </html>
  );
}`;

  const getCodeForFramework = (framework: string) => {
    switch (framework) {
      case 'nextjs':
        return nextJsCode;
      case 'vanilla':
      case 'react':
      case 'vue':
      case 'angular':
      default:
        return standardCode;
    }
  };

  const getLanguageForFramework = (framework: string) => {
    switch (framework) {
      case 'nextjs':
        return 'jsx';
      case 'vanilla':
      case 'react':
      case 'vue':
      case 'angular':
      default:
        return 'html';
    }
  };

  const getFrameworkDescription = (framework: string) => {
    switch (framework) {
      case 'nextjs':
        return 'Optimized for Next.js applications with proper script loading';
      case 'vanilla':
      case 'react':
      case 'vue':
      case 'angular':
      default:
        return 'Works with any HTML website or JavaScript framework';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <motion.div
          className="bg-gradient-to-br from-brand/10 to-brand/5 border-b border-border"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-6xl mx-auto px-4 py-16">
            <motion.div className="text-center" variants={itemVariants}>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                BlizzardBerry
                <span className="text-brand"> Documentation</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Learn how to add powerful AI agents to your website in minutes.
                Create custom actions, upload knowledge documents, and provide
                natural language interfaces to your users.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-6 py-3 rounded-lg hover:bg-brand/90"
                >
                  <Link href="/dashboard">
                    <Play className="mr-2 h-5 w-5" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.section
          className="py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Quick Start Guide
              </h2>
              <p className="text-lg text-muted-foreground">
                Get your first AI agent up and running in 4 simple steps
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="h-6 w-6 text-brand" />
                    </div>
                    <CardTitle className="text-lg">1. Create Agent</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Set up your AI agent with a name, website domain, and
                      choose your preferred AI model.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-6 w-6 text-brand" />
                    </div>
                    <CardTitle className="text-lg">2. Add Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Define custom actions your agent can perform - from form
                      submissions to API calls.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-brand" />
                    </div>
                    <CardTitle className="text-lg">
                      3. Upload Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Add knowledge documents to help your agent answer
                      questions and provide support.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Code className="h-6 w-6 text-brand" />
                    </div>
                    <CardTitle className="text-lg">
                      4. Install & Deploy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Copy the installation code and paste it into your website.
                      Your agent is ready!
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Installation Guide */}
        <motion.section
          className="py-16 bg-muted/30"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Installation Guide
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose your framework and follow the installation steps
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Code Example */}
              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="h-6 w-6 text-brand" />
                        <CardTitle className="text-xl">
                          Installation Code
                        </CardTitle>
                      </div>
                      <Select
                        value={selectedFramework}
                        onValueChange={setSelectedFramework}
                      >
                        <SelectTrigger className="w-[180px] border-[2px] border-border">
                          <SelectValue placeholder="Select framework" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vanilla">Vanilla JS</SelectItem>
                          <SelectItem value="nextjs">Next.js</SelectItem>
                          <SelectItem value="react">React</SelectItem>
                          <SelectItem value="vue">Vue.js</SelectItem>
                          <SelectItem value="angular">Angular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-muted-foreground mt-3">
                      {getFrameworkDescription(selectedFramework)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <SyntaxHighlighter
                        language={getLanguageForFramework(selectedFramework)}
                        style={vscDarkPlus}
                        customStyle={{
                          borderRadius: '8px',
                          padding: '16px',
                          border: '2px solid var(--color-border)',
                          backgroundColor: 'var(--color-background-dark)',
                        }}
                      >
                        {getCodeForFramework(selectedFramework)}
                      </SyntaxHighlighter>
                      <Button
                        onClick={() =>
                          handleCopy(
                            getCodeForFramework(selectedFramework),
                            selectedFramework
                          )
                        }
                        className="absolute top-2 right-2 bg-secondary text-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform rounded-xl flex items-center gap-2 hover:bg-secondary/90"
                      >
                        <Copy className="w-4 h-4" />
                        {copiedCode ===
                        `${selectedFramework}-${getCodeForFramework(selectedFramework).slice(0, 20)}`
                          ? 'Copied!'
                          : 'Copy'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Installation Instructions */}
              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-6 w-6 text-brand" />
                      <CardTitle className="text-xl">
                        Installation Steps
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 text-muted-foreground">
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-brand text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          1
                        </span>
                        <span>Copy the code snippet for your framework</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-brand text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          2
                        </span>
                        <span>
                          Replace{' '}
                          <code className="bg-muted px-1 rounded">
                            your-agent-id
                          </code>{' '}
                          with your actual agent ID
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-brand text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          3
                        </span>
                        <span>
                          Paste the code before the closing{' '}
                          <code className="bg-muted px-1 rounded">
                            &lt;/body&gt;
                          </code>{' '}
                          tag
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-brand text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                          4
                        </span>
                        <span>Deploy your website and test the agent</span>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          className="py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to create intelligent AI agents
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-6 w-6 text-brand" />
                      <CardTitle>Custom Actions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Create client-side and server-side actions that your agent
                      can execute. From form submissions to API calls, your
                      agent can perform any task.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-brand" />
                      <CardTitle>Knowledge Base</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Upload documents, FAQs, and knowledge articles. Your agent
                      will use this information to provide accurate answers and
                      support.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-6 w-6 text-brand" />
                      <CardTitle>Natural Language</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Users can interact with your agent using natural language.
                      No need to learn specific commands or syntax.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Users className="h-6 w-6 text-brand" />
                      <CardTitle>User Context</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Pass user information and preferences to your agent.
                      Provide personalized experiences based on user data.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-6 w-6 text-brand" />
                      <CardTitle>Secure & Private</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      All communications are encrypted. Your data stays private
                      and secure. No sensitive information is stored
                      unnecessarily.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-6 w-6 text-brand" />
                      <CardTitle>Real-time</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Instant responses and real-time interactions. Your agent
                      responds immediately to user queries.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Use Cases */}
        <motion.section
          className="py-16 bg-muted/30"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto px-4">
            <motion.div className="text-center mb-12" variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Popular Use Cases
              </h2>
              <p className="text-lg text-muted-foreground">
                See how others are using BlizzardBerry to enhance their websites
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-6 w-6 text-brand" />
                      <CardTitle className="text-xl">
                        Customer Support
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Provide instant customer support with AI agents that can:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Answer common questions</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Create support tickets</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Schedule appointments</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Process refunds</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Globe className="h-6 w-6 text-brand" />
                      <CardTitle className="text-xl">E-commerce</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Enhance your online store with AI agents that can:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Search and recommend products</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Add items to cart</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Process orders</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Track shipments</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Users className="h-6 w-6 text-brand" />
                      <CardTitle className="text-xl">Lead Generation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Capture and qualify leads with AI agents that can:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Collect contact information</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Qualify prospects</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Schedule demos</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Send follow-up emails</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-6 w-6 text-brand" />
                      <CardTitle className="text-xl">Form Automation</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Automate form submissions with AI agents that can:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Fill out contact forms</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Submit applications</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Process registrations</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-brand" />
                        <span>Handle surveys</span>
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
          className="py-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Create your first AI agent in minutes and transform how users
                interact with your website.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform text-base font-semibold px-8 py-3 rounded-lg hover:bg-brand/90"
                >
                  <Link href="/dashboard">
                    <Play className="mr-2 h-5 w-5" />
                    Create an Agent
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
