'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/app/(frontend)/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/app/(frontend)/components/ui/card';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, ExternalLink, Info, UserCog, Loader2, Code } from 'lucide-react';
import { useState } from 'react';
import {
  Framework,
  getAgentConfigScript,
} from '@/app/(frontend)/lib/scriptUtils';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import { Label } from '@/app/(frontend)/components/ui/label';

export default function UserConfig() {
  const { data: session, status } = useSession();
  const [copied, setCopied] = useState(false);
  const { selectedFramework, setSelectedFramework } = useFramework();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  const configObj = {
    user_id: 'user_123',
    account_number: 'ACC123456',
    user_metadata: {
      name: 'John Doe',
      email: 'user@example.com',
      company: 'Example Company',
    },
  };

  const configExample = getAgentConfigScript(selectedFramework, configObj);

  const handleCopy = () => {
    navigator.clipboard.writeText(configExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-background p-4 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full relative z-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-foreground">
            User Configuration
          </h1>
        </div>

        {/* Info/tip box */}
        <div className="mb-12 flex items-center bg-muted border-l-4 border-accent p-4 rounded-lg shadow-md">
          <Info className="h-6 w-6 text-accent mr-3" />
          <span className="text-foreground text-base">
            Add this script to your website to provide user context to all your
            agents. You can customize the keys as needed.
          </span>
        </div>

        <motion.div variants={cardVariants}>
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-foreground rounded-lg translate-x-1 translate-y-1"></div>
            <Card className="relative bg-muted border-[3px] border-border rounded-lg shadow-xl border-l-8 border-l-destructive">
              <CardHeader className="flex items-center space-x-2">
                <UserCog className="h-7 w-7 text-destructive" />
                <CardTitle className="text-2xl font-semibold text-foreground">
                  Global User Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <p className="text-muted-foreground mb-4 text-base">
                    This configuration will be accessible to all your agents.
                    Add this script inside your website's{' '}
                    <code>&lt;body&gt;</code> tag to provide user context to
                    your agents.
                  </p>
                  <div className="mb-6">
                    <Label className="text-foreground text-lg font-semibold flex items-center gap-2">
                      <Code className="h-4 w-4 text-destructive" />
                      Framework
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Select the framework you're using to implement the user
                      configuration.
                    </p>
                    <div className="mt-2">
                      <Select
                        value={selectedFramework}
                        onValueChange={(value) =>
                          setSelectedFramework(value as Framework)
                        }
                      >
                        <SelectTrigger className="w-[200px] border-[2px] border-border">
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
                      {configExample}
                    </SyntaxHighlighter>
                    <Button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 bg-secondary text-secondary-foreground border-[2px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 shadow-md rounded-full p-2 text-xs sm:text-sm font-semibold hover:bg-secondary/90 flex items-center gap-1 sm:gap-2"
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
                  <p className="text-muted-foreground text-sm mt-2">
                    <strong>Note:</strong> The keys shown above are just
                    examples. You can add or remove keys as needed to fit your
                    application's requirements.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-l-4 border-destructive pl-3 mb-2">
                    Implementation Steps
                  </h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2 text-base">
                    <li>
                      {selectedFramework === Framework.NEXT_JS ? (
                        <>Add this script to your layout.tsx or page component</>
                      ) : (
                        <>Add this script to your website's HTML, ideally just before the closing <code>&lt;/body&gt;</code> tag</>
                      )}
                    </li>
                    <li>Update the values with your actual user information</li>
                    <li>
                      All your agents will automatically have access to this
                      user context
                    </li>
                    <li>
                      Need help? Visit our{' '}
                      <a
                        href="https://blizzardberry.com/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-destructive hover:underline"
                      >
                        documentation{' '}
                        <ExternalLink className="inline w-4 h-4" />
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
