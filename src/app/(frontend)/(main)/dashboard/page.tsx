'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/app/(frontend)/components/ui/button';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { Loader2, PlusCircle, Bot, Globe, Settings, Clock } from 'lucide-react';
import { useAgents } from '@/app/(frontend)/hooks/useAgents';
import posthog from 'posthog-js';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { agents, loadingAgents, fetchAgents } = useAgents();
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [navigatingToAgentId, setNavigatingToAgentId] = useState<string | null>(
    null
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      posthog.identify(session.user.id || session.user.email, {
        email: session.user.email,
        name: session.user.name,
      });

      posthog.capture('dashboard_viewed', {
        user_email: session.user.email,
      });
    }
  }, [status, session]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAgents();
    }
  }, [status, fetchAgents]);

  const handleCreateAgent = async () => {
    setIsCreatingAgent(true);
    posthog.capture('create_agent_clicked', {
      user_email: session?.user?.email,
    });

    router.push('/agents/new');
  };

  const handleNavigateToAgent = async (agentId: string) => {
    setNavigatingToAgentId(agentId);
    posthog.capture('agent_view_clicked', {
      agent_id: agentId,
      user_email: session?.user?.email,
    });

    router.push(`/agents/${agentId}`);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        className="min-h-screen flex flex-col items-center bg-background p-4 sm:p-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl w-full text-center mt-8 sm:mt-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-20">
            {session.user?.name
              ? `Welcome, ${session.user.name}!`
              : 'Welcome!'}
          </h1>
          <div>
            {loadingAgents ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-foreground" />
              </div>
            ) : agents.length === 0 ? (
              <>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 flex items-center justify-center">
                  <Bot className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-brand" />
                  No agents found. Create one to get started!
                </p>
                <div className="flex justify-center">
                  <Button
                    className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 w-full sm:w-auto"
                    onClick={handleCreateAgent}
                    disabled={isCreatingAgent}
                  >
                    {isCreatingAgent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Create New Agent
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                  Your Agents
                </h2>
                <span className="bg-brand/10 text-brand px-2 py-1 rounded-full text-sm font-medium">
                  {agents.length}
                </span>
                <Button
                  className="bg-brand text-primary-foreground border-[3px] border-border transition-all duration-200 text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:-translate-x-0.5 hover:bg-brand/90 ml-6"
                  onClick={handleCreateAgent}
                  disabled={isCreatingAgent}
                >
                  {isCreatingAgent ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Create New Agent
                    </>
                  )}
                </Button>
              </div>

              <div className={`grid gap-6 ${agents.length === 1 ? 'grid-cols-1 max-w-md mx-auto' : 'grid-cols-1 md:grid-cols-2'}`}>
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="border-[3px] border-border bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer text-left"
                    onClick={() => handleNavigateToAgent(agent.id)}
                  >
                    <CardContent className="pt-2 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-md bg-brand/10 flex items-center justify-center flex-shrink-0 -mt-1">
                            <Bot className="h-5 w-5 text-brand" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-lg sm:text-xl font-extrabold text-foreground leading-tight truncate group-hover:text-brand transition-colors mb-0.5">
                              {agent.name}
                            </h3>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                              <span className="inline-flex items-center gap-1 min-w-0">
                                <Globe className="h-4 w-4" />
                                <span className="truncate">{agent.websiteDomain}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 min-w-0">
                                <Settings className="h-4 w-4" />
                                <span className="truncate">{agent.model}</span>
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(agent.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start mt-1">
                          {navigatingToAgentId === agent.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-brand" />
                          ) : null}
                        </div>
                      </div>
                      
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}

