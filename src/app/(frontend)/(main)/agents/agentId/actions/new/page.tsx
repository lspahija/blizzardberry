'use client';

import { Suspense } from 'react'; // Import Suspense
import { motion } from 'framer-motion';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import DataInputsStep from '@/app/(frontend)/components/DataInputsStep';
import GeneralStep from '@/app/(frontend)/components/GeneralStep';
import ExecutionStep from '@/app/(frontend)/components/ExecutionStep';
import { Loader2 } from 'lucide-react'; // Import a loading icon

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
    handleNextStep,
    handleBack,
    handleCreateAction,
  } = useActionForm();

  return (
    <motion.div
      className="max-w-4xl mx-auto px-4 py-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 mb-12 text-center"
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
        />
      )}
    </motion.div>
  );
}

export default function NewActionPage() {
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

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
          </div>
        }
      >
        <ActionFormContent />
      </Suspense>
    </div>
  );
}
