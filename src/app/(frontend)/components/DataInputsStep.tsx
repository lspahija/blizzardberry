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
import { Label } from '@/app/(frontend)/components/ui/label';

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
}

export default function DataInputsStep({
  dataInputs,
  setDataInputs,
  onNext,
  onBack,
}: DataInputsStepProps) {
  const addDataInput = () => {
    setDataInputs([
      ...dataInputs,
      { name: '', type: 'Text', description: '', isArray: false },
    ]);
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" whileInView="visible">
      <div
        className="mb-6 md:mb-12 flex items-start md:items-center bg-muted border-l-4 p-3 md:p-4 rounded-lg shadow-md"
        style={{ borderLeftColor: 'var(--color-destructive)' }}
      >
        <Info className="h-5 w-5 md:h-6 md:w-6 text-destructive mr-2 md:mr-3 mt-1 md:mt-0 flex-shrink-0" />
        <span className="text-foreground text-sm md:text-base">
          Specify any data inputs your action needs. The AI agent can use these
          to perform the action more effectively.
        </span>
      </div>
      <div className="relative mb-6 md:mb-12">
        <div className="absolute inset-0 bg-border rounded-lg translate-x-1 translate-y-1"></div>
        <Card
          className="relative bg-card border-[3px] border-border rounded-lg shadow-xl border-l-8"
          style={{ borderLeftColor: 'var(--color-destructive)' }}
        >
          <CardHeader className="flex flex-row items-center space-x-2 p-4 md:p-6">
            <List className="h-5 w-5 md:h-7 md:w-7 text-destructive" />
            <CardTitle className="text-xl md:text-2xl font-semibold text-foreground">
              Data Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 md:space-y-8 p-4 md:p-6">
            <div>
              <label className="text-foreground text-base md:text-lg font-semibold flex items-center gap-2">
                <List className="h-4 w-4 text-destructive" />
                Data Inputs (Optional)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs md:text-sm text-muted-foreground ml-2">
                  List any information the AI Agent needs to perform the action.
                  The agent can find the data in the chat history, request it
                  from the user, or retrieve it from the specified user config
                  if available.
                </p>
              </div>
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
                className="mt-4 bg-card text-foreground border border-border hover:bg-muted hover:border-border transition-transform duration-200 text-sm md:text-base font-normal px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 w-full md:w-auto"
                onClick={addDataInput}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Data Input
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="bg-card text-foreground border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 text-base md:text-lg font-semibold w-full sm:w-auto"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                className="bg-destructive text-white border-[3px] border-border hover:-translate-y-1 hover:-translate-x-1 hover:bg-brand transition-transform duration-200 shadow-md text-base md:text-lg font-semibold w-full sm:w-auto"
                onClick={onNext}
              >
                <Save className="w-4 h-4 mr-2" />
                Save and Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
