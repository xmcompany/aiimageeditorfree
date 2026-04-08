import { createElement } from 'react';
import { docs } from '@/.source';
import type { I18nConfig } from 'fumadocs-core/i18n';
import { createFromSource } from 'fumadocs-core/search/server';
import { 
  Sparkles, FileText, Layout, Book, Image, Video, Wind, Box, 
  DollarSign, CreditCard, Activity, Wand, Mail, Menu, X, 
  ChevronRight, MoreHorizontal, ChevronLeft, Search, Check, 
  ChevronDown, Circle, User, LogOut, Loader2, Sparkle,
  Coins, Settings, Layers, ShieldCheck, UserPlus, Info, AlertCircle
} from 'lucide-react';
import { loader } from 'fumadocs-core/source';

import { source as originalSource } from '@/core/docs/source';

// Create a modified i18n config that maps 'zh' to 'en' for Orama
const searchI18n: I18nConfig = {
  defaultLanguage: 'en',
  languages: ['en'], // Only use 'en' for search to avoid Orama language errors
};

const COMMON_ICONS: Record<string, any> = {
  Sparkles, FileText, Layout, Book, Image, Video, Wind, Box, 
  DollarSign, CreditCard, Activity, Wand, Mail, Menu, X, 
  ChevronRight, MoreHorizontal, ChevronLeft, Search, Check, 
  ChevronDown, Circle, User, LogOut, Loader2, Sparkle,
  Coins, Settings, Layers, ShieldCheck, UserPlus, Info, AlertCircle
};

// Create a separate source instance for search with only English language
const searchSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  i18n: searchI18n,
  icon(icon) {
    if (!icon) {
      return;
    }
    const Icon = COMMON_ICONS[icon];
    if (Icon) return createElement(Icon);
    return;
  },
});

export const { GET } = createFromSource(searchSource, {
  language: 'english',
});
