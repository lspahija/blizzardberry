'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Label } from '@/app/(frontend)/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Bot,
  Settings,
  Code,
  Info,
  Zap,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import { AgentModel, AGENT_MODELS } from '@/app/api/lib/model/agent/agent';
import {
  Framework,
  getUnifiedEmbedScript,
} from '@/app/(frontend)/lib/scriptUtils';
import { DEFAULT_AGENT_USER_CONFIG } from '@/app/(frontend)/lib/defaultUserConfig';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';
import posthog from 'posthog-js';

export default function NewAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [model, setModel] = useState<AgentModel>('google/gemini-2.0-flash-001');
  const [agentId, setAgentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
  }>({});
  const { selectedFramework, setSelectedFramework } = useFramework();
  const { handleCreateAgent, creatingAgent } = useAgents();

  const defaultUserConfig = DEFAULT_AGENT_USER_CONFIG;

  // Check for success state from URL parameters on component mount
  useEffect(() => {
    const successAgentId = searchParams.get('success');
    const successName = searchParams.get('name');

    if (successAgentId && successName) {
      setAgentId(successAgentId);
      setName(successName);
    }
  }, [searchParams]);

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

  const handleCopy = () => {
    if (creatingAgent) return;
    posthog.capture('agent_code_copied', {
      agent_id: agentId,
      framework: selectedFramework,
    });
    const unified = getUnifiedEmbedScript(
      selectedFramework,
      agentId,
      defaultUserConfig,
      []
    );
    navigator.clipboard.writeText(unified);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onCreateAgent = async () => {
    setErrors({});

    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Agent name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      posthog.capture('agent_creation_validation_failed', {
        missing_fields: Object.keys(newErrors),
        name_provided: !!name.trim(),
      });
      return;
    }

    posthog.capture('agent_creation_started', {
      name: name.trim(),
      model,
    });

    try {
      const { agentId: newAgentId } = await handleCreateAgent({
        name,
        model,
      });

      posthog.capture('agent_creation_success', {
        agent_id: newAgentId,
        name: name.trim(),
        model,
      });

      setAgentId(newAgentId);

      // Update URL with success parameters to preserve state when navigating back
      const successUrl = new URL(window.location.href);
      successUrl.searchParams.set('success', newAgentId);
      successUrl.searchParams.set('name', name.trim());
      router.replace(successUrl.pathname + successUrl.search);

      // Scroll to top after successful agent creation
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    } catch (error) {
      posthog.capture('agent_creation_failed', {
        name: name.trim(),
        model,
        error: (error as Error).message,
      });
      console.error('Error creating agent:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="max-w-4xl mx-auto px-4 pt-8 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agentId ? (
          <>
            <motion.div className="text-center" variants={itemVariants}>
              <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-12" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-12">
                Agent Created Successfully!
              </h1>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Your agent is ready to be added to your website. Follow the
                steps below to install it, then configure it with actions and
                documents.
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
                <Card className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8 border-l-brand">
                  <CardHeader className="flex items-center space-x-2">
                    <Code className="h-7 w-7 text-brand" />
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Installation Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mt-4">
                        <Code className="h-4 w-4 text-destructive" />
                        Framework
                      </Label>
                      <p className="text-sm text-muted-foreground mt-2 ml-6">
                        Select the framework you're using to implement the
                        agent.
                      </p>
                      <div className="mt-2 ml-6">
                        <Select
                          value={selectedFramework}
                          onValueChange={(value) =>
                            setSelectedFramework(value as Framework)
                          }
                        >
                          <SelectTrigger className="w-[200px] border-[2px] border-border">
                            <SelectValue placeholder="Select framework" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Framework.ANGULAR}>
                              Angular
                            </SelectItem>
                            <SelectItem value={Framework.NEXT_JS}>
                              Next.js
                            </SelectItem>
                            <SelectItem value={Framework.REACT}>
                              React
                            </SelectItem>
                            <SelectItem value={Framework.VANILLA}>
                              Vanilla JS
                            </SelectItem>
                            <SelectItem value={Framework.VUE}>Vue</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="relative">
                      <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-destructive" />
                        Installation Code
                      </Label>
                      <SyntaxHighlighter
                        language="html"
                        style={vscDarkPlus}
                        customStyle={{
                          borderRadius: '8px',
                          padding: '16px',
                          border: '2px solid var(--color-border)',
                          backgroundColor: 'var(--color-background-dark)',
                        }}
                      >
                        {getUnifiedEmbedScript(
                          selectedFramework,
                          agentId,
                          defaultUserConfig,
                          []
                        )}
                      </SyntaxHighlighter>
                      <Button
                        onClick={handleCopy}
                        className="absolute top-12 right-2 bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md rounded-full p-2 text-xs sm:text-sm font-semibold hover:bg-secondary/90 flex items-center gap-1 sm:gap-2"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">
                          {copied ? 'Copied!' : 'Copy Code'}
                        </span>
                        <span className="sm:hidden">
                          {copied ? 'Copied!' : 'Copy'}
                        </span>
                      </Button>
                    </div>
                    <div>
                      <Label className="text-foreground text-lg font-semibold flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        Installation Instructions
                      </Label>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-6">
                        <li>Copy the code snippet above</li>
                        <li>
                          {selectedFramework === Framework.NEXT_JS ? (
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
                        </li>
                        <li>Save and publish your website changes</li>
                        <li>Your agent will appear on your website</li>
                        <li>
                          Need help? Visit our{' '}
                          <Link
                            href="/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-destructive hover:underline"
                          >
                            documentation{' '}
                            <ExternalLink className="inline w-4 h-4" />
                          </Link>
                          .
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-foreground text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-4 w-4 text-destructive" />
                        What's Next?
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() =>
                            router.push(`/agents/${agentId}/actions/new`)
                          }
                          className="flex items-start gap-3 p-4 bg-card hover:bg-muted/50 rounded-lg border-2 border-border hover:border-brand transition-all duration-200 cursor-pointer group"
                        >
                          <Zap className="h-5 w-5 text-brand mt-0.5 flex-shrink-0 group-hover:scale-105 transition-transform" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground text-base mb-1 group-hover:text-brand transition-colors">
                              Actions
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Create custom actions your agent can perform, like
                              form submissions or API calls.
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/agents/${agentId}/documents/new`)
                          }
                          className="flex items-start gap-3 p-4 bg-card hover:bg-muted/50 rounded-lg border-2 border-border hover:border-brand transition-all duration-200 cursor-pointer group"
                        >
                          <FileText className="h-5 w-5 text-brand mt-0.5 flex-shrink-0 group-hover:scale-105 transition-transform" />
                          <div className="text-left">
                            <p className="font-semibold text-foreground text-base mb-1 group-hover:text-brand transition-colors">
                              Documents
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Add knowledge files to help your agent answer
                              questions and provide better support.
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            <motion.div
              className="text-center mt-8"
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
            >
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-brand text-primary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 transition-transform rounded-lg px-8 py-3 text-base font-semibold"
              >
                Back to Dashboard
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.h1
              className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-12 text-center"
              variants={itemVariants}
            >
              Create New Agent
            </motion.h1>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
            >
              <div className="relative mb-12">
                <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
                <Card className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8 border-l-brand">
                  {creatingAgent && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-foreground font-semibold">
                          Creating Agent...
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Please wait while we set up your agent
                        </p>
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2 flex items-center justify-between">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-foreground ml-6">
                      Agent Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-foreground flex items-center gap-2 text-sm font-semibold mb-2">
                        <Bot className="h-4 w-4 text-destructive" />
                        Name:
                      </Label>
                      <div className="ml-6 max-w-md">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) {
                              setErrors((prev) => ({
                                ...prev,
                                name: undefined,
                              }));
                            }
                          }}
                          placeholder="Agent Name"
                          className={`border-[2px] ${errors.name ? 'border-red-500' : 'border-border'}`}
                          disabled={creatingAgent}
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-foreground flex items-center gap-2 text-sm font-semibold mb-2">
                        <Settings className="h-4 w-4 text-destructive" />
                        Model:
                      </Label>
                      <div className="ml-6 max-w-md">
                        <Select
                          value={model}
                          onValueChange={(value) =>
                            setModel(value as AgentModel)
                          }
                          disabled={creatingAgent}
                        >
                          <SelectTrigger className="border-[2px] border-border">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(AGENT_MODELS).map(
                              ([modelValue, displayName]) => (
                                <SelectItem key={modelValue} value={modelValue}>
                                  {displayName}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        className="bg-brand text-primary-foreground border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 transition-transform rounded-lg px-6 py-2 flex items-center gap-2"
                        onClick={onCreateAgent}
                        disabled={creatingAgent}
                      >
                        {creatingAgent ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Creating Agent...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Create Agent
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
