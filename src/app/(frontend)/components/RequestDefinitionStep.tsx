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
import { getInputNames } from '../lib/actionUtils';
import HeaderInput from '@/app/(frontend)/components/HeaderInput';
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
  Tag,
  Settings,
  FileText,
} from 'lucide-react';
import { useState } from 'react';
import SuccessOverlay from '@/app/(frontend)/components/ui/success-overlay';

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

interface RequestDefinitionStepProps {
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
  isEditorInteracted: boolean;
  setIsEditorInteracted: (interacted: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCreate: () => void;
  onBack: () => void;
  isCreatingAction?: boolean;
  showSuccess?: boolean;
  isEditing?: boolean;
}

const commonHeaderKeys = [
  'Authorization',
  'Content-Type',
  'Accept',
  'X-API-Key',
];

const commonHeaderValues = [
  'application/json',
  'application/x-www-form-urlencoded',
  'Bearer',
  'Basic',
  'multipart/form-data',
  'text/plain',
  'application/xml',
  '*/*',
  'no-cache',
  'max-age=0',
  'gzip, deflate, br',
  'en-US,en;q=0.9',
  'X-Requested-With',
  'XMLHttpRequest',
];

const placeholderJSON = `{
  "foo": "someStaticValue",
  "bar": "{{variableValue}}",
  "baz": ["{{variable1}}", "{{variable2}}"],
  "qux": { "thud": "{{variable3}}" }
}`;

export default function RequestDefinitionStep({
  dataInputs,
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
  onCreate,
  onBack,
  isCreatingAction = false,
  showSuccess = false,
  isEditing = false,
}: RequestDefinitionStepProps) {
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const addHeader = () => {
    if (isCreatingAction) return;
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (isCreatingAction) return;
    const cleanedValue = value?.trim() || '';
    if (!isEditorInteracted && cleanedValue !== '') {
      setIsEditorInteracted(true);
    }
    setBodyError(null);
    setApiBody(cleanedValue);
  };

  const handleMethodChange = (method: string) => {
    if (isCreatingAction) return;
    setApiMethod(method);
    setBodyError(null);

    // Clear body when switching to GET or DELETE
    if (method === 'GET' || method === 'DELETE') {
      setApiBody('');
    }
  };

  const handleUrlChange = (value: string) => {
    if (isCreatingAction) return;
    setUrlError(null);
    setApiUrl(value);
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#FFFFFF' },
    });

