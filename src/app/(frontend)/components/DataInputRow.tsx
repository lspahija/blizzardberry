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
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1.8fr_70px] gap-y-3 md:gap-y-2 gap-x-1 md:gap-x-2 mt-4 items-start md:items-center p-3 md:p-0 bg-card md:bg-transparent rounded-xl md:rounded-none border-[2px] md:border-0 border-border">
      <div>
        <Label
          htmlFor={`inputName${index}`}
          className="flex items-center gap-2 text-sm md:text-base text-foreground mb-2 md:mb-1"
        >
          {nameIcon}
          Name
        </Label>
        <Input
          id={`inputName${index}`}
          value={input.name}
          onChange={(e) => updateDataInput('name', e.target.value)}
          placeholder="city"
          className="mt-2 border-[2px] border-border text-sm md:text-base text-foreground"
        />
      </div>
      <div>
        <div className="flex items-end gap-2">
          <div>
            <Label
              htmlFor={`inputType${index}`}
              className="flex items-center gap-2 text-sm md:text-base text-foreground"
            >
              {typeIcon}
              Type
            </Label>
            <Select
              value={input.type}
              onValueChange={(value) => updateDataInput('type', value)}
            >
              <SelectTrigger className="mt-2 border-[2px] border-border text-sm md:text-base text-foreground">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Number">Number</SelectItem>
                <SelectItem value="Boolean">Boolean</SelectItem>
                
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col items-center">
            <Label
              htmlFor={`inputArray${index}`}
              className="text-xs md:text-sm whitespace-nowrap text-foreground mb-1"
            >
              Array
            </Label>
            <input
              id={`inputArray${index}`}
              type="checkbox"
              checked={input.isArray}
              onChange={(e) => updateDataInput('isArray', e.target.checked)}
              className="border-[2px] border-border w-4 h-4 md:w-5 md:h-5 mb-2"
            />
          </div>
        </div>
      </div>
      <div>
        <Label
          htmlFor={`inputDesc${index}`}
          className="flex items-center gap-2 text-sm md:text-base text-foreground"
        >
          {descriptionIcon}
          Description
        </Label>
        <Input
          id={`inputDesc${index}`}
          value={input.description}
          onChange={(e) => updateDataInput('description', e.target.value)}
          placeholder="The city to get weather for, e.g. Los Angeles"
          className="mt-2 border-[2px] border-border text-sm md:text-base text-foreground"
        />
      </div>
      <div className="flex items-center justify-end md:justify-center h-full mr-2 mt-2 md:mt-6">
        <Button
          variant="destructive"
          className="border-[2px] border-border hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-xl p-2 md:p-3 -mt-3 md:mt-2 lg:mt-2"
          onClick={removeDataInput}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
