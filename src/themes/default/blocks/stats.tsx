'use client'

import { SmartIcon } from '@/shared/blocks/common/smart-icon'
import { Badge } from '@/shared/components/ui/badge'
import { Section as SectionType } from '@/shared/types/blocks/landing'
import { cn } from '@/shared/lib/utils'

export function Stats({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null
  }

  return (
    <section id={section.id || section.name} className={cn("py-16 bg-background text-foreground", section.className)}>
      <div className="container px-4 md:px-6 flex flex-col items-center gap-4">
        {section.label && (
          <Badge className="px-4 py-1 shadow-sm" variant="accent">
            {section.icon && (
              <SmartIcon name={section.icon as string} size={16} className="mr-2" />
            )}
            {section.label}
          </Badge>
        )}
        <h2 className="text-center text-4xl font-serif font-extrabold tracking-tight lg:text-5xl">
          {section.title}
        </h2>
        <p className="text-center text-muted-foreground opacity-90 text-lg leading-relaxed max-w-2xl">
          {section.description}
        </p>
        <div className="w-full grid gap-10 md:grid-cols-3 lg:gap-12 mt-12">
          {section.items?.map((item, index) => {
            return (
              <div key={index} className="text-center group p-6 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-300">
                <p className="text-lg font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                  {item.description}
                </p>
                <p className="pt-2 text-6xl md:text-7xl font-bold lg:pt-4 text-primary tracking-tighter">
                  {item.label}
                </p>
                <p className="text-xl mt-4 font-normal">
                  {item.title}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
