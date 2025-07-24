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
      <div
        className="mb-6 md:mb-12 flex items-start md:items-center bg-muted border-l-4 p-3 md:p-4 rounded-lg shadow-md"
        style={{ borderLeftColor: 'var(--color-accent)' }}
      >
        <Info className="h-5 w-5 md:h-6 md:w-6 text-accent mr-2 md:mr-3 mt-1 md:mt-0 flex-shrink-0" />
        <span className="text-foreground text-sm md:text-base">
          Fill out the general information for your action. This helps the AI
          agent understand when and how to use it.
        </span>
      </div>
      <div className="relative mb-6 md:mb-12">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader className="flex items-center space-x-2 p-4 md:p-6">
            <Settings className="h-5 w-5 md:h-7 md:w-7 text-destructive" />
            <CardTitle className="text-xl md:text-2xl font-semibold text-foreground">
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8 p-4 md:p-6">
            <div>
              <Label
                htmlFor="actionName"
                className="text-foreground text-base md:text-lg font-semibold flex items-center gap-2"
              >
                <Zap className="h-4 w-4 text-destructive" />
                Action Name
              </Label>
              <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-6">
                A descriptive name for this action. This will help the AI agent
                know when to use it.
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
              <p className="text-xs md:text-sm text-muted-foreground mt-1 ml-6">
                Explain when the AI Agent should use this action. Include a
                description of what this action does, the data it provides, and
                any updates it makes. Include example queries that should
                trigger this action.
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
              <Label className="text-foreground text-base md:text-lg font-semibold">
                Action Type
              </Label>
              <RadioGroup
                value={baseAction.executionContext}
                onValueChange={(value: ExecutionContext) =>
                  setBaseAction({ ...baseAction, executionContext: value })
                }
                className="flex flex-col sm:flex-row sm:space-x-4 mt-2 space-y-4 sm:space-y-0"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem
                    value={ExecutionContext.SERVER}
                    id="server"
                    className="mt-5"
                  />
                  <Label htmlFor="server" className="text-foreground">
                    Server Action
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      This action will be executed on the server. There is no
                      need to write any client-side code.
                    </p>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem
                    value={ExecutionContext.CLIENT}
                    id="client"
                    className="mt-5"
                  />
                  <Label htmlFor="client" className="text-foreground">
                    Client Action
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      This action will be executed on the client. You will need
                      to write some client-side code. Explore the docs.
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Button
              className="bg-destructive text-white border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand transition-transform duration-200 shadow-md text-base md:text-lg font-semibold w-full"
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
