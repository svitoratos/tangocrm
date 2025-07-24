"use client";

import React, { useEffect, useRef, useState } from 'react';

interface RoughNotationProps {
  type?: 'highlight' | 'underline' | 'box' | 'circle' | 'crossed-off' | 'bracket';
  color?: string;
  animationDuration?: number;
  iterations?: number;
  multiline?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface RoughNotationGroupProps {
  show?: boolean;
  children: React.ReactNode;
}

export const RoughNotation: React.FC<RoughNotationProps> = ({
  type = 'highlight',
  color = '#fbbf24',
  animationDuration = 1000,
  iterations = 1,
  multiline = false,
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const getStyles = () => {
    const baseStyles = {
      transition: `all ${animationDuration}ms ease-in-out`,
      animationIterationCount: iterations,
    };

    switch (type) {
      case 'highlight':
        return {
          ...baseStyles,
          backgroundColor: isVisible ? color : 'transparent',
          padding: '2px 4px',
          borderRadius: '4px',
        };
      case 'underline':
        return {
          ...baseStyles,
          borderBottom: isVisible ? `3px solid ${color}` : '3px solid transparent',
          paddingBottom: '2px',
        };
      case 'box':
        return {
          ...baseStyles,
          border: isVisible ? `2px solid ${color}` : '2px solid transparent',
          padding: '2px 4px',
          borderRadius: '4px',
        };
      case 'circle':
        return {
          ...baseStyles,
          border: isVisible ? `2px solid ${color}` : '2px solid transparent',
          borderRadius: '50%',
          padding: '2px 4px',
        };
      case 'crossed-off':
        return {
          ...baseStyles,
          textDecoration: isVisible ? 'line-through' : 'none',
          textDecorationColor: color,
          textDecorationThickness: '3px',
        };
      case 'bracket':
        return {
          ...baseStyles,
          borderLeft: isVisible ? `3px solid ${color}` : '3px solid transparent',
          borderRight: isVisible ? `3px solid ${color}` : '3px solid transparent',
          padding: '0 4px',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <span
      ref={elementRef}
      className={className}
      style={getStyles()}
    >
      {children}
    </span>
  );
};

export const RoughNotationGroup: React.FC<RoughNotationGroupProps> = ({
  show = true,
  children
}) => {
  if (!show) {
    return <>{children}</>;
  }

  return <>{children}</>;
}; 