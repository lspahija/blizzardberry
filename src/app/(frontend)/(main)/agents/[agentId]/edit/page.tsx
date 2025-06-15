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
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import { use } from 'react';
import { Bot, Globe, Type, Settings, Loader2 } from 'lucide-react';
import { Info } from 'lucide-react';
import {
  AgentModel,
  AgentModelDisplay,
  AgentModelList,
} from '@/app/api/lib/model/agent/agent';

export default function EditAgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [model, setModel] = useState<AgentModel>(AgentModel.GEMINI_2_0_FLASH);
  const [isLoading, setIsLoading] = useState(true);
  const { handleUpdateAgent } = useAgents();
  const { agentId } = use(params);

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

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${agentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch agent');
        }
        const data = await response.json();
        setName(data.agent.name);
        setWebsiteDomain(data.agent.websiteDomain);
        setModel(data.agent.model as AgentModel);
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  const onUpdateAgent = async () => {
    try {
      await handleUpdateAgent(agentId, { name, websiteDomain, model });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-border sticky top-0 bg-background z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-foreground">
            <span className="text-foreground">Blizzard</span>
            <span className="text-brand">Berry</span>
          </span>
        </div>
      </nav>

      <motion.div
        className="max-w-4xl mx-auto px-4 py-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8 flex items-center bg-muted border-l-4 border-destructive p-4 rounded-lg shadow-md"
          variants={itemVariants}
        >
          <Info className="h-6 w-6 text-destructive mr-3" />
          <span className="text-foreground text-base">
            Update your agent details below. Changes will be reflected
            immediately after saving.
          </span>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-12 text-center"
          variants={itemVariants}
        >
          Edit Agent
        </motion.h1>

        <motion.div
          variants={cardVariants}
          initial="hidden"
          whileInView="visible"
        >
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-foreground rounded-lg translate-x-1 translate-y-1"></div>
            <Card className="relative bg-muted border-[3px] border-border rounded-lg shadow-xl border-l-8 border-l-destructive">
              <CardHeader className="flex items-center space-x-2">
                <Bot className="h-7 w-7 text-destructive" />
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
                    <Type className="h-4 w-4 text-destructive" />
                    Agent Name
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    A unique name for your agent
                  </p>
                  <div className="relative mt-2">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Customer Service Bot"
                      className="pl-10 border-[2px] border-border"
                    />
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="websiteDomain"
                    className="text-foreground flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-destructive" />
                    Website Domain
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    The domain of the website where this agent will be installed
                  </p>
                  <div className="relative mt-2">
                    <Input
                      id="websiteDomain"
                      value={websiteDomain}
                      onChange={(e) => setWebsiteDomain(e.target.value)}
                      placeholder="example.com"
                      className="pl-10 border-[2px] border-border"
                    />
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="model"
                    className="text-foreground flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4 text-destructive" />
                    AI Model
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 ml-6">
                    The AI model that powers your agent
                  </p>
                  <div className="relative mt-2">
                    <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Select
                      value={model}
                      onValueChange={(value) => setModel(value as AgentModel)}
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
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-destructive text-destructive-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-destructive/80 transition-transform duration-200 shadow-md text-lg font-semibold"
                    onClick={onUpdateAgent}
                  >
                    Save Changes
                  </Button>
                  <Button
                    className="flex-1 bg-accent text-accent-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-accent/80 transition-transform duration-200 shadow-md text-lg font-semibold"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
