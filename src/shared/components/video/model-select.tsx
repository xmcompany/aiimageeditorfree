'use client'

import { Bot, Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { MODEL_CONFIGS } from '@/config/model-config'

interface ModelSelectProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  className?: string
  variant?: 'default' | 'transparent'
}

export default function ModelSelect({
  selectedModel,
  onModelChange,
  className,
  variant = 'default',
}: ModelSelectProps) {
  const t = useTranslations('video.hero_input.models');
  // Get models from MODEL_CONFIGS
  const models = Object.values(MODEL_CONFIGS)

  // Create SVG icon component for video models
  const VideoModelIcon = ({
    iconSrc,
    iconName,
  }: {
    iconSrc: string
    iconName: string
  }) => (
    <img
      src={iconSrc}
      alt={iconName}
      className="h-4"
      onError={(e) => {
        // Fallback to a simple colored circle if SVG fails to load
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        const fallback = target.nextElementSibling as HTMLElement
        if (fallback) fallback.style.display = 'flex'
      }}
    />
  )

  const FallbackIcon = ({ iconName }: { iconName: string }) => (
    <div
      className="w-4 h-4 rounded-sm bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold"
      style={{ display: 'none' }}
    >
      {iconName.charAt(0).toUpperCase()}
    </div>
  )

  const MODEL_ICONS: Record<string, React.ReactNode> = models.reduce(
    (acc, model) => {
      acc[model.id] = (
        <div key={model.id} className="relative w-4 h-4">
          <VideoModelIcon iconSrc={model.img} iconName={model.name} />
          <FallbackIcon iconName={model.name} />
        </div>
      )
      return acc
    },
    {} as Record<string, React.ReactNode>
  )

  const buttonStyles = {
    default:
      'flex items-center gap-2 h-10 px-3 text-sm rounded-full hover:bg-accent focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-primary border shadow-sm',
    transparent:
      'flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-full text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-primary border border-zinc-200 dark:border-zinc-800 transition-all shadow-sm',
  }

  const dropdownStyles = {
    default: cn('min-w-[12rem]', 'border backdrop-blur-xl'),
    transparent: cn(
      'min-w-[12rem]',
      'border backdrop-blur-xl',
      'bg-popover'
    ),
  }

  const itemStyles = {
    default: 'flex items-center justify-between gap-2 focus:bg-accent cursor-pointer rounded-lg mx-1',
    transparent:
      'flex items-center justify-between gap-2 text-foreground focus:bg-accent cursor-pointer py-2 px-3 rounded-lg mx-1',
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(buttonStyles[variant], className)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedModel}
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 5,
              }}
              transition={{
                duration: 0.15,
              }}
              className="flex items-center gap-2"
            >
              {MODEL_ICONS[selectedModel]}
              {t(selectedModel)}
              <ChevronDown className="w-4 h-4 opacity-70" />
            </motion.div>
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={dropdownStyles[variant]} align="start" sideOffset={8}>
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onSelect={() => onModelChange(model.id)}
            className={itemStyles[variant]}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 flex items-center justify-center">
                 {MODEL_ICONS[model.id] || <Bot className="w-4 h-4 opacity-50" />}
              </div>
              <span className="text-sm font-medium">{t(model.id)}</span>
            </div>
            {selectedModel === model.id && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
