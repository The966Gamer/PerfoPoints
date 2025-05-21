
import React from 'react';

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

export function Heading({ level, children, className = "" }: HeadingProps) {
  const baseStyles = "font-bold tracking-tight";
  const styles = {
    1: `text-3xl ${baseStyles}`,
    2: `text-2xl ${baseStyles}`,
    3: `text-xl ${baseStyles}`,
    4: `text-lg ${baseStyles}`,
    5: `text-base ${baseStyles}`,
    6: `text-sm ${baseStyles}`,
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag className={`${styles[level]} ${className}`}>{children}</Tag>;
}
