'use client';

import { Save, Settings, Info, Zap } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

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
      <div className="relative mb-2 md:mb-3">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardContent className="space-y-6 md:space-y-8 p-4 md:p-6">
            <div>
              <Label
                htmlFor="actionName"
                className="text-foreground text-base md:text-lg font-semibold flex items-center gap-2"
              >
                <Zap className="h-4 w-4 text-destructive" />
                Action Name
              </Label>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-3 ml-6">
                Enter a descriptive name for this action. This will help the AI
                agent know when to use it.
              </p>
              <div className="relative">
                <Input
                  id="actionName"
                  value={baseAction.name}
                  onChange={(e) => {
                    setErrors((prev) => ({ ...prev, name: undefined }));
                    setBaseAction({ ...baseAction, name: e.target.value });
                  }}
                  placeholder="Update_Subscription"
                  className={`mt-2 border-[2px] ${errors.name ? 'border-destructive' : 'border-border'} pl-10 text-sm md:text-base`}
                />
                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-destructive text-xs md:text-sm mt-1">
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <Label
                htmlFor="description"
                className="text-foreground text-base md:text-lg font-semibold flex items-center gap-2"
              >
                <Info className="h-4 w-4 text-destructive" />
                Description
              </Label>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-3 ml-6">
                Explain when the AI Agent should use this action. Describe what
                this action does. You can also provide example prompts from the
                user that would trigger this action.
              </p>
              <Textarea
                id="description"
                value={baseAction.description}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, description: undefined }));
                  setBaseAction({ ...baseAction, description: e.target.value });
                }}
                placeholder="Describe when the AI agent should use this action..."
                className={`mt-2 border-[2px] ${errors.description ? 'border-destructive' : 'border-border'} text-sm md:text-base`}
                rows={5}
              />
              {errors.description && (
                <p className="text-destructive text-xs md:text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <Label className="text-foreground text-base md:text-lg font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4 text-destructive" />
                Action Type
              </Label>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-6">
                Choose where your action will be executed
              </p>
              <RadioGroup
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
                    <div className="font-semibold text-foreground mb-2">
                      Server Action
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
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
                    <div className="font-semibold text-foreground mb-2">
                      Client Action
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Executed purely on the client. Requires a tiny code
                      snippet.
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="pt-4">
              <Button
                type="button"
                className="bg-destructive text-white border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand transition-transform duration-200 shadow-md text-base md:text-lg font-semibold"
                onClick={handleNext}
              >
                <Save className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
