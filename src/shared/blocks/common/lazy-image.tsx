'use client';

import { LazyLoadImage } from 'react-lazy-load-image-component';

import { cn } from '@/shared/lib/utils';

import 'react-lazy-load-image-component/src/effects/blur.css';

export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  placeholderSrc,
  title,
  fill,
  priority,
  sizes,
  style,
  wrapperClassName,
  wrapperStyle,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholderSrc?: string;
  title?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  [key: string]: any;
}) {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      effect="blur"
      placeholderSrc={placeholderSrc}
      className={cn('block', className)}
      style={style}
      wrapperClassName={cn('w-full h-full block', wrapperClassName)}
      wrapperProps={{
        style: wrapperStyle || { display: 'block', width: '100%', height: '100%' },
      }}
      {...props}
    />
  );
}
