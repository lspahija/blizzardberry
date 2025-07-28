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
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Bot,
  Globe,
  Type,
  Settings,
  Code,
  Info,
  Plus,
  Trash2,
  MessageSquare,
  Zap,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import {
  AgentModel,
  AgentModelDisplay,
  AgentModelList,
} from '@/app/api/lib/model/agent/agent';
import { Framework, getAgentScript } from '@/app/(frontend)/lib/scriptUtils';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [model, setModel] = useState<AgentModel>(AgentModel.GEMINI_2_0_FLASH);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    websiteDomain?: string;
  }>({});
  const [prompts, setPrompts] = useState<string[]>(['']);
  const { selectedFramework, setSelectedFramework } = useFramework();
  const { handleCreateAgent, creatingAgent } = useAgents();

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
    navigator.clipboard.writeText(getAgentScript(selectedFramework, agentId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push(`/agents/${agentId}`);
  };

  const addPrompt = () => {
    setPrompts([...prompts, '']);
  };

  const removePrompt = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index));
    }
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
  };

  const onCreateAgent = async () => {
    setErrors({});

    const newErrors: { name?: string; websiteDomain?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Agent name is required';
    }

    if (!websiteDomain.trim()) {
      newErrors.websiteDomain = 'Website domain is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const { agentId: newAgentId } = await handleCreateAgent({
        name,
        websiteDomain,
        model,
        prompts: prompts.filter((p) => p.trim()),
      });
      setAgentId(newAgentId);
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="max-w-4xl mx-auto px-4 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {agentId ? (
          <>
            <motion.div className="text-center" variants={itemVariants}>
              <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-12">
                Agent Created Successfully!
              </h1>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Your agent is ready to be added to your website. Follow the
                steps below to install it, then configure it with actions and documents.
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
                    <Globe className="h-7 w-7 text-brand" />
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Installation Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-foreground text-lg font-semibold flex items-center gap-2">
                        <Settings className="h-4 w-4 text-brand" />
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
                        <Code className="h-4 w-4 text-brand" />
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
                        {getAgentScript(selectedFramework, agentId)}
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
                        <Info className="h-4 w-4 text-accent" />
                        Installation Instructions
                      </Label>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-6">
                        <li>Copy the code snippet above</li>
                        <li>
                          Paste it between the <code>&lt;body&gt;</code> tags of
                          your website's HTML
                        </li>
                        <li>Save and publish your website changes</li>
                        <li>
                          Your agent will appear on your website at{' '}
                          <code>https://{websiteDomain}</code>
                        </li>
                        <li>
                          Need help? Visit our{' '}
                          <Link
                            href="/docs"
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
                        <Settings className="h-4 w-4 text-brand" />
                        What's Next?
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                          <Zap className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground text-sm mb-1">Actions</p>
                            <p className="text-xs text-muted-foreground">Create custom actions your agent can perform, like form submissions or API calls.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                          <FileText className="h-5 w-5 text-brand mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground text-sm mb-1">Documents</p>
                            <p className="text-xs text-muted-foreground">Add knowledge files to help your agent answer questions and provide better support.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand/90 transition-transform duration-200 shadow-md text-lg font-semibold w-full"
                      onClick={handleContinue}
                    >
                      Configure Your Agent
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
                  <CardHeader className="flex items-center space-x-2">
                    <Bot className="h-7 w-7 text-brand" />
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Agent Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-foreground flex items-center gap-2"
                      >
                        <Type className="h-4 w-4 text-brand" />
                        Agent Name
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        A unique name for your agent
                      </p>
                      <div className="relative mt-2">
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
                          placeholder="My Customer Service Bot"
                          className={`pl-10 border-[2px] ${errors.name ? 'border-red-500' : 'border-border'}`}
                          disabled={creatingAgent}
                        />
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1 ml-6">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="websiteDomain"
                        className="text-foreground flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-brand" />
                        Website Domain
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        The domain where your agent will be installed
                      </p>
                      <div className="relative mt-2">
                        <Input
                          id="websiteDomain"
                          value={websiteDomain}
                          onChange={(e) => {
                            setWebsiteDomain(e.target.value);
                            if (errors.websiteDomain) {
                              setErrors((prev) => ({
                                ...prev,
                                websiteDomain: undefined,
                              }));
                            }
                          }}
                          placeholder="example.com"
                          className={`pl-10 border-[2px] ${errors.websiteDomain ? 'border-red-500' : 'border-border'}`}
                          disabled={creatingAgent}
                        />
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      </div>
                      {errors.websiteDomain && (
                        <p className="text-sm text-red-500 mt-1 ml-6">
                          {errors.websiteDomain}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="model"
                        className="text-foreground flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4 text-brand" />
                        Language Model
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        Select the language model to power your agent
                      </p>
                      <div className="relative mt-2">
                        <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Select
                          value={model}
                          onValueChange={(value) =>
                            setModel(value as AgentModel)
                          }
                          disabled={creatingAgent}
                        >
                          <SelectTrigger className="pl-10 border-[2px] border-border">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {AgentModelList.map((modelValue) => (
                              <SelectItem key={modelValue} value={modelValue}>
                                {AgentModelDisplay[modelValue]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-brand" />
                        Suggested Prompts (Optional)
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1 ml-6">
                        These are example prompts users can choose from or use
                        as inspiration when interacting with your agent.
                      </p>
                      <div className="mt-4 ml-6 space-y-4">
                        {prompts.map((prompt, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <div className="flex-1">
                              <Textarea
                                value={prompt}
                                onChange={(e) =>
                                  updatePrompt(index, e.target.value)
                                }
                                placeholder="Enter a prompt for your agent..."
                                className="border-[2px] border-border resize-none"
                                rows={3}
                                disabled={creatingAgent}
                              />
                            </div>
                            {(prompts.length > 1 ||
                              (index === 0 && prompt.trim())) && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  if (index === 0 && prompts.length === 1) {
                                    updatePrompt(0, '');
                                  } else {
                                    removePrompt(index);
                                  }
                                }}
                                className="ml-auto rounded-full p-2 hover:bg-destructive/80 transition group-hover:scale-110"
                                disabled={creatingAgent}
                                tabIndex={-1}
                              >
                                <Trash2 className="h-4 w-4 transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addPrompt}
                          className="border-[2px] border-border hover:bg-secondary"
                          disabled={creatingAgent || prompts.length >= 4}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Prompt
                        </Button>
                        {prompts.length >= 4 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Maximum 4 prompts allowed.
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand/90 transition-transform duration-200 shadow-md text-lg font-semibold w-full"
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
