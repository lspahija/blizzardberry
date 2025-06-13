'use client';

import { Button } from '@/app/(frontend)/components/ui/button';
import { Label } from '@/app/(frontend)/components/ui/label';
import { SuggestInput } from '@/app/(frontend)/components/ui/suggest-input';
import { Trash2 } from 'lucide-react';
import { Key, Tag } from 'lucide-react';

interface Header {
  key: string;
  value: string;
}

interface HeaderInputProps {
  header: Header;
  index: number;
  updateHeader: (field: keyof Header, value: string) => void;
  removeHeader: () => void;
  suggestions: string[];
  commonHeaderKeys: string[];
}

export default function HeaderInput({
  header,
  index,
  updateHeader,
  removeHeader,
  suggestions,
  commonHeaderKeys,
}: HeaderInputProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_50px] gap-4 mt-4 items-end">
      <div>
        <Label htmlFor={`headerKey${index}`} className="flex items-center gap-2">
          <Key className="h-4 w-4 text-[#FE4A60]" />
          Key
        </Label>
        <SuggestInput
          id={`headerKey${index}`}
          value={header.key}
          onChange={(e) => updateHeader('key', e.target.value)}
          onSelect={(val) => updateHeader('key', val)}
          suggestions={commonHeaderKeys}
          placeholder="Authorization"
          inputClassName="border-[2px] border-gray-900"
          matchMode="word"
        />
      </div>
      <div>
        <Label htmlFor={`headerValue${index}`} className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-[#FE4A60]" />
          Value
        </Label>
        <SuggestInput
          id={`headerValue${index}`}
          value={header.value}
          onChange={(e) => updateHeader('value', e.target.value)}
          suggestions={suggestions}
          placeholder="Bearer {{token}}"
          inputClassName="border-[2px] border-gray-900"
          matchMode="word"
        />
      </div>
      <div>
        <Button
          className="bg-[#FE4A60] text-white border-[2px] border-gray-900 hover:bg-[#ff6a7a] hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform cursor-pointer rounded-full p-2"
          onClick={removeHeader}
        >
          <Trash2 className="h-4 w-4 text-white transition-transform duration-200 group-hover:scale-125 group-hover:-rotate-12" />
        </Button>
      </div>
    </div>
  );
}
