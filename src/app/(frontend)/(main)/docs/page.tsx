'use client';

import { RetroButton } from '@/app/(frontend)/components/ui/retro-button';
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
import {
  Framework,
  getUnifiedEmbedScript,
} from '@/app/(frontend)/lib/scriptUtils';
import { DEFAULT_AGENT_USER_CONFIG } from '@/app/(frontend)/lib/defaultUserConfig';

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

  const exampleActions = [
    { functionName: 'submitContactForm', dataInputs: [] },
    { functionName: 'searchProducts', dataInputs: [] },
  ];

  const toFrameworkEnum = (framework: string) => {
    switch (framework) {
      case 'nextjs':
        return Framework.NEXT_JS;
      case 'react':
        return Framework.REACT;
      case 'vue':
        return Framework.VUE;
      case 'angular':
        return Framework.ANGULAR;
      case 'vanilla':
      default:
        return Framework.VANILLA;
    }
  };

  const getCodeForFramework = (framework: string) => {
    const fw = toFrameworkEnum(framework);
    return getUnifiedEmbedScript(
      fw,
      'your-agent-id',
      DEFAULT_AGENT_USER_CONFIG,
      exampleActions
    );
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
          <div className="max-w-6xl mx-auto px-4 pt-12 pb-12 sm:pt-16 sm:pb-16">
            <motion.div className="text-center" variants={itemVariants}>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                BlizzardBerry
                <span className="text-brand"> Documentation</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Learn how to add powerful AI agents to your website in minutes.
                Create custom actions, upload knowledge documents, and provide
                natural language interfaces to your users.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-12 sm:px-0">
                <div className="relative group w-full sm:w-auto">
                  <div className="absolute inset-0 rounded-lg bg-black/80 translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                  <Button
                    size="lg"
                    className="relative bg-brand text-primary-foreground border-[3px] border-border hover:bg-brand/90 w-full sm:w-auto text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-lg"
                    asChild
                  >
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center"
                    >
                      <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Get Started
                    </Link>
                  </Button>
                </div>
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
                      <div className="absolute top-2 right-2 group">
                        <div className="absolute inset-0 rounded-xl bg-foreground translate-x-1 translate-y-1 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"></div>
                        <button
                          onClick={() =>
                            handleCopy(
                              getCodeForFramework(selectedFramework),
                              selectedFramework
                            )
                          }
                          className="relative bg-secondary text-foreground border-[2px] border-border hover:bg-secondary/90 rounded-xl flex items-center gap-2 px-3 py-2"
                        >
                          <Copy className="w-4 h-4" />
                          {copiedCode ===
                          `${selectedFramework}-${getCodeForFramework(selectedFramework).slice(0, 20)}`
                            ? 'Copied!'
                            : 'Copy'}
                        </button>
                      </div>
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
                          {selectedFramework === 'nextjs' ? (
                            <>
                              Paste the code in your layout.tsx or page
                              component
                            </>
                          ) : (
                            <>
                              Paste the code before the closing{' '}
                              <code className="bg-muted px-1 rounded">
                                &lt;/body&gt;
                              </code>{' '}
                              tag
                            </>
                          )}
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
                <div className="mt-8 pt-2"></div>
                <motion.div variants={itemVariants}>
                  <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <Users className="h-6 w-6 text-brand" />
                        <CardTitle className="text-xl">User Context</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        The user parameter contains user information that is
                        passed to the agent, allowing you to provide
                        personalized experiences.
                      </p>
                      <p className="text-muted-foreground">
                        When you configure your agent, you can pass
                        user-specific data like user ID, preferences, account
                        information, and metadata. This information is
                        automatically available to your agent, enabling
                        personalized responses and functionality.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                <div className="mt-8 pt-2"></div>
                <motion.div variants={itemVariants}>
                  <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                    <CardHeader>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-6 w-6 text-brand" />
                        <CardTitle className="text-xl">
                          Action Responses
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        <strong>Why return values?</strong> The AI agent uses
                        your return value to provide helpful responses to users
                        and confirm actions were executed.
                      </p>
                      <p className="text-muted-foreground">
                        When your custom actions execute, they should return
                        information about what happened. The AI agent uses this
                        return value to provide meaningful responses to users,
                        confirm actions were successful, or handle errors
                        gracefully.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Server vs Client Actions */}
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
                Action Types Explained
              </h2>
              <p className="text-lg text-muted-foreground">
                Understand the difference between server and client actions
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border-[3px] border-border bg-card rounded-xl shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-brand" />
                    <CardTitle className="text-2xl">
                      Server vs Client Actions
                    </CardTitle>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Choose the right action type for your use case
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center text-lg">
                        <Globe className="h-5 w-5 text-brand mr-2" />
                        Server Actions
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        Use server actions when you have an API endpoint that
                        can handle the request:
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <span className="text-brand mr-2 font-bold">•</span>
                          <strong>You have an existing API endpoint</strong> -
                          agent calls it directly
                        </li>
                        <li className="flex items-start">
                          <span className="text-brand mr-2 font-bold">•</span>
                          <strong>Zero code implementation</strong> - just
                          provide your API endpoint
                        </li>
                        <li className="flex items-start">
                          <span className="text-brand mr-2 font-bold">•</span>
                          <strong>Secure and reliable</strong> - runs on your
                          backend infrastructure
                        </li>
                      </ul>
                      <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          ✅ <strong>Easy setup:</strong> Just provide your API
                          endpoint and the agent handles the rest!
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-foreground mb-3 flex items-center text-lg">
                        <Code className="h-5 w-5 text-brand mr-2" />
                        Client Actions
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        Use client actions when you don't have an API or need
                        browser-specific functionality:
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start">
                          <span className="text-brand mr-2 font-bold">•</span>
                          <strong>No API endpoint needed</strong> - works
                          directly in the browser
                        </li>
                        <li className="flex items-start">
                          <span className="text-brand mr-2 font-bold">•</span>
                          <strong>Custom JavaScript required</strong> - copy and
                          paste provided code
                        </li>
                        <li className="flex items-start">
                          <span className="text-brand mr-2 font-bold">•</span>
                          <strong>Full browser control</strong> - manipulate UI,
                          forms, and page behavior
                        </li>
                      </ul>
                      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          🔧 <strong>Manual setup:</strong> You'll receive
                          ready-to-use JavaScript code to add to your website.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-brand/5 border border-brand/20 rounded-lg p-6">
                    <p className="text-muted-foreground text-center">
                      <strong className="text-foreground">
                        💡 Key Difference:
                      </strong>{' '}
                      Server actions work automatically through API calls, while
                      client actions need custom JavaScript code in your
                      website.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
                Everything you need to create AI agents
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="w-fit">
                  <RetroButton
                    asChild
                    className="bg-brand text-primary-foreground hover:bg-brand/90 text-base font-semibold px-8 py-3 w-auto"
                  >
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Create an Agent
                    </Link>
                  </RetroButton>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
}
