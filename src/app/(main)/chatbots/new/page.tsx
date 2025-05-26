'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function NewChatbotPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [chatbotId, setChatbotId] = useState(null);
  const [copied, setCopied] = useState(false);

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

  const handleCreateChatbot = async () => {
    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          websiteDomain,
        }),
      });

      if (response.ok) {
        const { chatbotId } = await response.json();
        setChatbotId(chatbotId);
      } else {
        console.error('Failed to create chatbot:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `<script
        id="omni-interface-chatbot"
        src="https://omni-interface.com/chatbot.js"
        strategy="afterInteractive"
        data-chatbot-id="${chatbotId}"
      ></script>`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

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
        {chatbotId ? (
          // Success State
          <>
            <motion.div className="text-center" variants={itemVariants}>
              <CheckCircle2 className="w-16 h-16 text-[#FE4A60] mx-auto mb-4" />
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 mb-6">
                Chatbot Created Successfully!
              </h1>
              <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
                Your chatbot is ready to be added to your website. Follow the
                steps below to install it.
              </p>
            </motion.div>

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
                      Install Your Chatbot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-gray-600 mb-4">
                        To add your chatbot to your website, copy the code
                        snippet below and paste it between the{' '}
                        <code>&lt;body&gt;</code> tags of your website's HTML.
                      </p>
                      <div className="relative">
                        <SyntaxHighlighter
                          language="html"
                          style={vscDarkPlus}
                          customStyle={{
                            borderRadius: '8px',
                            padding: '16px',
                            border: '2px solid #1a1a1a',
                            backgroundColor: '#1a1a1a',
                          }}
                        >
                          {`<script
  id="omni-interface-chatbot"
  src="https://omni-interface.com/chatbot.js"
  strategy="afterInteractive"
  data-chatbot-id="${chatbotId}"
></script>`}
                        </SyntaxHighlighter>
                        <Button
                          onClick={handleCopy}
                          className="absolute top-2 right-2 bg-[#FFC480] text-gray-900 border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        This script loads your chatbot with the unique ID:{' '}
                        <code>{chatbotId}</code>.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Next Steps
                      </h3>
                      <ul className="list-disc list-inside text-gray-600 space-y-2">
                        <li>
                          Paste the code snippet in your website's HTML, ideally
                          just before the closing <code>&lt;/body&gt;</code>{' '}
                          tag.
                        </li>
                        <li>Save and publish your website changes.</li>
                        <li>
                          Your chatbot will appear on your website at{' '}
                          <code>https://{websiteDomain}</code>.
                        </li>
                        <li>
                          Need help? Visit our{' '}
                          <a
                            href="https://omni-interface.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FE4A60] hover:underline"
                          >
                            documentation{' '}
                            <ExternalLink className="inline w-4 h-4" />
                          </a>
                          .
                        </li>
                      </ul>
                    </div>
                    <Button
                      className="w-full bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                      onClick={handleContinue}
                    >
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        ) : (
          // Form State
          <>
            <motion.h1
              className="text-4xl sm:text-5xl font-bold tracking-tighter text-gray-900 mb-12 text-center"
              variants={itemVariants}
            >
              Create New Chatbot
            </motion.h1>

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
                      Chatbot Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-gray-900">
                        Chatbot Name
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        A unique name for your chatbot
                      </p>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Customer Service Bot"
                        className="mt-2 border-[2px] border-gray-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="websiteDomain" className="text-gray-900">
                        Website Domain
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        The domain of the website where this chatbot will be
                        installed
                      </p>
                      <Input
                        id="websiteDomain"
                        value={websiteDomain}
                        onChange={(e) => setWebsiteDomain(e.target.value)}
                        placeholder="example.com"
                        className="mt-2 border-[2px] border-gray-900"
                      />
                    </div>
                    <Button
                      className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                      onClick={handleCreateChatbot}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Create Chatbot
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
