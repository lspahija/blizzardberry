'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Settings, Info, Zap, Globe, Code, PlusCircle, Tag, List, FileText } from 'lucide-react';
import {
  BaseAction,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { getInputNames } from '../lib/actionUtils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Label } from '@/app/(frontend)/components/ui/label';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Textarea } from '@/app/(frontend)/components/ui/textarea';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/app/(frontend)/components/ui/radio-group';
import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import Editor from '@monaco-editor/react';
import HeaderInput from '@/app/(frontend)/components/HeaderInput';

const placeholderJSON = `{
  "foo": "someStaticValue",
  "bar": "{{variableValue}}",
  "baz": ["{{variable1}}", "{{variable2}}"],
  "qux": { "thud": "{{variable3}}" }
}`;

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

interface ValidationErrors {
  name?: string;
  description?: string;
  dataInputs?: string;
  apiUrl?: string;
  apiMethod?: string;
}

interface UnifiedActionFormProps {
  baseAction: BaseAction;
  setBaseAction: (action: BaseAction) => void;
  dataInputs: DataInput[];
  setDataInputs: (inputs: DataInput[]) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  apiMethod: string;
  setApiMethod: (method: string) => void;
  headers: Header[];
  setHeaders: (headers: Header[]) => void;
  apiBody: string;
  setApiBody: (body: string) => void;
  onCreateAction: () => void;
  isCreatingAction: boolean;
  isEditing?: boolean;
}

export default function UnifiedActionForm({
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
  onCreateAction,
  isCreatingAction,
  isEditing = false,
}: UnifiedActionFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: { 'editor.background': '#FFFFFF' },
    });

    monaco.languages.registerCompletionItemProvider('json', {
      provideCompletionItems: (model: any, position: any) => {
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
              documentation: `Variable with template syntax`,
              insertText: `"{{${name}}}"`,
              range,
            })),
          ],
        };
      },
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    const cleanedValue = value || '';
    setApiBody(cleanedValue);
  };

  const scrollToFirstError = () => {
    // Scroll to first field with error
    const errorFields = [
      { error: 'name', selector: 'input[placeholder="Give your action a clear name"]' },
      { error: 'description', selector: 'textarea[placeholder="Describe what this action does"]' },
      { error: 'executionContext', selector: '[data-testid="execution-context"]' },
      { error: 'dataInputs', selector: '[data-testid="data-inputs"]' },
      { error: 'apiUrl', selector: 'input[placeholder*="https://"]' },
    ];

    for (const field of errorFields) {
      if (errors[field.error as keyof ValidationErrors]) {
        const element = document.querySelector(field.selector);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }
  };

  // Auto-scroll to first error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setTimeout(() => scrollToFirstError(), 100);
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate basic information
    if (!baseAction.name.trim()) {
      newErrors.name = 'Action name is required';
    }
    if (!baseAction.description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate data inputs - must have at least one
    if (dataInputs.length === 0) {
      newErrors.dataInputs = 'At least one data input is required';
    } else {
      // Check that all data inputs have name and description
      const invalidInputs = dataInputs.some(input => !input.name.trim() || !input.description.trim());
      if (invalidInputs) {
        newErrors.dataInputs = 'All data inputs must have name and description';
      }
    }

    // Za server action treba API URL
    if (baseAction.executionContext === ExecutionContext.SERVER) {
      if (!apiUrl.trim()) {
        newErrors.apiUrl = 'API URL is required for server actions';
      }
      if (!apiMethod.trim()) {
        newErrors.apiMethod = 'API method is required for server actions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onCreateAction();
    } else {
      // Scroll do prvog errora
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const addDataInput = () => {
    setDataInputs([
      ...dataInputs,
      { name: '', type: 'Text', description: '', isArray: false },
    ]);
    // Ukloni error ako je postojao
    if (errors.dataInputs) {
      setErrors(prev => ({ ...prev, dataInputs: undefined }));
    }
  };

  const removeDataInput = (index: number) => {
    const newInputs = dataInputs.filter((_, i) => i !== index);
    setDataInputs(newInputs);
  };

  const updateDataInput = (index: number, field: keyof DataInput, value: string | boolean) => {
    const newInputs = [...dataInputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    setDataInputs(newInputs);

    // Ukloni error ako se ispravlja
    if (errors.dataInputs) {
      setErrors(prev => ({ ...prev, dataInputs: undefined }));
    }
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Action Name & Description */}
      <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
        <Card className={`relative bg-card border-[3px] ${errors.name || errors.description ? 'border-destructive error-field' : 'border-border'} rounded-lg shadow-xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="h-5 w-5 text-destructive" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Action Name */}
            <div>
              <Label htmlFor="actionName" className="text-lg font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-destructive" />
                Action Name
              </Label>
              <Input
                id="actionName"
                value={baseAction.name}
                onChange={(e) => {
                  setErrors(prev => ({ ...prev, name: undefined }));
                  setBaseAction({ ...baseAction, name: e.target.value });
                }}
                placeholder="e.g., Update_Subscription"
                className={`mt-2 border-[2px] ${errors.name ? 'border-destructive' : 'border-border'}`}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description - odmah ispod action name */}
            <div>
              <Label htmlFor="description" className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-destructive" />
                Description
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Explain when the AI Agent should use this action. Include what it does and example queries.
              </p>
              <Textarea
                id="description"
                value={baseAction.description}
                onChange={(e) => {
                  setErrors(prev => ({ ...prev, description: undefined }));
                  setBaseAction({ ...baseAction, description: e.target.value });
                }}
                placeholder="Describe when the AI agent should use this action..."
                className={`mt-2 border-[2px] ${errors.description ? 'border-destructive' : 'border-border'}`}
                rows={4}
              />
              {errors.description && (
                <p className="text-destructive text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Action Type */}
            <div>
              <Label className="text-lg font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4 text-destructive" />
                Action Type
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Choose where your action will be executed
              </p>
              <RadioGroup
                data-testid="execution-context"
                value={baseAction.executionContext}
                onValueChange={(value: ExecutionContext) =>
                  setBaseAction({ ...baseAction, executionContext: value })
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
              >
                <div className="relative">
                  <RadioGroupItem
                    value={ExecutionContext.SERVER}
                    id="server"
                    className="absolute top-4 left-4 z-10"
                  />
                  <Label
                    htmlFor="server"
                    className={`block p-4 pl-12 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      baseAction.executionContext === ExecutionContext.SERVER
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border hover:border-destructive/50'
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-2">Server Action</div>
                    <p className="text-sm text-muted-foreground">
                      Executed on the server. No client-side code needed.
                    </p>
                  </Label>
                </div>
                <div className="relative">
                  <RadioGroupItem
                    value={ExecutionContext.CLIENT}
                    id="client"
                    className="absolute top-4 left-4 z-10"
                  />
                  <Label
                    htmlFor="client"
                    className={`block p-4 pl-12 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      baseAction.executionContext === ExecutionContext.CLIENT
                        ? 'border-destructive bg-destructive/5'
                        : 'border-border hover:border-destructive/50'
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-2">Client Action</div>
                    <p className="text-sm text-muted-foreground">
                      Executed purely on the client. Requires a tiny code snippet.
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Inputs */}
      <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
        <Card data-testid="data-inputs" className={`relative bg-card border-[3px] ${errors.dataInputs ? 'border-destructive error-field' : 'border-border'} rounded-lg shadow-xl`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <List className="h-5 w-5 text-destructive" />
              Data Inputs
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Define what information the AI agent needs to provide when using this action.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.dataInputs && (
              <p className="text-destructive text-sm bg-destructive/5 p-2 rounded border border-destructive">
                {errors.dataInputs}
              </p>
            )}

            {dataInputs.map((input, index) => (
              <div key={index} className="space-y-3 p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Parameter {index + 1}</Label>
                  {dataInputs.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDataInput(index)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Parameter Name */}
                <div>
                  <Label className="text-sm font-medium">Parameter Name</Label>
                  <Input
                    value={input.name}
                    onChange={(e) => updateDataInput(index, 'name', e.target.value)}
                    placeholder="e.g., user_id"
                    className="mt-1"
                  />
                </div>

                {/* Parameter Description - odmah ispod parametra */}
                <div>
                  <Label className="text-sm font-medium">Parameter Description</Label>
                  <Textarea
                    value={input.description}
                    onChange={(e) => updateDataInput(index, 'description', e.target.value)}
                    placeholder="Describe what this parameter is for..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                {/* Type and Array */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <Select
                      value={input.type}
                      onValueChange={(value) => updateDataInput(index, 'type', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                        <SelectItem value="Boolean">Boolean</SelectItem>
                        <SelectItem value="Date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      id={`isArray-${index}`}
                      checked={input.isArray}
                      onChange={(e) => updateDataInput(index, 'isArray', e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`isArray-${index}`} className="text-sm">Is Array</Label>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={addDataInput}
              variant="outline"
              className="w-full border-dashed border-2 border-muted-foreground/25 hover:border-destructive/50"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Parameter
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* API Configuration - Only for Server Actions */}
      {baseAction.executionContext === ExecutionContext.SERVER && (
        <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
          <Card className={`relative bg-card border-[3px] ${errors.apiUrl || errors.apiMethod ? 'border-destructive error-field' : 'border-border'} rounded-lg shadow-xl`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe className="h-5 w-5 text-destructive" />
                API Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure the API endpoint that will be called when this action is executed.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API URL */}
              <div>
                <Label className="text-lg font-semibold">API URL</Label>
                <Input
                  value={apiUrl}
                  onChange={(e) => {
                    setErrors(prev => ({ ...prev, apiUrl: undefined }));
                    setApiUrl(e.target.value);
                  }}
                  placeholder="https://api.example.com/endpoint"
                  className={`mt-2 border-[2px] ${errors.apiUrl ? 'border-destructive' : 'border-border'}`}
                />
                {errors.apiUrl && (
                  <p className="text-destructive text-sm mt-1">{errors.apiUrl}</p>
                )}
              </div>

              {/* API Method */}
              <div>
                <Label className="text-lg font-semibold">HTTP Method</Label>
                <Select
                  value={apiMethod}
                  onValueChange={(value) => {
                    setErrors(prev => ({ ...prev, apiMethod: undefined }));
                    setApiMethod(value);
                  }}
                >
                  <SelectTrigger className={`mt-2 border-[2px] ${errors.apiMethod ? 'border-destructive' : 'border-border'}`}>
                    <SelectValue placeholder="Select HTTP method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                {errors.apiMethod && (
                  <p className="text-destructive text-sm mt-1">{errors.apiMethod}</p>
                )}
              </div>

              {/* Headers */}
              <div>
                <Label className="text-lg font-semibold">Headers</Label>
                <div className="space-y-3 mt-2">
                  {headers.map((header, index) => (
                    <HeaderInput
                      key={index}
                      header={header}
                      index={index}
                      updateHeader={(field, value) => updateHeader(index, field, value)}
                      removeHeader={() => removeHeader(index)}
                      suggestions={getInputNames(dataInputs, true)}
                      commonHeaderKeys={['Authorization', 'Content-Type', 'Accept', 'User-Agent', 'X-API-Key']}
                      commonHeaderValues={['Bearer {{token}}', 'application/json', 'application/xml', 'text/plain']}
                    />
                  ))}
                  <Button
                    type="button"
                    onClick={addHeader}
                    variant="outline"
                    className="border-dashed border-2"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Header
                  </Button>
                </div>
              </div>

              {/* Request Body */}
              {baseAction.executionContext === ExecutionContext.SERVER &&
               (apiMethod === 'POST' || apiMethod === 'PUT' || apiMethod === 'PATCH') && (
                <div>
                  <Label
                    htmlFor="apiBody"
                    className="text-lg font-semibold flex items-center gap-2"
                  >
                    <Code className="h-4 w-4 text-[#FE4A60]" />
                    Body
                  </Label>
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        className="flex justify-center pt-6"
      >
        <Button
          onClick={handleSubmit}
          disabled={isCreatingAction}
          className="bg-destructive text-white border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand transition-transform duration-200 shadow-md text-lg font-semibold px-8 py-3"
        >
          <Save className="w-5 h-5 mr-2" />
          {isCreatingAction
            ? (isEditing ? 'Updating Action...' : 'Creating Action...')
            : (isEditing ? 'Update Action' : 'Create Action')}
        </Button>
      </motion.div>
    </div>
  );
}