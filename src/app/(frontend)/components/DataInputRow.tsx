'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import { Input } from '@/app/(frontend)/components/ui/input';
import { Label } from '@/app/(frontend)/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select';
import { Trash2 } from 'lucide-react';

interface DataInput {
  name: string;
  type: string;
  description: string;
  isArray: boolean;
}

interface DataInputRowProps {
  input: DataInput;
  index: number;
  updateDataInput: (field: keyof DataInput, value: any) => void;
  removeDataInput: () => void;
  nameIcon?: React.ReactNode;
  typeIcon?: React.ReactNode;
  descriptionIcon?: React.ReactNode;
}

export default function DataInputRow({
  input,
  index,
  updateDataInput,
  removeDataInput,
  nameIcon,
  typeIcon,
  descriptionIcon,
}: DataInputRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_70px_70px] gap-2 mt-4 items-center">
      <div>
        <Label htmlFor={`inputName${index}`} className="flex items-center gap-2">
          {nameIcon}
          Name
        </Label>
        <Input
          id={`inputName${index}`}
          value={input.name}
          onChange={(e) => updateDataInput('name', e.target.value)}
          placeholder="city"
          className="mt-2 border-[2px] border-gray-900"
        />
      </div>
      <div>
        <Label htmlFor={`inputType${index}`} className="flex items-center gap-2">
          {typeIcon}
          Type
        </Label>
        <Select
          value={input.type}
          onValueChange={(value) => updateDataInput('type', value)}
        >
          <SelectTrigger className="mt-2 border-[2px] border-gray-900">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Text">Text</SelectItem>
            <SelectItem value="Number">Number</SelectItem>
            <SelectItem value="Boolean">Boolean</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={`inputDesc${index}`} className="flex items-center gap-2">
          {descriptionIcon}
          Description
        </Label>
        <Input
          id={`inputDesc${index}`}
          value={input.description}
          onChange={(e) => updateDataInput('description', e.target.value)}
          placeholder="The city to get weather for, e.g. Los Angeles"
          className="mt-2 border-[2px] border-gray-900"
        />
      </div>
      <div className="flex flex-col items-center gap-1 mt-2.5">
        <Label htmlFor={`inputArray${index}`} className="mb-0">Array</Label>
        <input
          id={`inputArray${index}`}
          type="checkbox"
          checked={input.isArray}
          onChange={(e) => updateDataInput('isArray', e.target.checked)}
          className="border-[2px] border-gray-900"
        />
      </div>
      <div className="flex items-center justify-center h-full mr-2 mt-6">
        <Button
          variant="destructive"
          className="border-[2px] border-gray-900 hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl"
          onClick={removeDataInput}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
