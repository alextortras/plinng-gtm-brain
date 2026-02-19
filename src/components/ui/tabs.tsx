'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Tab {
  value: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** 'underline' for primary navigation, 'segmented' for view toggles */
  variant?: 'underline' | 'segmented';
  className?: string;
  children?: React.ReactNode;
}

interface TabsContextValue {
  activeTab: string;
}

export function Tabs({
  tabs,
  defaultValue,
  onValueChange,
  variant = 'underline',
  className,
  children,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue ?? tabs[0]?.value ?? '');

  const handleChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <div className={className}>
      {variant === 'underline' ? (
        <div className="flex border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleChange(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors -mb-px',
                activeTab === tab.value
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="inline-flex rounded-md border border-border overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleChange(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                activeTab === tab.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {children != null && (
        <div className="mt-4">
          {typeof children === 'function'
            ? (children as (ctx: TabsContextValue) => React.ReactNode)({ activeTab })
            : children}
        </div>
      )}
    </div>
  );
}
