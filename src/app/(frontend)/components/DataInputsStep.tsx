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
      <div className="mb-12 flex items-center bg-[#FFF4DA] border-l-4 border-[#FE4A60] p-4 rounded-lg shadow-md">
        <Info className="h-6 w-6 text-[#FE4A60] mr-3" />
        <span className="text-gray-800 text-base">
          Specify any data inputs your action needs. The AI agent can use these
          to perform the action more effectively.
        </span>
      </div>
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gray-900 rounded-lg translate-x-1 translate-y-1"></div>
        <Card className="relative bg-[#FFF4DA] border-[3px] border-gray-900 rounded-lg shadow-xl border-l-8 border-l-[#FE4A60]">
          <CardHeader className="flex flex-row items-center space-x-2">
            <List className="h-7 w-7 text-[#FE4A60]" />
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Data Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <label className="text-gray-900 text-lg font-semibold flex items-center gap-2">
                <List className="h-4 w-4 text-[#FE4A60]" />
                Data Inputs (Optional)
              </label>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-600 ml-2">
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
                  nameIcon={<Zap className="h-4 w-4 text-[#FE4A60]" />}
                  typeIcon={<Tag className="h-4 w-4 text-[#FE4A60]" />}
                  descriptionIcon={<Info className="h-4 w-4 text-[#FE4A60]" />}
                />
              ))}
              <Button
                variant="outline"
                className="mt-4 bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-transform duration-200 text-base font-normal px-4 py-2 flex items-center gap-2"
                onClick={addDataInput}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Data Input
              </Button>
            </div>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="bg-[#FFFDF8] text-gray-900 border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 transition-transform duration-200 text-lg font-semibold"
                onClick={onBack}
              >
                Back
              </Button>
              <Button
                className="bg-[#FE4A60] text-white border-[3px] border-gray-900 hover:-translate-y-1 hover:-translate-x-1 hover:bg-[#ff6a7a] transition-transform duration-200 shadow-md text-lg font-semibold"
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
