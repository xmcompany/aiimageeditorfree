'use client'

import { Badge } from '@/shared/components/ui/badge'
import { Section as SectionType } from '@/shared/types/blocks/landing'
import { cn } from '@/shared/lib/utils'

export function FAQ({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null
  }

  return (
    <section
      id={section.id || section.name}
      className={cn('py-16 relative overflow-hidden', section.className)}
    >
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          {section.label && (
            <Badge className="px-4 py-1 shadow-sm" variant="accent">
              {section.label}
            </Badge>
          )}
          <h2 className="mt-4 text-4xl font-serif font-extrabold tracking-tight md:text-5xl">{section.title}</h2>
          <p className="mt-6 text-lg text-muted-foreground opacity-90 leading-relaxed max-w-2xl mx-auto">
            {section.description}
          </p>
        </div>
        <div className="mx-auto mt-14 grid gap-8 md:grid-cols-2 lg:gap-12">
          {section.items?.map((item, index) => (
            <div key={index} className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors duration-200">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary font-mono text-xs text-primary">
                {index + 1}
              </span>
              <div>
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{item.title || item.question}</h3>
                </div>
                <p className="text-md text-muted-foreground leading-relaxed">
                  {item.description || item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
