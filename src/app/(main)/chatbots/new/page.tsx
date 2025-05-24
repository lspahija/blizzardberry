'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatbotFormPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [websiteDomain, setWebsiteDomain] = useState('');

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
          websiteDomain
        }),
      });

      if (response.ok) {
        const { chatbotId } = await response.json();
        router.push(`/chatbots/${chatbotId}/actions/new`);
      } else {
        console.error('Failed to create chatbot:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
    }
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
                      The domain of the website where this chatbot will be installed
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
                    <Save className="w-4 h-4 mr-2" />
                    Create Chatbot
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
  );
}