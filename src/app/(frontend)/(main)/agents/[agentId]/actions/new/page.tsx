'use client';

import { Suspense } from 'react'; // Import Suspense
import { motion } from 'framer-motion';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import DataInputsStep from '@/app/(frontend)/components/DataInputsStep';
import GeneralStep from '@/app/(frontend)/components/GeneralStep';
import ExecutionStep from '@/app/(frontend)/components/ExecutionStep';
import { Loader2 } from 'lucide-react'; // Import a loading icon
import { Card, CardContent } from '@/app/(frontend)/components/ui/card';
import { Button } from '@/app/(frontend)/components/ui/button';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

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
    functionName,
    setFunctionName,
    isEditorInteracted,
    setIsEditorInteracted,
    activeTab,
    setActiveTab,
    isCreatingAction,
    showSuccess,
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
        />
      )}

      {step === 3 && (
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
          functionName={functionName}
          setFunctionName={setFunctionName}
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
  const {
    showSuccess,
  } = useActionForm();

  return (
    <div className="min-h-screen bg-background">
      {showSuccess && (
        <>
          {/* Full viewport backdrop blur */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998]"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9998
            }}
            aria-hidden="true"
          />
          {/* Success modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-card border-[3px] border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              style={{ borderLeftColor: 'var(--color-destructive)' }}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Check className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Action Created Successfully!
                </h3>
                <p className="text-muted-foreground mb-6">
                  Your action has been created and is ready to use.
                </p>
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-border sticky top-0 bg-background z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-foreground">
            <span className="text-foreground">Blizzard</span>
            <span className="text-brand">Berry</span>
          </span>
        </div>
      </nav>

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
