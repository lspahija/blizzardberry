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
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import { motion } from 'framer-motion';
import { Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/app/(frontend)/components/ui/radio-group';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/(frontend)/components/ui/tabs';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Editor from '@monaco-editor/react';
import { SuggestInput } from '@/app/(frontend)/components/ui/suggest-input';
import { cn } from '@/app/(frontend)/lib/cssClassNames';
import {
  Action,
  BaseAction,
  ExecutionContext,
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

export default function NewActionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { chatbotId } = useParams();
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

  const [step, setStep] = useState(1);
  // Initialize BaseAction with chatbotId from useParams
  const [baseAction, setBaseAction] = useState<BaseAction>({
    id: null,
    name: '',
    description: '',
    executionContext: ExecutionContext.SERVER,
    chatbotId: chatbotId as string,
  });
  const [dataInputs, setDataInputs] = useState<DataInput[]>([
    { name: '', type: 'Text', description: '', isArray: false },
  ]);
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState('GET');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [isEditorInteracted, setIsEditorInteracted] = useState(false);

  const placeholderJSON = JSON.stringify(
    {
      example: '{{value}}',
      array: ['{{item1}}', '{{item2}}'],
      nested: { key: '{{value}}' },
    },
    null,
    2
  );

  const [apiBody, setApiBody] = useState(placeholderJSON);
  const [functionName, setFunctionName] = useState('');
  const [activeTab, setActiveTab] = useState('headers');

  const handleEditorChange = (value: string | undefined) => {
    if (!isEditorInteracted && value !== placeholderJSON) {
      // Clear placeholder on first interaction
      setIsEditorInteracted(true);
      setApiBody(value || '');
    } else {
      // Update with user input
      setApiBody(value || '');
    }
  };

  const getInputNames = (withBraces = false) => {
    const names = dataInputs
      .map((input) => input.name)
      .filter((name) => name !== '');

    return withBraces ? names.map((name) => `{{${name}}}`) : names;
  };

  const commonHeaderKeys = [
    'Authorization',
    'Content-Type',
    'Accept',
    'X-API-Key',
  ];

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
        `/chatbots/${chatbotId}/actions/new?type=${actionTypeParam}&step=${currentStep}`
      );
    } else if (stepParam) {
      const actionTypeParam =
        baseAction.executionContext === ExecutionContext.SERVER
          ? 'server'
          : 'client';
      router.replace(
        `/chatbots/${chatbotId}/actions/new?type=${actionTypeParam}&step=${currentStep}`
      );
    }
  }, [searchParams, router, chatbotId, baseAction.executionContext]);

  const updateUrl = (newStep: number) => {
    if (newStep > 1) {
      const actionTypeParam =
        baseAction.executionContext === ExecutionContext.SERVER
          ? 'server'
          : 'client';
      router.push(
        `/chatbots/${chatbotId}/actions/new?type=${actionTypeParam}&step=${newStep}`
      );
    } else {
      router.push(`/chatbots/${chatbotId}/actions/new?step=${newStep}`);
    }
    setStep(newStep);
  };

  const handleBack = () => {
    if (step > 1) {
      updateUrl(step - 1);
    } else {
      router.push(`/chatbots/${chatbotId}`);
    }
  };

  const addDataInput = () => {
    setDataInputs([
      ...dataInputs,
      { name: '', type: 'Text', description: '', isArray: false },
    ]);
  };

  const removeDataInput = (index: number) => {
    setDataInputs(dataInputs.filter((_, i) => i !== index));
  };

  const updateDataInput = (index: number, field: string, value: any) => {
    const updatedInputs = [...dataInputs];
    updatedInputs[index] = { ...updatedInputs[index], [field]: value };
    setDataInputs(updatedInputs);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: keyof Header, value: string) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index] = { ...updatedHeaders[index], [field]: value };
    setHeaders(updatedHeaders);
  };

  const handleNextStep = () => {
    if (step < 3) {
      updateUrl(step + 1);
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
      const response = await fetch(`/api/chatbots/${chatbotId}/actions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });

      if (response.ok) {
        console.log('Action created successfully');
        router.push(`/chatbots/${chatbotId}`);
      } else {
        console.error('Failed to create action:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating action:', error);
    }
  };

  function getRegisterToolsExample(
    functionName: string,
    dataInputs: DataInput[]
  ) {
    const argList =
      dataInputs
        .filter((i) => i.name)
        .map((i) => i.name)
        .join(', ') || '...';
    return `window.ChatbotActions = {
      ${functionName || 'your_action'}: async (args, userConfig) => {
        try {
          // args.${argList}
          // userConfig - exposes the user config if you specified one
          return { 
            status: 'success',
            data: {
              // any object you want to return
            }
          };
        } catch (error) {
          return { 
            status: 'error', 
            error: error.message || 'Failed to execute action' 
          };
        }
      }
    };`;
  }

  function ArgsList({ dataInputs }: { dataInputs: DataInput[] }) {
    return (
      <ul className="list-disc pl-6">
        {dataInputs
          .filter((input) => input.name)
          .map((input, idx) => (
            <li key={idx}>
              <span className="font-mono font-semibold">{input.name}</span>
              <span className="ml-2 text-gray-700">
                ({input.type}
                {input.isArray ? '[]' : ''})
              </span>
              <span className="ml-2 text-gray-500">{input.description}</span>
            </li>
          ))}
      </ul>
    );
  }

  function handleEditorWillMount(monaco) {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#FFF4DA',
      },
    });

    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        return {
          suggestions: getInputNames(true).map((name) => ({
            label: name,
            kind: monaco.languages.CompletionItemKind.Variable,
            documentation: `Variable`,
            insertText: `"${name}"`,
            range,
          })),
        };
      },
    });
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-gray-900 sticky top-0 bg-[#FFFDF8] z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">
            <span className="text-gray-900">Omni</span>
            <span className="text-[#FE4A60]">Interface</span>
          </span>
        </div>
      </nav>

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
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
          >
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
              <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="actionName" className="text-gray-900">
                      Action Name
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      A descriptive name for this action. This will help the AI
                      agent know when to use it.
                    </p>
                    <Input
                      id="actionName"
                      value={baseAction.name}
                      onChange={(e) =>
                        setBaseAction((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Update_Subscription"
                      className="mt-2 border-[2px] border-gray-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-gray-900">
                      Description
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Explain when the AI Agent should use this action. Include
                      a description of what this action does, the data it
                      provides, and any updates it makes. Include example
                      queries that should trigger this action.
                    </p>
                    <Textarea
                      id="description"
                      value={baseAction.description}
                      onChange={(e) =>
                        setBaseAction((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe when the AI agent should use this action..."
                      className="mt-2 border-[2px] border-gray-900"
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label className="text-gray-900">Action Type</Label>
                    <RadioGroup
                      value={baseAction.executionContext}
                      onValueChange={(value: ExecutionContext) => {
                        setBaseAction((prev) => ({
                          ...prev,
                          executionContext: value,
                        }));
                        const actionTypeParam =
                          value === ExecutionContext.SERVER
                            ? 'server'
                            : 'client';
                        router.replace(
                          `/chatbots/${chatbotId}/actions/new?type=${actionTypeParam}&step=1`
                        );
                      }}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ExecutionContext.SERVER}
                          id="server"
                        />
                        <Label htmlFor="server" className="text-gray-900">
                          Server Action
                          <p className="text-sm text-gray-600">
                            This action will be executed on the server. There is
                            no need to write any client-side code.
                          </p>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={ExecutionContext.CLIENT}
                          id="client"
                        />
                        <Label htmlFor="client" className="text-gray-900">
                          Client Action
                          <p className="text-sm text-gray-600">
                            This action will be executed on the client. You will
                            need to write some client-side code. Explore the
                            docs.
                          </p>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Button
                    className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                    onClick={handleNextStep}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save and Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
          >
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
              <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    Data Inputs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-gray-900">
                      Data Inputs (Optional)
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      List any information the AI Agent needs to perform the
                      action. The agent can find the data in the chat history,
                      request it from the user, or retrieve it from the
                      specified user config if available.
                    </p>
                    {dataInputs.map((input, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_50px_50px] gap-2 mt-4 items-end"
                      >
                        <div>
                          <Label htmlFor={`inputName${index}`}>Name</Label>
                          <Input
                            id={`inputName${index}`}
                            value={input.name}
                            onChange={(e) =>
                              updateDataInput(index, 'name', e.target.value)
                            }
                            placeholder="city"
                            className="mt-2 border-[2px] border-gray-900"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inputType${index}`}>Type</Label>
                          <Select
                            value={input.type}
                            onValueChange={(value) =>
                              updateDataInput(index, 'type', value)
                            }
                          >
                            <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Text">Text</SelectItem>
                              <SelectItem value="Number">Number</SelectItem>
                              <SelectItem value="Boolean">Boolean</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`inputDesc${index}`}>
                            Description
                          </Label>
                          <Input
                            id={`inputDesc${index}`}
                            value={input.description}
                            onChange={(e) =>
                              updateDataInput(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder="The city to get weather for, e.g. Los Angeles"
                            className="mt-2 border-[2px] border-gray-900"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`inputArray${index}`}>Array</Label>
                          <div className="mt-2">
                            <input
                              id={`inputArray${index}`}
                              type="checkbox"
                              checked={input.isArray}
                              onChange={(e) =>
                                updateDataInput(
                                  index,
                                  'isArray',
                                  e.target.checked
                                )
                              }
                              className="border-[2px] border-gray-900"
                            />
                          </div>
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            className="bg-[#FFFDF8] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                            onClick={() => removeDataInput(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                      onClick={addDataInput}
                    >
                      Add Data Input
                    </Button>
                  </div>
                  <Button
                    className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                    onClick={handleNextStep}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save and Continue
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
          >
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
              <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-semibold text-gray-900">
                    {baseAction.executionContext === ExecutionContext.SERVER
                      ? 'API Request'
                      : 'Client Action Configuration'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {baseAction.executionContext === ExecutionContext.SERVER ? (
                    <>
                      <div>
                        <Label className="text-gray-900">API Request</Label>
                        <p className="text-sm text-gray-600 mt-1">
                          The API endpoint that should be called by the AI Agent
                          to retrieve data or to send updates. You can include
                          data inputs (variables) collected from the user in the
                          URL, headers, and request body.
                        </p>
                        {dataInputs.filter((input) => input.name).length >
                          0 && (
                          <div className="mt-4">
                            <Label className="text-gray-900 text-sm">
                              Available Variables
                            </Label>
                            <div className="mt-1.5 max-h-[100px] overflow-y-auto">
                              <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-1">
                                {dataInputs
                                  .filter((input) => input.name)
                                  .map((input, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className={cn(
                                          'bg-[#FFFDF8] px-2 py-1 border border-gray-200 rounded whitespace-nowrap'
                                        )}
                                      >
                                        <div className="font-mono text-xs text-gray-900">{`{{${input.name}}}`}</div>
                                        <div className="text-[10px] text-gray-500 font-medium">
                                          {input.type}
                                          {input.isArray ? '[]' : ''}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 mt-4">
                          <div>
                            <Label htmlFor="apiMethod">Method</Label>
                            <Select
                              value={apiMethod}
                              onValueChange={setApiMethod}
                            >
                              <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="GET">GET</SelectItem>
                                <SelectItem value="POST">POST</SelectItem>
                                <SelectItem value="PUT">PUT</SelectItem>
                                <SelectItem value="DELETE">DELETE</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="apiUrl">HTTPS URL</Label>
                            <SuggestInput
                              id="apiUrl"
                              value={apiUrl}
                              onChange={(e) => setApiUrl(e.target.value)}
                              suggestions={getInputNames(true)}
                              placeholder="https://wttr.in/{{city}}?format=j1"
                              inputClassName="border-[2px] border-gray-900"
                              matchMode="full"
                            />
                          </div>
                        </div>
                      </div>
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                      >
                        <TabsList className="grid w-full grid-cols-2 bg-[#FFFDF8] border-[2px] border-gray-900 rounded-lg h-10 px-1 py-[2px]">
                          <TabsTrigger
                            value="headers"
                            className="data-[state=active]:bg-[#FFC480] data-[state=active]:text-gray-900 data-[state=active]:border-[2px] data-[state=active]:border-gray-900 rounded-md transition-all hover:bg-[#FFF4DA] flex items-center justify-center h-full cursor-pointer"
                          >
                            Headers
                          </TabsTrigger>
                          <TabsTrigger
                            value="body"
                            className="data-[state=active]:bg-[#FFC480] data-[state=active]:text-gray-900 data-[state=active]:border-[2px] data-[state=active]:border-gray-900 rounded-md transition-all hover:bg-[#FFF4DA] flex items-center justify-center h-full cursor-pointer"
                          >
                            Body
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="headers" className="mt-4">
                          <div>
                            <Label className="text-gray-900">Headers</Label>
                            {headers.map((header, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_50px] gap-4 mt-4 items-end"
                              >
                                <div>
                                  <Label htmlFor={`headerKey${index}`}>
                                    Key
                                  </Label>
                                  <SuggestInput
                                    id={`headerKey${index}`}
                                    value={header.key}
                                    onChange={(e) =>
                                      updateHeader(index, 'key', e.target.value)
                                    }
                                    onSelect={(val) =>
                                      updateHeader(index, 'key', val)
                                    } // Optional: apply when selected
                                    suggestions={commonHeaderKeys}
                                    placeholder="Authorization"
                                    inputClassName="border-[2px] border-gray-900"
                                    matchMode="word"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`headerValue${index}`}>
                                    Value
                                  </Label>
                                  <SuggestInput
                                    id={`headerValue${index}`}
                                    value={header.value}
                                    onChange={(e) =>
                                      updateHeader(
                                        index,
                                        'value',
                                        e.target.value
                                      )
                                    }
                                    suggestions={getInputNames(true)}
                                    placeholder="Bearer {{token}}"
                                    inputClassName="border-[2px] border-gray-900"
                                    matchMode="word"
                                  />
                                </div>
                                <div>
                                  <Button
                                    variant="outline"
                                    className="bg-[#FFFDF8] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                                    onClick={() => removeHeader(index)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              className="mt-4 bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                              onClick={addHeader}
                            >
                              Add Header
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="body" className="mt-4">
                          <div>
                            <Label htmlFor="apiBody" className="text-gray-900">
                              Body
                            </Label>
                            <div className="mt-2 border-[2px] border-gray-900 rounded-md overflow-hidden">
                              <Editor
                                height="200px"
                                defaultLanguage="json"
                                value={apiBody}
                                onChange={handleEditorChange} // Use the new handler
                                beforeMount={handleEditorWillMount}
                                onMount={(editor) => {
                                  editor.updateOptions({
                                    lineNumbers: () => '',
                                    glyphMargin: false,
                                    lineDecorationsWidth: 0,
                                    lineNumbersMinChars: 0,
                                    suggest: {
                                      showWords: false,
                                      preview: true,
                                      showProperties: false,
                                    },
                                  });
                                  // Clear placeholder on focus
                                  editor.onDidFocusEditorText(() => {
                                    if (
                                      !isEditorInteracted &&
                                      apiBody === placeholderJSON
                                    ) {
                                      setIsEditorInteracted(true);
                                      setApiBody('');
                                    }
                                  });
                                  requestAnimationFrame(() => editor.layout());
                                }}
                                theme="customTheme"
                                options={{
                                  fontSize: 14,
                                  minimap: { enabled: false },
                                  scrollBeyondLastLine: false,
                                  wordWrap: 'on',
                                  renderLineHighlight: 'none',
                                  scrollbar: {
                                    verticalScrollbarSize: 8,
                                    horizontalScrollbarSize: 8,
                                  },
                                  padding: {
                                    top: 12,
                                    bottom: 12,
                                    left: 12,
                                  } as any,
                                  folding: false,
                                  hideCursorInOverviewRuler: true,
                                  guides: { indentation: false },
                                }}
                                className="bg-[#FFF4DA]"
                              />
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="functionName" className="text-gray-900">
                          Function Name
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          The name of the client-side function to be executed.
                          You will implement this in your app using the SDK.
                        </p>
                        <Input
                          id="functionName"
                          value={functionName}
                          onChange={(e) => setFunctionName(e.target.value)}
                          placeholder="get_weather"
                          className="mt-2 border-[2px] border-gray-900"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-900">
                          Arguments (Data Inputs)
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          The chatbot will collect these from the user and pass
                          them as <code>args</code> to your function.
                        </p>
                        <ArgsList dataInputs={dataInputs} />
                      </div>

                      <div>
                        <Label className="text-gray-900">
                          How to Implement
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          In your app, register this action using the SDK.
                          Example:
                        </p>
                        <pre className="bg-[#FFF4DA] border-2 border-gray-900 rounded p-4 text-sm overflow-x-auto mt-8">
                          {getRegisterToolsExample(functionName, dataInputs)}
                        </pre>
                      </div>
                    </div>
                  )}
                  <Button
                    className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                    onClick={handleCreateAction}
                  >
                    Create Action
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
