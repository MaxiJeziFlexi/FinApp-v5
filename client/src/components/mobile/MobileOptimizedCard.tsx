import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
}

export default function MobileOptimizedCard({
  title,
  description,
  children,
  className,
  variant = 'default'
}: MobileOptimizedCardProps) {
  return (
    <Card className={cn(
      'w-full backdrop-blur-md border border-white/20 dark:border-gray-800/20',
      variant === 'compact' ? 'p-3 sm:p-4' : 'p-4 sm:p-6',
      className
    )}>
      <CardHeader className={variant === 'compact' ? 'pb-2 px-0' : 'pb-4'}>
        <CardTitle className={cn(
          'text-gray-900 dark:text-white',
          variant === 'compact' ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
        )}>
          {title}
        </CardTitle>
        {description && (
          <CardDescription className={cn(
            'text-gray-600 dark:text-gray-400',
            variant === 'compact' ? 'text-sm' : 'text-base'
          )}>
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={variant === 'compact' ? 'px-0 pt-0' : 'px-0'}>
        {children}
      </CardContent>
    </Card>
  );
}