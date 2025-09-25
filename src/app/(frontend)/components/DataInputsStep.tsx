'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { motion } from 'framer-motion';
import { Save, List, Info, PlusCircle, Zap, Tag } from 'lucide-react';
import { Button } from '@/app/(frontend)/components/ui/button';
import DataInputRow from '@/app/(frontend)/components/DataInputRow';

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

interface DataInputsStepProps {
  dataInputs: DataInput[];
  setDataInputs: (inputs: DataInput[]) => void;
  onNext: () => void;
  onBack: () => void;
  isClientAction?: boolean;
  onCreateAction?: () => void;
  isCreatingAction?: boolean;
}

export default function DataInputsStep({
  dataInputs,
  setDataInputs,
  onNext,
  onBack,
  isClientAction = false,
  onCreateAction,
  isCreatingAction = false,
}: DataInputsStepProps) {
  const addDataInput = () => {
    setDataInputs([
      ...dataInputs,
      { name: '', type: 'Text', description: '', isArray: false },
    ]);
  };

  const handleNextOrCreate = () => {
    if (isClientAction && onCreateAction) {
      onCreateAction();
    } else {
      onNext();
    }
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
      <div className="relative mb-6 md:mb-12">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader>
            <div>
              <div className="flex items-center gap-2">
                <List className="h-7 w-7 text-[#FE4A60]" />
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Data Inputs
                </CardTitle>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Specify the information the AI Agent needs to perform the
                action. The agent will be able to populate the values in
                real-time by looking in the chat history, requesting them from
                the user, or finding them in the user config.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-4 pt-0 px-4 md:px-6 pb-2 md:pb-3">
            <div className="-mt-4">
              {dataInputs.map((input, index) => (
                <DataInputRow
                  key={index}
                  input={input}
                  index={index}
                  updateDataInput={(field, value) => {
                    const updatedInputs = [...dataInputs];
                    updatedInputs[index] = {
                      ...updatedInputs[index],
                      [field]: value,
                    };
                    setDataInputs(updatedInputs);
                  }}
                  removeDataInput={() =>
                    setDataInputs(dataInputs.filter((_, i) => i !== index))
                  }
                  nameIcon={<Zap className="h-4 w-4 text-destructive" />}
                  typeIcon={<Tag className="h-4 w-4 text-destructive" />}
                  descriptionIcon={
                    <Info className="h-4 w-4 text-destructive" />
                  }
                />
              ))}
              <Button
                variant="outline"
                className="mt-10 bg-card text-foreground border border-border hover:bg-muted hover:border-border transition-transform duration-200 text-sm md:text-base font-normal px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 w-full md:w-auto"
                onClick={addDataInput}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Data Input
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
