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

export const useActionForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { agentId, teamId } = useParams();

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
  const [functionName, setFunctionName] = useState('');
  const [isEditorInteracted, setIsEditorInteracted] = useState(false);
  const [activeTab, setActiveTab] = useState('headers');

  useEffect(() => {
    const stepParam = searchParams.get('step');
    let currentStep = 1;

    if (stepParam) {
      const stepNum = parseInt(stepParam);
      if (stepNum >= 1 && stepNum <= 3) {
        currentStep = stepNum;
      }
    }
    setStep(currentStep);

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
        `/dashboard/${teamId}/agents/${agentId}/actions/new?type=${actionTypeParam}&step=${currentStep}`
      );
    } else if (stepParam) {
      const actionTypeParam =
        baseAction.executionContext === ExecutionContext.SERVER
          ? 'server'
          : 'client';
      router.replace(
        `/dashboard/${teamId}/agents/${agentId}/actions/new?type=${actionTypeParam}&step=${currentStep}`
      );
    }
  }, [searchParams, router, agentId, baseAction.executionContext, teamId]);

  const updateUrl = (newStep: number) => {
    if (newStep > 1) {
      const actionTypeParam =
        baseAction.executionContext === ExecutionContext.SERVER
          ? 'server'
          : 'client';
      router.push(
        `/dashboard/${teamId}/agents/${agentId}/actions/new?type=${actionTypeParam}&step=${newStep}`
      );
    } else {
      router.push(`/dashboard/${teamId}/agents/${agentId}/actions/new?step=${newStep}`);
    }
    setStep(newStep);
  };

  const handleNextStep = () => {
    if (step < 3) {
      updateUrl(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      updateUrl(step - 1);
    } else {
      router.push(`/dashboard/${teamId}/agents/${agentId}`);
    }
  };

  const handleCreateAction = async () => {
    let action: Action;

    if (baseAction.executionContext === ExecutionContext.SERVER) {
      const requestHeaders: Headers = {};
      headers.forEach((header) => {
        if (header.key && header.value) {
          requestHeaders[header.key] = header.value;
        }
      });

      let requestBody: Body | undefined;
      try {
        if (apiBody) {
          requestBody = JSON.parse(apiBody);
        }
      } catch (error) {
        console.error('Invalid JSON in API body:', error);
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
        functionName,
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

      if (response.ok) {
        console.log('Action created successfully');
        router.push(`/dashboard/${teamId}/agents/${agentId}`);
      } else {
        console.error('Failed to create action:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating action:', error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    if (!confirm('Are you sure you want to delete this action?')) {
      return;
    }

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
      alert('Failed to delete action. Please try again.');
    }
  };

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
    functionName,
    setFunctionName,
    isEditorInteracted,
    setIsEditorInteracted,
    activeTab,
    setActiveTab,
    handleNextStep,
    handleBack,
    handleCreateAction,
    handleDeleteAction,
  };
};
