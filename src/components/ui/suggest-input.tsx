'use client';

import * as React from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { cn } from '@/lib/utils';

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

    if (matchMode === 'word') {
      // For headers, replace only the last word
      const newValue = value.split(' ').slice(0, -1).concat(selectedValue).join(' ');
      if (onSelect) {
        onSelect(newValue);
      } else if (onChange) {
        onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
      }
    } else {
      // For URLs, replace the last part after a separator
      const parts = value.split(/([/?&=])/);
      parts[parts.length - 1] = selectedValue;
      const newValue = parts.join('');
      if (onSelect) {
        onSelect(newValue);
      } else if (onChange) {
        onChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className={cn('relative', className)}>
        <CommandPrimitive className="relative">
          <CommandPrimitive.Input
            ref={inputRef}
            value={value}
            onValueChange={(value) => {
              if (onChange) {
                onChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
              }
              setOpen(true);
            }}
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
              'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
              inputClassName
            )}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 200);
            }}
            {...props}
          />
        </CommandPrimitive>
      </div>
      {open && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-white py-1 shadow-lg">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="cursor-pointer px-3 py-1.5 text-sm hover:bg-gray-100"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 