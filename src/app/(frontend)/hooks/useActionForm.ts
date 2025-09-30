import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ExecutionContext,
  BaseAction,
  Parameter,
  ParameterType,
} from '@/app/api/lib/model/action/baseAction';
import {
  BackendModel,
  Body,
  Headers,
  HttpMethod,
  HttpRequest,
} from '@/app/api/lib/model/action/backendAction';
import { FrontendModel } from '@/app/api/lib/model/action/frontendAction';
import { Action } from '@/app/api/lib/model/action/baseAction';
import { toast } from 'sonner';
import { toCamelCase } from '../lib/actionUtils';
import posthog from 'posthog-js';

interface DataInput {
  name: string;
  type: string;
  description: string;
  isArray: boolean;
}

interface Header {
  key: string;
  value: string;
}

export const useActionForm = (isEditing = false) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agentId } = useParams();

  const [step, setStep] = useState(1);
  const [baseAction, setBaseAction] = useState<BaseAction>({
    id: null,
    name: '',
    description: '',
    executionContext: ExecutionContext.SERVER,
    agentId: agentId as string,
  });
  const [dataInputs, setDataInputs] = useState<DataInput[]>([
    { name: '', type: 'Text', description: '', isArray: false },
  ]);
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [apiBody, setApiBody] = useState('');
  const [isEditorInteracted, setIsEditorInteracted] = useState(false);
  const [activeTab, setActiveTab] = useState('headers');
  const [isCreatingAction, setIsCreatingAction] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdClientAction, setCreatedClientAction] = useState<Action | null>(
    null
  );

  useEffect(() => {
    console.log('createdClientAction state changed:', createdClientAction);
  }, [createdClientAction]);

  useEffect(() => {
    // Don't update step if we're showing success
    if (showSuccess) return;

    const stepParam = searchParams.get('step');
    let currentStep = 1;

    if (stepParam) {
      const stepNum = parseInt(stepParam);
      if (stepNum >= 1 && stepNum <= 3) {
        currentStep = stepNum;
      }
    }
    setStep(currentStep);

    // Only handle URL updates for new action creation, not editing
    if (!isEditing) {
      const typeParam = searchParams.get('type');
      if (typeParam) {
        const newExecutionContext =
          typeParam === 'server'
            ? ExecutionContext.SERVER
            : ExecutionContext.CLIENT;

        setBaseAction((prev) => ({
          ...prev,
          executionContext: newExecutionContext,
        }));

        const actionTypeParam =
          newExecutionContext === ExecutionContext.SERVER ? 'server' : 'client';
        router.replace(
          `/agents/${agentId}/actions/new?type=${actionTypeParam}&step=${currentStep}`
        );
      } else if (stepParam && currentStep > 1) {
        // Only add type parameter if we're not on step 1 (to allow changing action type on step 1)
        const actionTypeParam =
          baseAction.executionContext === ExecutionContext.SERVER
            ? 'server'
            : 'client';
        router.replace(
          `/agents/${agentId}/actions/new?type=${actionTypeParam}&step=${currentStep}`
        );
      }
    }
  }, [
    searchParams,
    router,
    agentId,
    baseAction.executionContext,
    showSuccess,
    isEditing,
  ]);

  // Handle URL updates when execution context changes
  useEffect(() => {
    if (!isEditing && !showSuccess) {
      const currentTypeParam = searchParams.get('type');
      const currentStepParam = searchParams.get('step');
      const currentStep = parseInt(currentStepParam || '1');
      const expectedTypeParam = baseAction.executionContext === ExecutionContext.SERVER ? 'server' : 'client';
      
      // Only update URL if we're not on step 1 and the type parameter doesn't match
      if (currentStep > 1 && currentTypeParam && currentTypeParam !== expectedTypeParam) {
        router.replace(
          `/agents/${agentId}/actions/new?type=${expectedTypeParam}&step=${currentStep}`
        );
      }
    }
  }, [baseAction.executionContext, searchParams, router, agentId, showSuccess, isEditing]);

  const updateUrl = (newStep: number) => {
    // Don't update URL if we're showing success
    if (showSuccess) return;

    // For edit mode, just update the step without changing the URL
    if (isEditing) {
      setStep(newStep);
      return;
    }

    if (newStep > 1) {
      const actionTypeParam =
        baseAction.executionContext === ExecutionContext.SERVER
          ? 'server'
          : 'client';
      router.push(
        `/agents/${agentId}/actions/new?type=${actionTypeParam}&step=${newStep}`
      );
    } else {
      router.push(`/agents/${agentId}/actions/new?step=${newStep}`);
    }
    setStep(newStep);
  };

  const handleNextStep = () => {
    if (showSuccess) return;

    if (baseAction.executionContext === ExecutionContext.CLIENT && step === 2) {
      return;
    }

    if (
      isEditing &&
      baseAction.executionContext === ExecutionContext.CLIENT &&
      step === 2
    ) {
      return;
    }

    if (step < 3) {
      updateUrl(step + 1);
    }
  };

  const handleBack = () => {
    if (showSuccess) return;
    if (step > 1) {
      const newStep = step - 1;
      // When going back to step 1, remove the type parameter to allow changing action type
      if (newStep === 1) {
        if (isEditing) {
          setStep(newStep);
        } else {
          router.push(`/agents/${agentId}/actions/new?step=${newStep}`);
          setStep(newStep);
        }
      } else {
        updateUrl(newStep);
      }
    } else {
      if (isEditing) {
        router.push(`/agents/${agentId}`);
      } else {
        router.push(`/agents/${agentId}`);
      }
    }
  };

  const handleCreateAction = async () => {
    setIsCreatingAction(true);

    posthog.capture('action_creation_started', {
      agent_id: agentId,
      execution_context: baseAction.executionContext,
      action_name: baseAction.name,
      data_inputs_count: dataInputs.filter((input) => input.name).length,
    });

    let action: Action;

    if (baseAction.executionContext === ExecutionContext.SERVER) {
      const requestHeaders: Headers = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      let requestBody: Body | undefined;
      // Don't validate JSON here since template variables may make it invalid
      // Validation will happen after variable substitution on the backend
      if (apiBody) {
        requestBody = apiBody as Body;
      }

      const parameters: Parameter[] = dataInputs
        .filter((input) => input.name)
        .map((input) => ({
          name: input.name,
          description: input.description,
          type: input.type.toLowerCase() as ParameterType,
          isArray: input.isArray,
        }));

      const requestModel: HttpRequest = {
        url: apiUrl,
        method: apiMethod as HttpMethod,
        headers:
          Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
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
        functionName: toCamelCase(baseAction.name || 'customAction'),
        parameters: frontendParameters,
      };

      action = {
        ...baseAction,
        executionContext: ExecutionContext.CLIENT,
        executionModel: frontendModel,
      };
    }

    try {
      const response = await fetch(`/api/agents/${agentId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (
          response.status === 403 &&
          errorData.error === 'Action limit reached for this subscription tier'
        ) {
          toast.error(
            'You have reached the maximum number of actions allowed for your subscription tier. Please upgrade your plan to create more actions.'
          );
          throw new Error('Action limit reached');
        }
        throw new Error('Failed to create action');
      }

      const createdAction = await response.json();
      console.log('Action created successfully');
      console.log('Response data:', createdAction);

      posthog.capture('action_creation_success', {
        agent_id: agentId,
        execution_context: baseAction.executionContext,
        action_name: baseAction.name,
        action_id: createdAction.actionId,
      });

      if (baseAction.executionContext === ExecutionContext.CLIENT) {
        const clientAction: Action = {
          ...baseAction,
          id: createdAction.actionId || null,
          executionContext: ExecutionContext.CLIENT,
          executionModel: {
            functionName: toCamelCase(baseAction.name || 'customAction'),
            parameters: dataInputs
              .filter((input) => input.name)
              .map((input) => ({
                name: input.name,
                description: input.description,
                type: input.type.toLowerCase() as ParameterType,
                isArray: input.isArray,
              })),
          },
        };

        setCreatedClientAction(clientAction);
        window.history.replaceState(
          null,
          '',
          `/agents/${agentId}/actions/new?type=client&step=2`
        );

        setTimeout(() => {
          setCreatedClientAction(clientAction);
        }, 100);
      } else {
        setShowSuccess(true);
        window.history.replaceState(null, '', `/agents/${agentId}/actions/new`);
        window.history.pushState(null, '', `/agents/${agentId}/actions/new`);

        setTimeout(() => {
          router.replace(`/agents/${agentId}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating action:', error);

      posthog.capture('action_creation_failed', {
        agent_id: agentId,
        execution_context: baseAction.executionContext,
        action_name: baseAction.name,
        error: (error as Error).message,
      });

      if ((error as Error).message !== 'Action limit reached') {
        toast.error('Failed to create action. Please try again.');
      }
      throw error;
    } finally {
      setIsCreatingAction(false);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      const response = await fetch(
        `/api/agents/${agentId}/actions/${actionId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete action');
      }

      // Refresh the page to show updated actions list
      router.refresh();
    } catch (error) {
      console.error('Error deleting action:', error);
      toast.error('Failed to delete action. Please try again.');
    }
  };

  const handleUpdateAction = async (actionId: string, action: Action) => {
    try {
      const response = await fetch(
        `/api/agents/${agentId}/actions/${actionId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update action');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating action:', error);
      toast.error('Failed to update action. Please try again.');
      throw error;
    }
  };

  async function handleFetchActions( agentId: string ) {
    try {
      const response = await fetch(`/api/agents/${agentId}/actions`);
      if (!response.ok) {
        throw new Error('Failed to fetch actions');
      }
      return await response.json();
    } catch (error) {
      console.error(
        `Error fetching actions for agent ${agentId}:`,
        error
      );
    } 
  }

  return {
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
    handleFetchActions,
  };
};
