'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Copy,
  ExternalLink,
  Code,
  Info,
  List,
  CheckCircle,
  ArrowRight,
  FileText,
  Settings,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Framework } from '@/app/(frontend)/lib/scriptUtils';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';
import Link from 'next/link';
import {
  Action,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
import { getRegisterToolsExample, toCamelCase } from '../lib/actionUtils';
import { Label } from '@/app/(frontend)/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';

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

interface ClientActionImplementationProps {
  action: Action;
  dataInputs: DataInput[];
  onContinue: () => void;
}

export default function ClientActionImplementation({
  action,
  dataInputs,
  onContinue,
}: ClientActionImplementationProps) {
  const { selectedFramework, setSelectedFramework } = useFramework();
  const [copied, setCopied] = useState(false);

  const generatedFunctionName = toCamelCase(action.name || 'customAction');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
      <div
        className="mb-6 md:mb-12 flex items-start md:items-center bg-muted border-l-4 border-blue-600 p-3 md:p-4 rounded-lg shadow-md"
      >
        <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-blue-600 mr-2 md:mr-3 mt-1 md:mt-0 flex-shrink-0" />
        <span className="text-foreground text-sm md:text-base">
          Your client action has been created successfully! Now you need to
          implement the function in your application.
        </span>
      </div>

      <div className="relative mb-6 md:mb-12">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader className="flex flex-col items-start p-4 md:p-6 pb-0 md:pb-0">
            <div className="flex flex-row items-center space-x-2">
              <Code className="h-5 w-5 md:h-7 md:w-7 text-destructive" />
              <CardTitle className="text-xl md:text-2xl font-semibold text-foreground">
                Implementation Required
              </CardTitle>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Copy the code below and implement it in your application to make
              your action work.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 p-4 md:p-6">
            {dataInputs.filter((input) => input.name).length > 0 && (
              <div>
                <Label className="text-gray-900 text-base font-medium flex items-center gap-2">
                  <List className="h-4 w-4 text-[#FE4A60]" />
                  Action Arguments
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Your function will receive these arguments from the AI agent:
                </p>
                <div className="mt-2">
                  <div className="inline-grid grid-cols-2 md:grid-cols-4 gap-2">
                    {dataInputs
                      .filter((input) => input.name)
                      .map((input, index) => (
                        <div
                          key={index}
                          className="bg-[#FFFDF8] px-3 py-2 border-[2px] border-gray-900 rounded-lg shadow-sm"
                        >
                          <div className="font-mono text-sm text-gray-900">
                            {input.name}
                          </div>
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

            <div>
              <Label className="text-gray-900 text-base font-medium flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#FE4A60]" />
                Framework
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Select the framework you're using to implement the client-side
                function.
              </p>
              <div className="mt-2">
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
                    <SelectItem value={Framework.ANGULAR}>Angular</SelectItem>
                    <SelectItem value={Framework.NEXT_JS}>Next.js</SelectItem>
                    <SelectItem value={Framework.REACT}>React</SelectItem>
                    <SelectItem value={Framework.VANILLA}>
                      Vanilla JS
                    </SelectItem>
                    <SelectItem value={Framework.VUE}>Vue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <Label className="text-gray-900 text-lg font-semibold flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#FE4A60]" />
                Implementation Code
              </Label>
              <p className="text-sm text-gray-600 mb-4">
                💡 <strong>Why agentUserConfig?</strong> It provides user
                information to agents for personalized experiences.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                💡 <strong>Why return values?</strong> The AI agent uses your
                return value to provide helpful responses to users and confirm
                actions were executed.
              </p>
              <div className="relative">
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
                    generatedFunctionName,
                    dataInputs,
                    selectedFramework
                  )}
                </SyntaxHighlighter>
                <Button
                  onClick={() =>
                    handleCopy(
                      getRegisterToolsExample(
                        generatedFunctionName,
                        dataInputs,
                        selectedFramework
                      )
                    )
                  }
                  className="absolute top-4 right-4 bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md rounded-full p-2 text-xs sm:text-sm font-semibold hover:bg-secondary/90 flex items-center gap-1 sm:gap-2"
                >
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">
                    {copied ? 'Copied!' : 'Copy Code'}
                  </span>
                  <span className="sm:hidden">
                    {copied ? 'Copied!' : 'Copy'}
                  </span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-l-4 border-destructive pl-3 mb-2">
                Implementation Steps
              </h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 text-base">
                <li>
                  Copy the code above and implement your function in your
                  application
                </li>
                <li>
                  {selectedFramework === Framework.NEXT_JS ? (
                    <>Add the code to your layout.tsx or page component</>
                  ) : (
                    <>
                      Add the code between the <code>&lt;body&gt;</code> tags of
                      your website's HTML
                    </>
                  )}
                </li>
                <li>
                  The code will be available to your agent as a client-side
                  action
                </li>
                <li>
                  Need help? Visit our{' '}
                  <Link
                    href="/docs"
                    className="text-destructive hover:underline"
                  >
                    documentation <ExternalLink className="inline w-4 h-4" />
                  </Link>
                </li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button
                className="bg-destructive text-white border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand transition-transform duration-200 shadow-md text-base md:text-lg font-semibold px-8 py-3 flex items-center gap-2"
                onClick={onContinue}
              >
                <ArrowRight className="w-5 h-5" />
                Continue to Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
