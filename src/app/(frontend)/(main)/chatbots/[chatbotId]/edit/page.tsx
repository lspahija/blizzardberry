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
import { Bot, Globe, Type, Settings, Loader2 } from 'lucide-react';
import { Info } from 'lucide-react';
import {
  ChatbotModel,
  ChatbotModelDisplay,
  ChatbotModelList,
} from '@/app/api/lib/model/chatbot/chatbot';

export default function EditChatbotPage({
  params,
}: {
  params: Promise<{ chatbotId: string }>;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');
  const [model, setModel] = useState<ChatbotModel>(
    ChatbotModel.GEMINI_2_0_FLASH
  );
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
        setModel(data.chatbot.model as ChatbotModel);
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
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] relative overflow-hidden">
      <nav className="flex justify-between items-center p-4 max-w-4xl mx-auto border-b-[3px] border-gray-900 sticky top-0 bg-[#FFFDF8] z-50">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">
            <span className="text-gray-900">Blizzard</span>
            <span className="text-[#FE4A60]">Berry</span>
          </span>
        </div>
      </nav>

      <motion.div
        className="max-w-4xl mx-auto px-4 py-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8 flex items-center bg-[#FFF4DA] border-l-4 border-[#FE4A60] p-4 rounded-lg shadow-md"
          variants={itemVariants}
        >
          <Info className="h-6 w-6 text-[#FE4A60] mr-3" />
          <span className="text-gray-800 text-base">
            Update your chatbot details below. Changes will be reflected
            immediately after saving.
          </span>
        </motion.div>

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
            <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-xl border-l-8 border-l-[#FE4A60]">
              <CardHeader className="flex items-center space-x-2">
                <Bot className="h-7 w-7 text-[#FE4A60]" />
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Chatbot Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label
                    htmlFor="name"
                    className="text-gray-900 flex items-center gap-2"
                  >
                    <Type className="h-4 w-4 text-[#FE4A60]" />
                    Chatbot Name
                  </Label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    A unique name for your chatbot
                  </p>
                  <div className="relative mt-2">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My Customer Service Bot"
                      className="pl-10 border-[2px] border-gray-900"
                    />
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="websiteDomain"
                    className="text-gray-900 flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-[#FE4A60]" />
                    Website Domain
                  </Label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    The domain of the website where this chatbot will be
                    installed
                  </p>
                  <div className="relative mt-2">
                    <Input
                      id="websiteDomain"
                      value={websiteDomain}
                      onChange={(e) => setWebsiteDomain(e.target.value)}
                      placeholder="example.com"
                      className="pl-10 border-[2px] border-gray-900"
                    />
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="model"
                    className="text-gray-900 flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4 text-[#FE4A60]" />
                    AI Model
                  </Label>
                  <p className="text-sm text-gray-600 mt-1 ml-6">
                    The AI model that powers your chatbot
                  </p>
                  <div className="relative mt-2">
                    <Settings className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                    <Select
                      value={model}
                      onValueChange={(value) => setModel(value as ChatbotModel)}
                    >
                      <SelectTrigger className="pl-10 border-[2px] border-gray-900">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {ChatbotModelList.map((modelValue) => (
                          <SelectItem key={modelValue} value={modelValue}>
                            {ChatbotModelDisplay[modelValue]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 hover:bg-[#ff6a7a] transition-transform duration-200 shadow-md text-lg font-semibold"
                    onClick={onUpdateChatbot}
                  >
                    Save Changes
                  </Button>
                  <Button
                    className="flex-1 bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 hover:bg-[#FFD9A0] transition-transform duration-200 shadow-md text-lg font-semibold"
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
