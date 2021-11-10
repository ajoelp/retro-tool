import { Children, isValidElement, ReactElement, ReactNode } from 'react';

export function getValidChildren(children: React.ReactNode) {
  return Children.toArray(children).filter((child) =>
    isValidElement(child),
  ) as ReactElement[];
}

const Sizes = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-14 w-14',
};

type AvatarProps = {
  className?: string;
  size?: keyof typeof Sizes;
  src: string;
  alt?: string;
};

export function Avatar({ size = 'md', src, className, alt = '' }: AvatarProps) {
  return (
    <img
      src={src}
      className={`inline-block rounded-full ${Sizes[size]} ${className} ring-1 ring-white`}
      alt={alt}
    />
  );
}

type AvatarGroupProps = {
  children: ReactNode;
  max?: number;
};

export function AvatarGroup({ children, max }: AvatarGroupProps) {
  const validChildren = getValidChildren(children);
  const maxChildren = max ? validChildren.slice(0, max) : validChildren;
  return <div className="flex -space-x-1 overflow-hidden">{maxChildren}</div>;
}
