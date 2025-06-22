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
import { useState, useEffect, useMemo } from 'react';
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
  Loader2,
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
import { useSession } from 'next-auth/react';
import { useContext, use } from 'react';
import { TeamContext } from '@/app/(frontend)/contexts/TeamContext';
import { toast } from 'sonner';

interface NewAgentPageProps {
  params: Promise<{ teamSlug: string }>;
}

interface CreateAgentParamsFrontend {
  name: string;
  websiteDomain: string;
  model: string;
}

export default function NewAgentPage({ params }: NewAgentPageProps) {
  const router = useRouter();
  const { teamSlug } = use(params);
  const { data: session } = useSession();
  const { teams, loading: teamsLoading } = useContext(TeamContext);
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
  const { handleCreateAgent, creatingAgent } = useAgents(teamSlug);

  // Find team by slug from the teams context
  const teamFromSlug = useMemo(() => {
    if (teamSlug && teams) {
      return teams.find((t) => t.slug === teamSlug);
    }
    return null;
  }, [teamSlug, teams]);

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
    if (!agentId) return;
    navigator.clipboard.writeText(getAgentScript(selectedFramework, agentId));
    setCopied(true);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push(`/dashboard/${teamSlug}/agents`);
  };

  const onCreateAgent = async () => {
    console.log('onCreateAgent called with:', { name, websiteDomain, model, teamSlug, teams, teamsLoading, teamFromSlug });
    
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

    if (teamsLoading) {
      console.log('Teams still loading, please wait...');
      toast.info('Verifying team information, please wait...');
      return;
    }

    if (!teamFromSlug) {
      console.error('No team available:', { teamSlug, teams, teamsLoading });
      toast.error('Team not found. Please try refreshing the page.');
      return;
    }

    try {
      console.log('Calling handleCreateAgent with:', { name, websiteDomain, model });
      const newAgentId = await handleCreateAgent({
        name,
        websiteDomain,
        model,
      });

      console.log('handleCreateAgent result:', newAgentId);

      if (newAgentId) {
        setAgentId(newAgentId);
        toast.success('Agent created successfully!');
      } else {
        toast.error('Failed to create agent. Please try again.');
      }
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('An unexpected error occurred.');
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

      {teamsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
            <p className="text-muted-foreground">Loading team information...</p>
          </div>
        </div>
      ) : (
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
                            language="javascript"
                            style={vscDarkPlus}
                            customStyle={{
                              borderRadius: '0.5rem',
                              border: '2px solid var(--border)',
                              padding: '1.5rem',
                            }}
                            wrapLongLines
                          >
                            {getAgentScript(selectedFramework, agentId)}
                          </SyntaxHighlighter>
                          <Button
                            onClick={handleCopy}
                            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-md"
                          >
                            {copied ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              <motion.div
                className="text-center mt-12"
                variants={itemVariants}
              >
                <Button
                  onClick={handleContinue}
                  className="bg-brand hover:bg-brand/90 text-primary-foreground font-bold py-3 px-8 rounded-lg text-lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Go to Agents Dashboard
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div className="text-center" variants={itemVariants}>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
                  Create a New Agent
                </h1>
                <p className="text-lg text-muted-foreground mt-4 mb-12 max-w-2xl mx-auto">
                  Configure your agent by giving it a name and specifying the
                  website domain where it will operate.
                </p>
              </motion.div>

              <div className="relative">
                <div className="absolute inset-0 bg-border rounded-xl translate-x-1 translate-y-1"></div>
                <motion.div
                  className="relative"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                >
                  <form
                    onSubmit={(e) => {
                      console.log('Form submitted!');
                      e.preventDefault();
                      onCreateAgent();
                    }}
                  >
                    <motion.div variants={cardVariants}>
                      <Card className="border-[3px] border-border bg-card shadow-xl rounded-xl">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <Bot className="h-6 w-6 text-brand" />
                            <CardTitle className="text-2xl font-bold text-foreground">
                              Agent Details
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label
                              htmlFor="name"
                              className="text-lg flex items-center"
                            >
                              <Type className="mr-2 h-4 w-4" />
                              Agent Name
                            </Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g., Customer Support Bot"
                              className="text-lg"
                              disabled={creatingAgent}
                            />
                            {errors.name && (
                              <p className="text-red-500 text-sm">
                                {errors.name}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="websiteDomain"
                              className="text-lg flex items-center"
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              Website Domain
                            </Label>
                            <Input
                              id="websiteDomain"
                              value={websiteDomain}
                              onChange={(e) =>
                                setWebsiteDomain(e.target.value)
                              }
                              placeholder="e.g., your-website.com"
                              className="text-lg"
                              disabled={creatingAgent}
                            />
                            {errors.websiteDomain && (
                              <p className="text-red-500 text-sm">
                                {errors.websiteDomain}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="model"
                              className="text-lg flex items-center"
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Select Model
                            </Label>
                            <Select
                              value={model}
                              onValueChange={(value) =>
                                setModel(value as AgentModel)
                              }
                              disabled={creatingAgent}
                            >
                              <SelectTrigger className="text-lg">
                                <SelectValue placeholder="Select a model" />
                              </SelectTrigger>
                              <SelectContent>
                                {AgentModelList.map((model) => (
                                  <SelectItem key={model} value={model}>
                                    {AgentModelDisplay[model]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="submit"
                            className="w-full text-lg py-6 bg-brand hover:bg-brand/90"
                            disabled={creatingAgent || teamsLoading}
                          >
                            {creatingAgent ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating Agent...
                              </>
                            ) : (
                              'Create Agent'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
