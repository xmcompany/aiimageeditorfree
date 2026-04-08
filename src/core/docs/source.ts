// .source folder will be generated when you run `next dev`
import { createElement } from 'react';
import { docs, logs, pages, posts } from '@/.source';
import type { I18nConfig } from 'fumadocs-core/i18n';
import { loader } from 'fumadocs-core/source';
// Replace full icon object with dynamic imports or specific icons to save bundle size
import { 
  Sparkles, FileText, Layout, Book, Image, Video, Wind, Box, 
  DollarSign, CreditCard, Activity, Wand, Mail, Menu, X, 
  ChevronRight, MoreHorizontal, ChevronLeft, Search, Check, 
  ChevronDown, Circle, User, LogOut, Loader2, Sparkle,
  Coins, Settings, Layers, ShieldCheck, UserPlus, Info, AlertCircle
} from 'lucide-react';

export const i18n: I18nConfig = {
  defaultLanguage: 'en',
  languages: ['en', 'zh'],
};

const COMMON_ICONS: Record<string, any> = {
  Sparkles, FileText, Layout, Book, Image, Video, Wind, Box, 
  DollarSign, CreditCard, Activity, Wand, Mail, Menu, X, 
  ChevronRight, MoreHorizontal, ChevronLeft, Search, Check, 
  ChevronDown, Circle, User, LogOut, Loader2, Sparkle,
  Coins, Settings, Layers, ShieldCheck, UserPlus, Info, AlertCircle
};

const iconHelper = (iconName: string | undefined) => {
  if (!iconName) return;
  const Icon = COMMON_ICONS[iconName];
  if (Icon) return createElement(Icon);
  return;
};

// Docs source
export const docsSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n,
  icon: iconHelper,
});

// Pages source (using root path)
export const pagesSource = loader({
  baseUrl: '/',
  source: pages.toFumadocsSource(),
  i18n,
  icon: iconHelper,
});

// Posts source
export const postsSource = loader({
  baseUrl: '/blog',
  source: posts.toFumadocsSource(),
  i18n,
  icon: iconHelper,
});

// Logs source
export const logsSource = loader({
  baseUrl: '/logs',
  source: logs.toFumadocsSource(),
  i18n,
  icon: iconHelper,
});

// Keep backward compatibility
export const source = docsSource;
