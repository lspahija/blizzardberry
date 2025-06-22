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
import { Bot, Globe, Type, Settings, Loader2 } from 'lucide-react';
import {
  AgentModel,
  AgentModelDisplay,
  AgentModelList,
} from '@/app/api/lib/model/agent/agent';
import { toast } from 'sonner';

export default function EditAgentPage({
  params,
}: {
  params: { teamSlug: string; agentId: string };
}) {
  const router = useRouter();
  const { teamSlug, agentId } = params;

  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [model, setModel] = useState<AgentModel>(AgentModel.GEMINI_2_0_FLASH);

  const {
    agents,
    loading: agentsLoading,
    handleUpdateAgent,
    updatingAgent,
  } = useAgents(teamSlug);

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
    if (agents.length > 0) {
      const agentToEdit = agents.find((agent) => agent.id === agentId);
      if (agentToEdit) {
        setName(agentToEdit.name);
        setWebsiteDomain(agentToEdit.websiteDomain);
        setModel(agentToEdit.model as AgentModel);
      }
    }
  }, [agents, agentId]);

  const onUpdateAgent = async () => {
    try {
      await handleUpdateAgent(agentId, { name, websiteDomain, model });
      toast.success('Agent updated successfully!');
      router.push(`/dashboard/${teamSlug}/agents`);
    } catch (error) {
      toast.error('Failed to update agent.');
      console.error('Error updating agent:', error);
    }
  };

  if (agentsLoading) {
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
            <div className="absolute inset-0 bg-border rounded-xl translate-x-1 translate-y-1"></div>
            <Card className="relative bg-card border-[3px] border-border rounded-lg shadow-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Bot className="h-7 w-7 text-brand" />
                  <CardTitle className="text-2xl font-semibold text-foreground">
                    Agent Configuration
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center text-lg">
                    <Type className="h-4 w-4 mr-2" />
                    Agent Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Customer Service Bot"
                    className="text-lg"
                    disabled={updatingAgent}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="websiteDomain"
                    className="flex items-center text-lg"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website Domain
                  </Label>
                  <Input
                    id="websiteDomain"
                    value={websiteDomain}
                    onChange={(e) => setWebsiteDomain(e.target.value)}
                    placeholder="example.com"
                    className="text-lg"
                    disabled={updatingAgent}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model" className="flex items-center text-lg">
                    <Settings className="h-4 w-4 mr-2" />
                    Language Model
                  </Label>
                  <Select
                    value={model}
                    onValueChange={(value) => setModel(value as AgentModel)}
                    disabled={updatingAgent}
                  >
                    <SelectTrigger className="text-lg">
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
                <Button
                  className="w-full text-lg py-6 bg-brand hover:bg-brand/90"
                  onClick={onUpdateAgent}
                  disabled={updatingAgent}
                >
                  {updatingAgent ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
