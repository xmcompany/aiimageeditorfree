'use client';
import { ComponentType, lazy, Suspense } from 'react';

const iconCache: { [key: string]: ComponentType<any> } = {};

type IconLibrary = 'ri' | 'lu' | 'hi' | 'io' | 'go' | 'lucide';

// Function to automatically detect icon library
function detectIconLibrary(name: string): IconLibrary {
  if (!name) return 'lucide';
  if (name.startsWith('Ri')) return 'ri';
  if (name.startsWith('Lu')) return 'lu';
  if (name.startsWith('Hi')) return 'hi';
  if (name.startsWith('Io')) return 'io';
  if (name.startsWith('Go')) return 'go';

  return 'lucide';
}

export function SmartIcon({
  name,
  size = 24,
  className,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  [key: string]: any;
}) {
  const library = detectIconLibrary(name);
  const cacheKey = `${library}-${name}`;

  if (!iconCache[cacheKey]) {
    iconCache[cacheKey] = lazy(async () => {
      try {
        if (typeof window === 'undefined') {
          return { default: (() => <div style={{ width: size, height: size }} className={className} />) as ComponentType<any> };
        }

        let module: any;
        let IconComponent: any;
        let fallbackIcon: any;

        switch (library) {
          case 'ri':
            module = await import('react-icons/ri');
            IconComponent = module[name];
            fallbackIcon = module.RiQuestionLine;
            break;
          case 'lu':
            module = await import('react-icons/lu');
            IconComponent = module[name];
            fallbackIcon = module.LuHelpCircle;
            break;
          case 'hi':
            module = await import('react-icons/hi2');
            IconComponent = module[name];
            fallbackIcon = module.HiQuestionMarkCircle;
            break;
          case 'io':
            module = await import('react-icons/io5');
            IconComponent = module[name];
            fallbackIcon = module.IoHelpCircle;
            break;
          case 'go':
            module = await import('react-icons/go');
            IconComponent = module[name];
            fallbackIcon = module.GoQuestion;
            break;
          default:
            module = await import('lucide-react');
            IconComponent = module[name as keyof typeof module];
            fallbackIcon = module.HelpCircle;
        }

        if (IconComponent) {
          return { default: IconComponent as ComponentType<any> };
        } else {
          console.warn(`Icon "${name}" not found in ${library}, using fallback`);
          return { default: fallbackIcon as ComponentType<any> };
        }
      } catch (error) {
        console.error(`Failed to load icon library for "${name}":`, error);
        // Minimal fallback to avoid crash
        return {
          default: () => (
            <div
              style={{ width: size, height: size }}
              className={className}
            />
          ),
        };
      }
    });
  }

  const IconComponent = iconCache[cacheKey];

  return (
    <Suspense fallback={<div style={{ width: size, height: size }} className={className} />}>
      <IconComponent size={size} className={className} {...props} />
    </Suspense>
  );
}
