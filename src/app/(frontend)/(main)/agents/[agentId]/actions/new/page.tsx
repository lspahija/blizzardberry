'use client';

import { Suspense } from 'react'; // Import Suspense
import { motion } from 'framer-motion';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import DataInputsStep from '@/app/(frontend)/components/DataInputsStep';
import GeneralStep from '@/app/(frontend)/components/GeneralStep';
import ExecutionStep from '@/app/(frontend)/components/ExecutionStep';
import ClientActionImplementation from '@/app/(frontend)/components/ClientActionImplementation';
import { Loader2 } from 'lucide-react'; // Import a loading icon
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ExecutionContext } from '@/app/api/lib/model/action/baseAction';

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
    step,
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
    isEditorInteracted,
    setIsEditorInteracted,
    activeTab,
    setActiveTab,
    isCreatingAction,
    showSuccess,
    createdClientAction,
    handleNextStep,
    handleBack,
    handleCreateAction,
    handleDeleteAction,
  } = useActionForm();

  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;

  const handleSuccessClose = () => {
    router.push(`/agents/${agentId}`);
  };

  const handleContinueToAgent = () => {
    router.push(`/agents/${agentId}`);
  };

  if (createdClientAction && baseAction.executionContext === ExecutionContext.CLIENT) {
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
      className="max-w-4xl mx-auto px-4 py-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground mb-12 text-center"
        variants={itemVariants}
      >
        Create Custom Action
      </motion.h1>

      {step === 1 && (
        <GeneralStep
          baseAction={baseAction}
          setBaseAction={setBaseAction}
          onNext={handleNextStep}
        />
      )}

      {step === 2 && (
        <DataInputsStep
          dataInputs={dataInputs}
          setDataInputs={setDataInputs}
          onNext={handleNextStep}
          onBack={handleBack}
          isClientAction={baseAction.executionContext === ExecutionContext.CLIENT}
          onCreateAction={handleCreateAction}
          isCreatingAction={isCreatingAction}
        />
      )}

      {step === 3 && baseAction.executionContext === ExecutionContext.SERVER && (
        <ExecutionStep
          baseAction={baseAction}
          dataInputs={dataInputs}
          apiUrl={apiUrl}
          setApiUrl={setApiUrl}
          apiMethod={apiMethod}
          setApiMethod={setApiMethod}
          headers={headers}
          setHeaders={setHeaders}
          apiBody={apiBody}
          setApiBody={setApiBody}
          isEditorInteracted={isEditorInteracted}
          setIsEditorInteracted={setIsEditorInteracted}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCreate={handleCreateAction}
          onBack={handleBack}
          isCreatingAction={isCreatingAction}
          showSuccess={showSuccess}
        />
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
