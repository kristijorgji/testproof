'use client';

import { forwardRef } from 'react';

import { cn } from '@/lib/cn';

const scrollbarClasses =
    '[scrollbar-width:thin] [scrollbar-color:var(--muted)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--muted)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--fg)]';

interface ScrollbarProps extends React.ComponentProps<'div'> {
    orientation?: 'vertical' | 'horizontal' | 'both';
}

export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
    { className, orientation = 'vertical', children, ...props },
    ref,
) {
    const overflow =
        orientation === 'horizontal'
            ? 'overflow-x-auto overflow-y-hidden'
            : orientation === 'both'
              ? 'overflow-auto'
              : 'overflow-y-auto overflow-x-hidden';

    return (
        <div ref={ref} className={cn(overflow, scrollbarClasses, className)} {...props}>
            {children}
        </div>
    );
});
