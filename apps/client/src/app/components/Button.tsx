import { classNames } from '../utils/classNames';
import { forwardRef, useMemo } from 'react';
import { Spinner } from './Spinner';

const Variants = {
  primary:
    'border-transparent text-white bg-indigo-600 hover:bg-indigo-700 text-white bg-indigo-600 hover:bg-indigo-700',
  white:
    'bg-white dark:bg-gray-700 text-gray-600 dark:text-white border border-gray-200 dark:border-gray-800 hover:bg-gray-50 focus:ring dark:hover:bg-gray-600',
  text: 'bg-white dark:bg-gray-700 text-gray-600 dark:text-white hover:bg-gray-50 focus:ring dark:hover:bg-gray-600',
};

const Sizes = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-sm',
  xl: 'px-4 py-2 text-base',
  '2xl': 'px-6 py-3 text-base',
};

export type LinkButton = {
  as?: 'a';
} & Omit<JSX.IntrinsicElements['a'], 'ref'>;

export type ButtonButton = {
  as?: 'button';
} & Omit<JSX.IntrinsicElements['button'], 'ref'>;

export type ButtonProps = {
  variant?: keyof typeof Variants;
  size?: keyof typeof Sizes;
  as?: 'button' | 'link';
  isLoading?: boolean;
} & (LinkButton | ButtonButton);

export const Button = forwardRef<any, ButtonProps>(
  (
    {
      as = 'button',
      size = 'md',
      variant = 'primary',
      isLoading = false,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const classes = classNames(
      className,
      'inline-flex items-center border font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
      Sizes[size],
      Variants[variant],
    );

    const buildChildren = useMemo(() => {
      const result = [children];

      if (isLoading) {
        result.push(
          <div className="ml-2">
            <Spinner className="w-3 h-3" />
          </div>,
        );
      }
      return result;
    }, [children, isLoading]);

    if (as === 'button') {
      return (
        <button className={classes} ref={ref} {...(rest as any)}>
          {buildChildren}
        </button>
      );
    }

    return (
      <a className={classes} ref={ref} {...(rest as any)}>
        {buildChildren}
      </a>
    );
  },
);
