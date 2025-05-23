declare module 'clsx' {
  export type ClassValue = string | number | ClassDictionary | ClassArray | undefined | null | false;
  interface ClassDictionary {
    [id: string]: boolean | undefined | null;
  }
  interface ClassArray extends Array<ClassValue> {}
  export default function clsx(...inputs: ClassValue[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
}

declare module '@radix-ui/react-slot' {
  import * as React from 'react';
  export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
  }
  export const Slot: React.ForwardRefExoticComponent<SlotProps & React.RefAttributes<HTMLElement>>;
}

declare module '@radix-ui/react-label' {
  import * as React from 'react';
  export interface LabelProps extends React.ComponentPropsWithoutRef<'label'> {}
  export const Root: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
}

declare module '@radix-ui/react-radio-group' {
  import * as React from 'react';
  export interface RadioGroupProps extends React.ComponentPropsWithoutRef<'div'> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  }
  export const Root: React.ForwardRefExoticComponent<RadioGroupProps & React.RefAttributes<HTMLDivElement>>;
  export const Item: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'button'> & React.RefAttributes<HTMLButtonElement>>;
  export const Indicator: React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'span'> & React.RefAttributes<HTMLSpanElement>>;
}

declare module 'class-variance-authority' {
  import { ClassValue } from 'clsx';
  
  export type VariantProps<Component extends (...args: any) => any> = Parameters<Component>[0];
  
  export interface VariantConfig {
    variants?: Record<string, Record<string, string>>;
    defaultVariants?: Record<string, string>;
  }
  
  export function cva(base: string, config?: VariantConfig): (props?: Record<string, any>) => string;
} 