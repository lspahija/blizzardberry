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
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import { SuggestInput } from '@/app/(frontend)/components/ui/suggest-input';
import { cn } from '@/app/(frontend)/lib/cssClassNames';
import {
  BaseAction,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { getInputNames, getRegisterToolsExample } from '../lib/actionUtils';
import HeaderInput from '@/app/(frontend)/components/HeaderInput';
import ArgsList from '@/app/(frontend)/components/ArgsList';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Copy,
  ExternalLink,
  Globe,
  Code,
  Info,
  List,
  PlusCircle,
  Save,
  ArrowLeft,
  Terminal,
  Link,
} from 'lucide-react';
import { useState } from 'react';
import { Framework } from '@/app/(frontend)/lib/scriptUtils';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

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

interface ExecutionStepProps {
  baseAction: BaseAction;
  dataInputs: DataInput[];
  apiUrl: string;
  setApiUrl: (url: string) => void;
  apiMethod: string;
  setApiMethod: (method: string) => void;
  headers: Header[];
  setHeaders: (headers: Header[]) => void;
  apiBody: string;
  setApiBody: (body: string) => void;
  functionName: string;
  setFunctionName: (name: string) => void;
  isEditorInteracted: boolean;
  setIsEditorInteracted: (interacted: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreate: () => void;
  onBack: () => void;
}

const commonHeaderKeys = [
  'Authorization',
  'Content-Type',
  'Accept',
  'X-API-Key',
];

const placeholderJSON = `{
  "foo": "someStaticValue",
  "bar": "{{variableValue}}",
  "baz": ["{{variable1}}", "{{variable2}}"],
  "qux": { "thud": "{{variable3}}" }
}`;

export default function ExecutionStep({
  baseAction,
  dataInputs,
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
  onCreate,
  onBack,
}: ExecutionStepProps) {
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [functionNameError, setFunctionNameError] = useState<string | null>(
    null
  );
  const { selectedFramework, setSelectedFramework } = useFramework();

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleEditorChange = (value: string | undefined) => {
    const cleanedValue = value?.trim() || '';
    if (!isEditorInteracted && cleanedValue !== '') {
      setIsEditorInteracted(true);
    }
    setBodyError(null);
    setApiBody(cleanedValue);
  };

  const handleMethodChange = (method: string) => {
    setApiMethod(method);
    setBodyError(null);
  };

  const handleUrlChange = (value: string) => {
    setUrlError(null);
    setApiUrl(value);
  };

  const handleFunctionNameChange = (value: string) => {
    setFunctionNameError(null);
    setFunctionName(value);
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#FFFFFF' },
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
          suggestions: getInputNames(dataInputs, true).map((name) => ({
            label: name,
            kind: monaco.languages.CompletionItemKind.Variable,
            documentation: `Variable`,
            insertText: `"${name}"`,
            range,
          })),
        };
      },
    });
  };

  const handleCreate = () => {
    if (baseAction.executionContext === ExecutionContext.SERVER) {
      if (!apiUrl.trim()) {
        setUrlError('URL is required');
        return;
      }
      if (apiMethod === 'PUT' && !apiBody.trim()) {
        setBodyError('Body is required for PUT requests');
        return;
      }
      if (apiMethod === 'GET' && apiBody.trim()) {
        setBodyError('GET requests cannot have a body');
        return;
      }
    } else {
      if (!functionName.trim()) {
        setFunctionNameError('Function name is required');
        return;
      }
    }
    onCreate();
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
      <div
        className="mb-12 flex items-center bg-muted border-l-4 p-4 rounded-lg shadow-md"
        style={{ borderLeftColor: 'var(--color-destructive)' }}
      >
        <Info className="h-6 w-6 text-destructive mr-3" />
        <span className="text-foreground text-base">
          {baseAction.executionContext === ExecutionContext.SERVER
            ? 'Configure the API endpoint that the AI Agent will call to retrieve or update data.'
            : 'Configure the client-side function that will be executed in your application.'}
        </span>
      </div>
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader className="flex flex-row items-center space-x-2">
            {baseAction.executionContext === ExecutionContext.SERVER ? (
              <Globe className="h-7 w-7 text-[#FE4A60]" />
            ) : (
              <Code className="h-7 w-7 text-[#FE4A60]" />
            )}
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {baseAction.executionContext === ExecutionContext.SERVER
                ? 'API Request'
                : 'Client Action Configuration'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {baseAction.executionContext === ExecutionContext.SERVER ? (
              <>
                <div>
                  <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#FE4A60]" />
                    API Request
                  </Label>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    The API endpoint that should be called by the AI Agent to
                    retrieve data or to send updates. You can include data
                    inputs (variables) collected from the user in the URL,
                    headers, and request body.
                  </p>
                  {dataInputs.filter((input) => input.name).length > 0 && (
                    <div className="mt-6 ml-6">
                      <Label className="text-gray-900 text-base font-medium flex items-center gap-2">
                        <List className="h-4 w-4 text-[#FE4A60]" />
                        Available Variables
                      </Label>
                      <div className="mt-2 max-h-[100px] overflow-y-auto">
                        <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-2">
                          {dataInputs
                            .filter((input) => input.name)
                            .map((input, index) => (
                              <div
                                key={index}
                                className={cn(
                                  'bg-[#FFFDF8] px-3 py-2 border-[2px] border-gray-900 rounded-lg shadow-sm'
                                )}
                              >
                                <div className="font-mono text-sm text-gray-900">{`{{${input.name}}}`}</div>
                                <div className="text-xs text-gray-500 font-medium">
                                  {input.type}
                                  {input.isArray ? '[]' : ''}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6 mt-6 ml-6">
                    <div>
                      <Label
                        htmlFor="apiMethod"
                        className="text-base font-medium flex items-center gap-2"
                      >
                        <Terminal className="h-4 w-4 text-[#FE4A60]" />
                        Method
                      </Label>
                      <Select
                        value={apiMethod}
                        onValueChange={handleMethodChange}
                      >
                        <SelectTrigger className="mt-2 border-[2px] border-gray-900 sm:w-[2rem] md:w-[4rem] lg:w-[6rem]">
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
                      <Label
                        htmlFor="apiUrl"
                        className="text-base font-medium flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-[#FE4A60]" />
                        HTTPS URL
                      </Label>
                      <SuggestInput
                        id="apiUrl"
                        value={apiUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        suggestions={getInputNames(dataInputs, true)}
                        placeholder="https://wttr.in/{{city}}?format=j1"
                        inputClassName={`mt-2 border-[2px] ${urlError ? 'border-red-500' : 'border-gray-900'}`}
                        matchMode="full"
                      />
                      {urlError && (
                        <p className="text-red-500 text-sm mt-2">{urlError}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                    <List className="h-4 w-4 text-[#FE4A60]" />
                    Headers
                  </Label>
                  {headers.map((header, index) => (
                    <HeaderInput
                      key={index}
                      header={header}
                      index={index}
                      updateHeader={(field, value) => {
                        const updatedHeaders = [...headers];
                        updatedHeaders[index] = {
                          ...updatedHeaders[index],
                          [field]: value,
                        };
                        setHeaders(updatedHeaders);
                      }}
                      removeHeader={() =>
                        setHeaders(headers.filter((_, i) => i !== index))
                      }
                      suggestions={getInputNames(dataInputs, true)}
                      commonHeaderKeys={commonHeaderKeys}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="mt-4 bg-card text-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl flex items-center gap-2"
                    onClick={addHeader}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add Header
                  </Button>
                </div>
                <div className="mt-8">
                  <Label
                    htmlFor="apiBody"
                    className="text-gray-900 text-lg font-semibold flex items-center gap-2"
                  >
                    <Code className="h-4 w-4 text-[#FE4A60]" />
                    Body
                  </Label>
                  {bodyError && (
                    <div className="mt-4 p-4 bg-red-50 border-[2px] border-red-200 rounded-lg">
                      <p className="text-red-500 text-sm">{bodyError}</p>
                    </div>
                  )}
                  <div
                    className="mt-2 border-[2px] border-border rounded-lg overflow-hidden"
                    style={{ backgroundColor: 'var(--color-muted)' }}
                  >
                    <div className="relative">
                      {!apiBody?.trim() && (
                        <div className="absolute z-10 pointer-events-none text-gray-500 p-3 whitespace-pre-wrap">
                          {placeholderJSON}
                        </div>
                      )}
                      <Editor
                        height="200px"
                        defaultLanguage="json"
                        value={apiBody}
                        onChange={handleEditorChange}
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
                          padding: { top: 12, bottom: 12, left: 12 } as any,
                          folding: false,
                          hideCursorInOverviewRuler: true,
                          guides: { indentation: false },
                        }}
                        className="bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <div>
                  <Label
                    htmlFor="functionName"
                    className="text-gray-900 text-lg font-semibold flex items-center gap-2"
                  >
                    <Code className="h-4 w-4 text-[#FE4A60]" />
                    Function Name
                  </Label>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    The name of the client-side function to be executed. You
                    will implement this in your app using the SDK.
                  </p>
                  <div className="w-full md:ml-6 md:mr-6 md:max-w-screen-sm">
                    <Input
                      id="functionName"
                      value={functionName}
                      onChange={(e) => handleFunctionNameChange(e.target.value)}
                      placeholder="get_weather"
                      className={`mt-2 w-full ${functionNameError ? 'border-red-500' : 'border-border'}`}
                    />
                  </div>
                  {functionNameError && (
                    <p className="text-red-500 text-sm mt-2 ml-6">
                      {functionNameError}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                    <List className="h-4 w-4 text-[#FE4A60]" />
                    Arguments (Data Inputs)
                  </Label>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    The agent will collect these from the user and pass them as{' '}
                    <code>args</code> to your function.
                  </p>
                  <div className="mt-4 ml-6">
                    <ArgsList dataInputs={dataInputs} />
                  </div>
                </div>
                <div className="mb-4">
                  <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                    <Code className="h-4 w-4 text-[#FE4A60]" />
                    Framework
                  </Label>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    Select the framework you're using to implement the
                    client-side function.
                  </p>
                  <div className="mt-2 ml-6">
                    <Select
                      value={selectedFramework}
                      onValueChange={(value) =>
                        setSelectedFramework(value as Framework)
                      }
                    >
                      <SelectTrigger className="w-[200px] border-[2px] border-gray-900">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Framework.ANGULAR}>
                          Angular
                        </SelectItem>
                        <SelectItem value={Framework.NEXT_JS}>
                          Next.js
                        </SelectItem>
                        <SelectItem value={Framework.REACT}>React</SelectItem>
                        <SelectItem value={Framework.VANILLA}>
                          Vanilla JS
                        </SelectItem>
                        <SelectItem value={Framework.VUE}>Vue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="relative mt-4 ml-6">
                  <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-[#FE4A60]" />
                    Implementation Example
                  </Label>
                  <SyntaxHighlighter
                    language="javascript"
                    style={vscDarkPlus}
                    customStyle={{
                      borderRadius: '8px',
                      padding: '16px',
                      border: '2px solid var(--color-border)',
                      backgroundColor: 'var(--color-background-dark)',
                    }}
                  >
                    {getRegisterToolsExample(
                      functionName,
                      dataInputs,
                      selectedFramework
                    )}
                  </SyntaxHighlighter>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        getRegisterToolsExample(
                          functionName,
                          dataInputs,
                          selectedFramework
                        )
                      );
                    }}
                    className="absolute top-12 right-4 bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md rounded-full p-2 text-base font-semibold hover:bg-secondary/90"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                </div>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-4 text-sm">
                  <li>
                    Implement your function into your app like the example above
                  </li>
                  <li>
                    Add the code between the <code>&lt;body&gt;</code> tags of
                    your website's HTML
                  </li>
                  <li>
                    The code will be available to your agent as a client-side
                    action
                  </li>
                  <li>
                    Need help? Visit our{' '}
                    <Link
                      href="/docs"
                      className="text-[#FE4A60] hover:underline"
                    >
                      documentation <ExternalLink className="inline w-4 h-4" />
                    </Link>
                    .
                  </li>
                </ul>
              </div>
            )}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-card text-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl flex items-center gap-2"
                onClick={onBack}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                className="bg-destructive text-white border-[3px] border-gray-900 hover:bg-[#ff6a7a] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl flex items-center gap-2"
                onClick={handleCreate}
              >
                <Save className="w-4 h-4" />
                Create Action
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
