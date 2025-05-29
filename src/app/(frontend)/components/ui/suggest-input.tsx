'use client';

import * as React from 'react';
import { Command, CommandInput, CommandItem, CommandList } from 'cmdk';
import { cn } from '@/app/(frontend)/lib/utils';

export interface SuggestInputProps {
  suggestions: string[];
  onSelect?: (value: string) => void;
  value?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  matchMode?: 'word' | 'full';
}

export function SuggestInput({
  suggestions,
  onSelect,
  value,
  className,
  inputClassName,
  onChange,
  matchMode = 'word',
  ...props
}: SuggestInputProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getLastWord = (text: string) => {
    const words = text.split(' ');
    return words[words.length - 1];
  };

  const filteredSuggestions = React.useMemo(() => {
    if (matchMode === 'word') {
      // For headers, keep the last word behavior
      const searchTerm = getLastWord((value || '').toLowerCase());
      if (!searchTerm) return [];

      return suggestions
        .filter((suggestion) => suggestion.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aStarts = a.toLowerCase().startsWith(searchTerm);
          const bStarts = b.toLowerCase().startsWith(searchTerm);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        });
    } else {
      // For URLs, split by common separators and match against the last part
      const parts = (value || '').split(/[/?&=]/);
      const lastPart = parts[parts.length - 1].toLowerCase();
      if (!lastPart) return [];

      return suggestions
        .filter((suggestion) => suggestion.toLowerCase().includes(lastPart))
        .sort((a, b) => {
          const aStarts = a.toLowerCase().startsWith(lastPart);
          const bStarts = b.toLowerCase().startsWith(lastPart);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        });
    }
  }, [suggestions, value, matchMode]);

  const handleSelect = (selectedValue: string) => {
    if (!value) return;

    let newValue = value;

    if (matchMode === 'word') {
      newValue = value.split(' ').slice(0, -1).concat(selectedValue).join(' ');
    } else {
      const parts = value.split(/([/?&=])/);
      parts[parts.length - 1] = selectedValue;
      newValue = parts.join('');
    }

    if (onSelect) {
      onSelect(newValue);
    } else if (onChange) {
      onChange({
        target: { value: newValue },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <Command className="w-full" shouldFilter={false}>
        <CommandInput
          ref={inputRef}
          value={value}
          placeholder="Bearer {{token}}"
          onValueChange={(val) => {
            if (onChange) {
              onChange({
                target: { value: val },
              } as React.ChangeEvent<HTMLInputElement>);
            }
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className={cn(
            'mt-2 h-9 w-full rounded-md border-2 border-gray-900 bg-[#fdf1dc] px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
            inputClassName
          )}
          {...props}
        />
        {open && filteredSuggestions.length > 0 && (
          <CommandList className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-gray-900 bg-white shadow-md text-sm p-1">
            {filteredSuggestions.map((suggestion, index) => (
              <CommandItem
                key={index}
                onSelect={() => handleSelect(suggestion)}
                className="cursor-default select-none px-3 py-1.5 text-sm text-black rounded-sm transition-colors data-[selected=true]:bg-[#fdf1dc] data-[selected=true]:text-black"
              >
                {suggestion}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
