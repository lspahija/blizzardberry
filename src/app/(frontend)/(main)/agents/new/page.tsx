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
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Bot,
  Globe,
  Type,
  Settings,
  Loader2,
  Info,
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
    <div className="min-h-screen bg-[#FFFDF8]">
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-gray-900 sticky top-0 bg-[#FFFDF8] z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">
            <span className="text-gray-900">Blizzard</span>
            <span className="text-[#FE4A60]">Berry</span>
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
              <CheckCircle2 className="w-16 h-16 text-[#FE4A60] mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 mb-12">
                Agent Created Successfully!
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
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
                <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-xl border-l-8 border-l-[#FE4A60]">
                  <CardHeader className="flex items-center space-x-2">
                    <Bot className="h-7 w-7 text-[#FE4A60]" />
                    <CardTitle className="text-2xl font-semibold text-gray-900">
                      Install Your Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <p className="text-base text-gray-600 mb-4">
                        To add your agent to your website, copy the code snippet
                        below and paste it between the <code>&lt;body&gt;</code>{' '}
                        tags of your website's HTML.
                      </p>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            border: '2px solid #1a1a1a',
                            backgroundColor: '#1a1a1a',
                          }}
                        >
                          {agentId
                            ? getAgentScript(selectedFramework, agentId)
                            : ''}
                        </SyntaxHighlighter>
                        <Button
                          onClick={handleCopy}
                          className="absolute top-2 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md rounded-full p-2 text-base font-semibold"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        This script loads your agent with the unique ID:{' '}
                        <code>{agentId}</code>.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-[#FE4A60] pl-3 mb-2">
                        Next Steps
                      </h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-2 text-base">
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
                          <a
                            href="https://blizzardberry.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FE4A60] hover:underline"
                          >
                            documentation{' '}
                            <ExternalLink className="inline w-4 h-4" />
                          </a>
                          .
                        </li>
                      </ul>
                    </div>
                    <Button
                      className="w-full bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 hover:bg-[#ff6a7a] transition-transform duration-200 shadow-md text-lg font-semibold"
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
              className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 mb-12 text-center"
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
                <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
                <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-xl border-l-8 border-l-[#FE4A60]">
                  <CardHeader className="flex items-center space-x-2">
                    <Bot className="h-7 w-7 text-[#FE4A60]" />
                    <CardTitle className="text-2xl font-semibold text-gray-900">
                      Agent Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-gray-900 flex items-center gap-2"
                      >
                        <Type className="h-4 w-4 text-[#FE4A60]" />
                        Agent Name
                      </Label>
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        A unique name for your agent
                      </p>
                      <div className="relative mt-2">
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="My Customer Service Bot"
                          className="pl-10 border-[2px] border-gray-900"
                        />
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="websiteDomain"
                        className="text-gray-900 flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-[#FE4A60]" />
                        Website Domain
                      </Label>
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        The domain of the website where this agent will be
                        installed
                      </p>
                      <div className="relative mt-2">
                        <Input
                          id="websiteDomain"
                          value={websiteDomain}
                          onChange={(e) => setWebsiteDomain(e.target.value)}
                          placeholder="example.com"
                          className="pl-10 border-[2px] border-gray-900"
                        />
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="model"
                        className="text-gray-900 flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4 text-[#FE4A60]" />
                        Language Model
                      </Label>
                      <p className="text-sm text-gray-600 mt-1 ml-6">
                        Select the language model to power your agent
                      </p>
                      <div className="relative mt-2">
                        <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                        <Select
                          value={model}
                          onValueChange={(value) =>
                            setModel(value as AgentModel)
                          }
                        >
                          <SelectTrigger className="pl-10 border-[2px] border-gray-900">
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
                      className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 hover:bg-[#ff6a7a] transition-transform duration-200 shadow-md text-lg font-semibold w-full"
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
