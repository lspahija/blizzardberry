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
  const { selectedFramework, setSelectedFramework } = useFramework();
  const { handleCreateAgent } = useAgents();

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
    navigator.clipboard.writeText(getAgentScript(selectedFramework, agentId));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push('/dashboard');
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
      });
      setAgentId(newAgentId);
    } catch (error) {
      console.error('Error creating agent:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-border sticky top-0 bg-background z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-foreground">
            <span className="text-foreground">Blizzard</span>
            <span className="text-brand">Berry</span>
          </span>
        </div>
      </nav>

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
                steps below to install it.
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
                    <Bot className="h-7 w-7 text-brand" />
                    <CardTitle className="text-2xl font-semibold text-foreground">
                      Install Your Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <p className="text-base text-muted-foreground mb-4">
                        To add your agent to your website, copy the code snippet
                        below and paste it between the <code>&lt;body&gt;</code>{' '}
                        tags of your website's HTML.
                      </p>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Select Framework
                        </label>
                        <Select
                          value={selectedFramework}
                          onValueChange={(value) =>
                            setSelectedFramework(value as Framework)
                          }
                        >
                          <SelectTrigger className="w-[200px]">
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
                      <div className="relative">
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
                          {agentId
                            ? getAgentScript(selectedFramework, agentId)
                            : ''}
                        </SyntaxHighlighter>
                        <Button
                          onClick={handleCopy}
                          className="absolute top-2 right-2 bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md rounded-full p-2 text-base font-semibold hover:bg-secondary/90"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This script loads your agent with the unique ID:{' '}
                        <code>{agentId}</code>.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground border-l-4 border-brand pl-3 mb-2">
                        Next Steps
                      </h3>
                      <ul className="list-disc list-inside text-muted-foreground space-y-2 text-base">
                        <li>
                          Paste the code snippet in your website's HTML, ideally
                          just before the closing <code>&lt;/body&gt;</code>{' '}
                          tag.
                        </li>
                        <li>Save and publish your website changes.</li>
                        <li>
                          Your agent will appear on your website at{' '}
                          <code>https://{websiteDomain}</code>.
                        </li>
                        <li>
                          Need help? Visit our{' '}
                          <Link
                            href="/docs"
                            className="text-brand hover:underline"
                          >
                            documentation{' '}
                            <ExternalLink className="inline w-4 h-4" />
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <Button
                      className="w-full bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand/90 transition-transform duration-200 shadow-md text-lg font-semibold"
                      onClick={handleContinue}
                    >
                      Go to Dashboard
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
                        The domain of the website where this agent will be
                        installed
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
                        <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                        <Select
                          value={model}
                          onValueChange={(value) =>
                            setModel(value as AgentModel)
                          }
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
                    <Button
                      className="bg-brand text-primary-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand/90 transition-transform duration-200 shadow-md text-lg font-semibold w-full"
                      onClick={onCreateAgent}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Create Agent
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