    // Disable JSON validation to allow template variables
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: false,
      schemas: [],
    });

    // Disable default JSON suggestions to avoid duplicates
    monaco.languages.json.jsonDefaults.setModeConfiguration({
      completionItems: false,
      hovers: false,
      documentSymbols: false,
      definitions: false,
      references: false,
      documentHighlights: false,
      rename: false,
      colors: false,
      foldingRanges: false,
      selectionRanges: false,
      diagnostics: false,
      documentFormattingEdits: false,
      documentRangeFormattingEdits: false,
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
          suggestions: [
            ...getInputNames(dataInputs, false).map((name) => ({
              label: `{{${name}}}`,
              kind: monaco.languages.CompletionItemKind.Variable,
              documentation: `Variable with template syntax - unquoted for substitution`,
              insertText: `{{${name}}}`,
              range,
            })),
          ],
        };
      },
    });
  };

  const handleCreate = () => {
    if (isCreatingAction) return;

    if (!apiUrl.trim()) {
      setUrlError('URL is required');
      return;
    }

    const trimmedUrl = apiUrl.trim();
    if (
      !trimmedUrl.startsWith('http://') &&
      !trimmedUrl.startsWith('https://')
    ) {
      setUrlError('URL must start with http:// or https://');
      return;
    }

    if ((apiMethod === 'PUT' || apiMethod === 'PATCH') && !apiBody.trim()) {
      setBodyError(`Body is required for ${apiMethod} requests`);
      return;
    }

    // Enhanced validation: Check if all variables in API body have corresponding data inputs
    if (apiMethod !== 'GET' && apiMethod !== 'DELETE' && apiBody.trim()) {
      try {
        // Extract all template variables from the API body (e.g., {{sku}}, {{from}}, {{to}})
        const variableRegex = /\{\{(\w+)\}\}/g;
        const bodyVariables: string[] = [];
        let match;

        while ((match = variableRegex.exec(apiBody)) !== null) {
          const varName = match[1];
          if (!bodyVariables.includes(varName)) {
            bodyVariables.push(varName);
          }
        }

        // Get all defined data input names
        const dataInputNames = dataInputs
          .filter((input) => input.name.trim())
          .map((input) => input.name.trim());

        // Find missing data inputs
        const missingInputs = bodyVariables.filter(
          (varName) => !dataInputNames.includes(varName)
        );

        if (missingInputs.length > 0) {
          setBodyError(
            `Missing data inputs for variables: ${missingInputs.join(', ')}. ` +
              `Please add these parameters in the Data Inputs section above.`
          );
          return;
        }

        // Check if there are empty required data inputs
        const emptyRequiredInputs = dataInputs.filter(
          (input) => bodyVariables.includes(input.name) && !input.name.trim()
        );

        if (emptyRequiredInputs.length > 0) {
          setBodyError(
            `Some data inputs referenced in the API body are empty. ` +
              `Please ensure all required parameters are properly defined.`
          );
          return;
        }
      } catch (error) {
        // If JSON parsing fails, let it proceed (JSON validation happens elsewhere)
        console.log('Body parsing error during validation:', error);
      }
    }

    onCreate();
  };

  if (showSuccess) {
    return <SuccessOverlay />;
  }

  const urlSuggestions = [
    'https://',
    'https://api.example.com/',
    'https://yourdomain.com/api/',
    // ...add more if you want
  ];

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
      <div className="relative mb-12 ml-0">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8 ml-0"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader>
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-7 w-7 text-[#FE4A60]" />
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  API Request
                </CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This is the API endpoint that will be called by the AI Agent to
                complete the action. You can reference any of the data inputs
                defined above as variables with the brace syntax shown below.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-0 px-6 pb-6">
            {isCreatingAction && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-destructive border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-foreground font-semibold">
                    {isEditing ? 'Updating Action...' : 'Creating Action...'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please wait while we save your action
                  </p>
                </div>
              </div>
            )}

            {dataInputs.filter((input) => input.name).length > 0 && (
              <div className="-mt-4">
                <Label className="text-gray-900 text-base font-medium flex items-center gap-2">
                  <List className="h-4 w-4 text-[#FE4A60]" />
                  Available Variables
                </Label>
                <div className="mt-2">
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

            {/* Method and URL row, left-aligned */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 -mt-1 items-center">
              <div className="w-full md:w-[120px]">
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
                  disabled={isCreatingAction}
                >
                  <SelectTrigger className="mt-2 border-[2px] border-gray-900 w-full">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full">
                <Label
                  htmlFor="apiUrl"
                  className="text-base font-medium flex items-center gap-2"
                >
                  <Globe className="h-4 w-4 text-[#FE4A60]" />
                  HTTPS URL
                </Label>
                <div className="relative">
                  <SuggestInput
                    id="apiUrl"
                    value={apiUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    suggestions={urlSuggestions.concat(
                      getInputNames(dataInputs, true)
                    )}
                    placeholder="https://wttr.in/{{city}}?format=j1"
                    inputClassName={`mt-2 border-[2px] ${urlError ? 'border-red-500' : 'border-gray-900'}`}
                    matchMode="full"
                    disabled={isCreatingAction}
                  />
                  {urlError && (
                    <p className="absolute left-0 mt-1 text-red-500 text-sm">
                      {urlError}
                    </p>
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
                  commonHeaderValues={commonHeaderValues}
                  disabled={isCreatingAction}
                />
              ))}
              <Button
                variant="outline"
                className="mt-4 bg-card text-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl flex items-center gap-2"
                onClick={addHeader}
                disabled={isCreatingAction}
              >
                <PlusCircle className="h-4 w-4" />
                Add Header
              </Button>
            </div>

            {apiMethod !== 'GET' && apiMethod !== 'DELETE' && (
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
                        readOnly: isCreatingAction,
                        fixedOverflowWidgets: true,
                      }}
                      className="bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-card text-foreground border-[3px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl flex items-center gap-2"
                onClick={onBack}
                disabled={isCreatingAction}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button
                className="bg-destructive text-white border-[3px] border-gray-900 hover:bg-[#ff6a7a] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl flex items-center gap-2"
                onClick={handleCreate}
                disabled={isCreatingAction}
              >
                {isCreatingAction ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Action' : 'Create Action'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
