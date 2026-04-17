'use client'

import { motion, Variants } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { forwardRef } from 'react'

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  textClassName?: string
  underlineClassName?: string
  underlinePath?: string
  underlineHoverPath?: string
  underlineDuration?: number
}

const AnimatedText = forwardRef<HTMLDivElement, AnimatedTextProps>(
  (
    {
      text,
      textClassName,
      underlineClassName,
      underlinePath = 'M 0,10 Q 75,0 150,10 Q 225,20 300,10',
      underlineHoverPath = 'M 0,10 Q 75,20 150,10 Q 225,0 300,10',
      underlineDuration = 1.5,
      ...props
    },
    ref
  ) => {
    const pathVariants: Variants = {
      hidden: {
        pathLength: 0,
        opacity: 0,
      },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: underlineDuration,
          ease: 'easeInOut',
        },
      },
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-2',
          props.className
        )}
      >
        <div className="relative">
          <motion.h2
            className={cn('text-4xl font-bold text-center', textClassName)}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            {text}
          </motion.h2>

          <motion.svg
            width="100%"
            height="20"
            viewBox="0 0 300 20"
            className={cn('absolute -bottom-4 left-0', underlineClassName)}
          >
            <motion.path
              d={underlinePath}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                d: underlineHoverPath,
                transition: { duration: 0.8 },
              }}
            />
          </motion.svg>
        </div>
      </div>
    )
  }
)

AnimatedText.displayName = 'AnimatedText'

interface ShowcaseHeaderProps {
  title: string
  description: string
}

export function ShowcaseHeader({ title, description }: ShowcaseHeaderProps) {
  return (
    <div className="mx-auto mb-16 text-center">
      <AnimatedText
        text={title}
        textClassName="mb-6 text-pretty text-3xl font-bold lg:text-4xl"
        className="mb-6"
      />
      <div
        className="mb-4 max-w-xl text-muted-foreground lg:max-w-none lg:text-lg"
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </div>
  )
}
