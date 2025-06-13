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
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Framework, getChatbotConfigScript } from '@/app/(frontend)/lib/scriptUtils';
import { useFramework } from '@/app/(frontend)/contexts/useFramework';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';

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
    user_id: "user_123",
    account_number: "ACC123456",
    user_metadata: {
      name: "John Doe",
      email: "user@example.com",
      company: "Example Company"
    }
  };

  const configExample = getChatbotConfigScript(selectedFramework, configObj);

  const handleCopy = () => {
    navigator.clipboard.writeText(configExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col bg-[#FFFDF8] p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            User Configuration
          </h1>
          <Button
            asChild
            className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
          >
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>

        <motion.div variants={cardVariants}>
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
            <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Global User Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    This configuration will be accessible to all your chatbots.
                    Add this script inside your website's{' '}
                    <code>&lt;body&gt;</code> tag to provide user context to
                    your chatbots.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Framework
                    </label>
                    <Select
                      value={selectedFramework}
                      onValueChange={(value) => setSelectedFramework(value as Framework)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select framework" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Framework.ANGULAR}>Angular</SelectItem>
                        <SelectItem value={Framework.NEXT_JS}>Next.js</SelectItem>
                        <SelectItem value={Framework.REACT}>React</SelectItem>
                        <SelectItem value={Framework.VANILLA}>Vanilla JS</SelectItem>
                        <SelectItem value={Framework.VUE}>Vue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <SyntaxHighlighter
                      language="javascript"
                      style={vscDarkPlus}
                      customStyle={{
                        borderRadius: '8px',
                        padding: '16px',
                        border: '2px solid #1a1a1a',
                        backgroundColor: '#1a1a1a',
                      }}
                    >
                      {configExample}
                    </SyntaxHighlighter>
                    <Button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? 'Copied!' : 'Copy Code'}
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Note:</strong> The keys shown above are just
                    examples. You can add or remove keys as needed to fit your
                    application's requirements.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Implementation Steps
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    <li>
                      Add this script to your website's HTML, ideally just
                      before the closing <code>&lt;/body&gt;</code> tag
                    </li>
                    <li>Update the values with your actual user information</li>
                    <li>
                      All your chatbots will automatically have access to this
                      user context
                    </li>
                    <li>
                      Need help? Visit our{' '}
                      <a
                        href="https://blizzardberry.com/docs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FE4A60] hover:underline"
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
