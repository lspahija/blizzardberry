'use client';

import { Suspense } from 'react'; // Import Suspense
import { motion } from 'framer-motion';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import UnifiedActionForm from '@/app/(frontend)/components/UnifiedActionForm';
import ClientActionImplementation from '@/app/(frontend)/components/ClientActionImplementation';
import SuccessOverlay from '@/app/(frontend)/components/ui/success-overlay';
import { Loader2 } from 'lucide-react'; // Import a loading icon
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ExecutionContext } from '@/app/api/lib/model/action/baseAction';
import posthog from 'posthog-js';

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function ActionFormContent() {
  const {
    baseAction,
    setBaseAction,
    dataInputs,
    setDataInputs,
    apiUrl,
    setApiUrl,
    apiMethod,
    setApiMethod,
    headers,
    setHeaders,
    apiBody,
    setApiBody,
    isCreatingAction,
    showSuccess,
    createdClientAction,
    handleCreateAction,
  } = useActionForm();

  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;

  const handleContinueToAgent = () => {
    posthog.capture('action_creation_completed', {
      agent_id: agentId,
      action_type: baseAction.executionContext,
    });
    router.push(`/agents/${agentId}`);
  };


  // Show success screen for client actions
  if (
    createdClientAction &&
    baseAction.executionContext === ExecutionContext.CLIENT
  ) {
    return (
      <motion.div
        className="max-w-4xl mx-auto px-4 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-12 text-center"
          variants={itemVariants}
        >
          Action Created Successfully!
        </motion.h1>

        <ClientActionImplementation
          action={createdClientAction}
          dataInputs={dataInputs}
          onContinue={handleContinueToAgent}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-8 text-center pt-8"
        variants={itemVariants}
      >
        Create Custom Action
      </motion.h1>

      <UnifiedActionForm
        baseAction={baseAction}
        setBaseAction={setBaseAction}
        dataInputs={dataInputs}
        setDataInputs={setDataInputs}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        apiMethod={apiMethod}
        setApiMethod={setApiMethod}
        headers={headers}
        setHeaders={setHeaders}
        apiBody={apiBody}
        setApiBody={setApiBody}
        onCreateAction={handleCreateAction}
        isCreatingAction={isCreatingAction}
      />

      {/* Show success overlay for server actions */}
      {showSuccess && baseAction.executionContext === ExecutionContext.SERVER && (
        <SuccessOverlay />
      )}
    </motion.div>
  );
}

export default function NewActionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
        }
      >
        <ActionFormContent />
      </Suspense>
    </div>
  );
}
