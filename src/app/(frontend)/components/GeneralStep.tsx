'use client';

import { Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  BaseAction,
  ExecutionContext,
} from '@/app/api/lib/model/action/baseAction';
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

interface GeneralStepProps {
  baseAction: BaseAction;
  setBaseAction: (action: BaseAction) => void;
  onNext: () => void;
}

export default function GeneralStep({
  baseAction,
  setBaseAction,
  onNext,
}: GeneralStepProps) {
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const handleNext = () => {
    const newErrors: { name?: string; description?: string } = {};
    
    if (!baseAction.name.trim()) {
      newErrors.name = 'Action name is required';
    }
    if (!baseAction.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
        <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="actionName" className="text-gray-900">
                Action Name *
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                A descriptive name for this action. This will help the AI agent
                know when to use it.
              </p>
              <Input
                id="actionName"
                value={baseAction.name}
                onChange={(e) => {
                  setErrors(prev => ({ ...prev, name: undefined }));
                  setBaseAction({ ...baseAction, name: e.target.value });
                }}
                placeholder="Update_Subscription"
                className={`mt-2 border-[2px] ${errors.name ? 'border-red-500' : 'border-gray-900'}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-900">
                Description *
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Explain when the AI Agent should use this action. Include a
                description of what this action does, the data it provides, and
                any updates it makes. Include example queries that should
                trigger this action.
              </p>
              <Textarea
                id="description"
                value={baseAction.description}
                onChange={(e) => {
                  setErrors(prev => ({ ...prev, description: undefined }));
                  setBaseAction({ ...baseAction, description: e.target.value });
                }}
                placeholder="Describe when the AI agent should use this action..."
                className={`mt-2 border-[2px] ${errors.description ? 'border-red-500' : 'border-gray-900'}`}
                rows={5}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label className="text-gray-900">Action Type</Label>
              <RadioGroup
                value={baseAction.executionContext}
                onValueChange={(value: ExecutionContext) =>
                  setBaseAction({ ...baseAction, executionContext: value })
                }
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={ExecutionContext.SERVER} id="server" />
                  <Label htmlFor="server" className="text-gray-900">
                    Server Action
                    <p className="text-sm text-gray-600">
                      This action will be executed on the server. There is no
                      need to write any client-side code.
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={ExecutionContext.CLIENT} id="client" />
                  <Label htmlFor="client" className="text-gray-900">
                    Client Action
                    <p className="text-sm text-gray-600">
                      This action will be executed on the client. You will need
                      to write some client-side code. Explore the docs.
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              className="bg-[#FFC480] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer"
              onClick={handleNext}
            >
              <Save className="w-4 h-4 mr-2" />
              Save and Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
