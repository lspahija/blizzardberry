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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useChatbots } from '@/app/(frontend)/hooks/useChatbots';
import { use } from 'react';

export default function EditChatbotPage({
  params,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [model, setModel] = useState('google/gemini-2.0-flash-001');
  const [isLoading, setIsLoading] = useState(true);
  const { handleUpdateChatbot } = useChatbots();
  const { chatbotId } = use(params);

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

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        const response = await fetch(`/api/chatbots/${chatbotId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chatbot');
        }
        const data = await response.json();
        setName(data.chatbot.name);
        setWebsiteDomain(data.chatbot.websiteDomain);
        setModel(data.chatbot.model);
      } catch (error) {
        console.error('Error fetching chatbot:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatbot();
  }, [chatbotId]);

  const onUpdateChatbot = async () => {
    try {
      await handleUpdateChatbot(chatbotId, { name, websiteDomain, model });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating chatbot:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF8]">
        <p className="text-gray-900 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8]">
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-gray-900 sticky top-0 bg-[#FFFDF8] z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">
            <span className="text-gray-900">Blizzard</span>
            <span className="text-[#FE4A60]">Berry</span>
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
          Edit Chatbot
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
                <div>
                  <Label htmlFor="model" className="text-gray-900">
                    AI Model
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    The AI model that powers your chatbot
                  </p>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="mt-2 border-[2px] border-gray-900">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google/gemini-2.0-flash-001">
                        Gemini 2.0 Flash
                      </SelectItem>
                      <SelectItem value="google/gemini-2.5-pro-preview">
                        Gemini 2.5 Pro Preview
                      </SelectItem>
                      <SelectItem value="openai/gpt-4.1">
                        ChatGPT 4.1
                      </SelectItem>
                      <SelectItem value="openai/chatgpt-4o-latest">
                        ChatGPT 4o
                      </SelectItem>
                      <SelectItem value="anthropic/claude-sonnet-4">
                        Claude Sonnet 4
                      </SelectItem>
                      <SelectItem value="x-ai/grok-3-beta">
                        Grok 3 Beta
                      </SelectItem>
                      <SelectItem value="deepseek/deepseek-r1-distill-qwen-7b">
                        DeepSeek R1 Distill Qwen 7B
                      </SelectItem>
                      <SelectItem value="qwen/qwen3-30b-a3b">
                        Qwen 3 30B A3B
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    onClick={onUpdateChatbot}
                  >
                    Save Changes
                  </Button>
                  <Button
                    className="flex-1 bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform"
                    onClick={() => router.push('/dashboard')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
