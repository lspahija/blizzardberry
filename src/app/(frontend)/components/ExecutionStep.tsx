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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/(frontend)/components/ui/tabs';
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
  "example": "{{value}}",
  "array": ["{{item1}}", "{{item2}}"],
  "nested": { "key": "{{value}}" }
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
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleEditorChange = (value: string | undefined) => {
    const cleanedValue = value?.trim() || '';
    if (!isEditorInteracted && cleanedValue !== '') {
      setIsEditorInteracted(true);
    }
    setApiBody(cleanedValue);
  };
  

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#FFF4DA' },
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

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
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
                    The API endpoint that should be called by the AI Agent to
                    retrieve data or to send updates. You can include data
                    inputs (variables) collected from the user in the URL,
                    headers, and request body.
                  </p>
                  {dataInputs.filter((input) => input.name).length > 0 && (
                    <div className="mt-4">
                      <Label className="text-gray-900 text-sm">
                        Available Variables
                      </Label>
                      <div className="mt-1.5 max-h-[100px] overflow-y-auto">
                        <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-1">
                          {dataInputs
                            .filter((input) => input.name)
                            .map((input, index) => (
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
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 mt-4">
                    <div>
                      <Label htmlFor="apiMethod">Method</Label>
                      <Select value={apiMethod} onValueChange={setApiMethod}>
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
                        suggestions={getInputNames(dataInputs, true)}
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
                      <div className="mt-2 border-[2px] border-gray-900 rounded-md overflow-hidden bg-[#FFF4DA]">
                        <div className="relative">
                          {!apiBody?.trim() && (
                          <div className="absolute z-10 pointer-events-none text-gray-500 italic p-3 whitespace-pre-wrap">
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
                            className="bg-[#FFF4DA]"
                          />
                        </div>
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
                    The name of the client-side function to be executed. You
                    will implement this in your app using the SDK.
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
                    The chatbot will collect these from the user and pass them
                    as <code>args</code> to your function.
                  </p>
                  <ArgsList dataInputs={dataInputs} />
                </div>
                <div>
                  <Label className="text-gray-900">How to Implement</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    In your app, register this action using the SDK. Example:
                  </p>
                  <pre className="bg-[#FFF4DA] border-2 border-gray-900 rounded p-4 text-sm overflow-x-auto mt-8">
                    {getRegisterToolsExample(functionName, dataInputs)}
                  </pre>
                </div>
              </div>
            )}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
                onClick={onCreate}
              >
                Create Action
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
