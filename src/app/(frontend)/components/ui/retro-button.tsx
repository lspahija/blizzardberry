import * as React from 'react';
import { Button } from './button';
import { cn } from '@/app/(frontend)/lib/cssClassNames';

interface RetroButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'asChild'> {
  shadowColor?: 'black' | 'foreground';
  asChild?: boolean;
}

const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ className, shadowColor = 'black', ...props }, ref) => {
    const shadowClass =
      shadowColor === 'black' ? 'bg-black/80' : 'bg-foreground';

    return (
      <div className="relative group inline-block">
        <div
          className={cn(
            'absolute inset-0 rounded-lg transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5 translate-x-[3px] translate-y-[3px] sm:translate-x-1 sm:translate-y-1',
            shadowClass
          )}
        />
        <Button
          className={cn(
            'relative border-[3px] border-border rounded-lg',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
RetroButton.displayName = 'RetroButton';

export { RetroButton, type RetroButtonProps };
