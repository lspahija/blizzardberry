'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useActionForm } from '@/app/(frontend)/hooks/useActionForm';
import DataInputsStep from '@/app/(frontend)/components/DataInputsStep';
import GeneralStep from '@/app/(frontend)/components/GeneralStep';
import ExecutionStep from '@/app/(frontend)/components/ExecutionStep';
import { Loader2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Action, ExecutionContext, Parameter, ParameterType } from '@/app/api/lib/model/action/baseAction';
import { BackendAction, BackendModel, HttpMethod } from '@/app/api/lib/model/action/backendAction';
import { FrontendAction, FrontendModel } from '@/app/api/lib/model/action/frontendAction';
import { toast } from 'sonner';

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

function ActionEditContent() {
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
    handleNextStep,
    handleBack,
    handleCreateAction,
    handleDeleteAction,
  } = useActionForm(true);

  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  const actionId = params.actionId as string;

  const [loadingAction, setLoadingAction] = useState(true);
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch the action to edit
  useEffect(() => {
    if (isInitialized) return; // Prevent re-initialization
    
    async function fetchAction() {
      try {
        console.log('Fetching action data for editing...');
        const response = await fetch(`/api/agents/${agentId}/actions/${actionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch action');
        }
        const data = await response.json();
        const action: Action = data.action;

        console.log('Action data loaded:', action);

        // Populate the form with existing action data
        setBaseAction({
          id: action.id,
          name: action.name,
          description: action.description,
          executionContext: action.executionContext,
          agentId: action.agentId,
        });

        // Set data inputs based on action type
        if (action.executionContext === ExecutionContext.SERVER) {
          const backendAction = action as BackendAction;
          const parameters = backendAction.executionModel.parameters || [];
          
          if (parameters.length === 0) {
            setDataInputs([{ name: '', type: 'Text', description: '', isArray: false}]);
          } else {
            setDataInputs(parameters.map(param => ({
              name: param.name,
              type: param.type.charAt(0).toUpperCase() + param.type.slice(1),
              description: param.description || '',
              isArray: param.isArray || false,
            })));
          }

          // Set API details
          setApiUrl(backendAction.executionModel.request.url);
          setApiMethod(backendAction.executionModel.request.method);
          
          if (backendAction.executionModel.request.headers) {
            const headerEntries = Object.entries(backendAction.executionModel.request.headers);
            if (headerEntries.length > 0) {
              setHeaders(headerEntries.map(([key, value]) => ({ key, value: String(value) })));
            } else {
              setHeaders([{ key: '', value: '' }]);
            }
          } else {
            setHeaders([{ key: '', value: '' }]);
          }

          if (backendAction.executionModel.request.body) {
            setApiBody(JSON.stringify(backendAction.executionModel.request.body, null, 2));
          } else {
            setApiBody('');
          }
        } else {
          const frontendAction = action as FrontendAction;
          const parameters = frontendAction.executionModel.parameters || [];
          
          if (parameters.length === 0) {
            setDataInputs([{ name: '', type: 'Text', description: '', isArray: false}]);
          } else {
            setDataInputs(parameters.map(param => ({
              name: param.name,
              type: param.type.charAt(0).toUpperCase() + param.type.slice(1),
              description: param.description || '',
              isArray: param.isArray || false,
            })));
          }

        }
        
        console.log('Form data populated successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Error fetching action:', error);
        toast.error('Failed to fetch action. Please try again.');
        router.push(`/agents/${agentId}`);
      } finally {
        setLoadingAction(false);
      }
    }

    fetchAction();
  }, [agentId, actionId, setBaseAction, setDataInputs, setApiUrl, setApiMethod, setHeaders, setApiBody, router, isInitialized]);

  const handleUpdateAction = async () => {
    setIsUpdatingAction(true);
    let action: Action;

    if (baseAction.executionContext === ExecutionContext.SERVER) {
      const requestHeaders: any = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      let requestBody: any | undefined;
      try {
        if (apiBody) {
          requestBody = JSON.parse(apiBody);
        }
      } catch (error) {
        console.error('Invalid JSON in API body:', error);
        toast.error('Invalid JSON in API body. Please check and try again.');
        setIsUpdatingAction(false);
        return;
      }

      const parameters: Parameter[] = dataInputs
        .filter((input) => input.name)
        .map((input) => ({
          name: input.name,
          description: input.description,
          type: input.type.toLowerCase() as ParameterType,
          isArray: input.isArray,
        }));

      const requestModel = {
        url: apiUrl,
        method: apiMethod as HttpMethod,
        headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
        body: requestBody,
      };

      const httpModel: BackendModel = {
        request: requestModel,
        parameters,
      };

      action = {
        ...baseAction,
        executionContext: ExecutionContext.SERVER,
        executionModel: httpModel,
      };
    } else {
      const frontendParameters: Parameter[] = dataInputs
        .filter((input) => input.name)
        .map((input) => ({
          name: input.name,
          description: input.description,
          type: input.type.toLowerCase() as ParameterType,
          isArray: input.isArray,
        }));

      const frontendModel: FrontendModel = {
        functionName: baseAction.name,
        parameters: frontendParameters,
      };

      action = {
        ...baseAction,
        executionContext: ExecutionContext.CLIENT,
        executionModel: frontendModel,
      };
    }

    try {
      const response = await fetch(`/api/agents/${agentId}/actions/${actionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });

      if (!response.ok) {
        throw new Error('Failed to update action');
      }

      toast.success('Action updated successfully!');
      router.push(`/agents/${agentId}`);
    } catch (error) {
      console.error('Error updating action:', error);
      toast.error('Failed to update action. Please try again.');
    } finally {
      setIsUpdatingAction(false);
    }
  };

  const handleSuccessClose = () => {
    router.push(`/agents/${agentId}`);
  };

  // Debug logging
  console.log('Edit page render - step:', step, 'baseAction:', baseAction, 'dataInputs:', dataInputs, 'isInitialized:', isInitialized);

  if (loadingAction) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
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
        Edit Action
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
          isEditorInteracted={isEditorInteracted}
          setIsEditorInteracted={setIsEditorInteracted}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onCreate={handleUpdateAction}
          onBack={handleBack}
          isCreatingAction={isUpdatingAction}
          showSuccess={showSuccess}
          isEditing={true}
        />
      )}
    </motion.div>
  );
}

export default function EditActionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          </div>
        }
      >
        <ActionEditContent />
      </Suspense>
    </div>
  );
} 