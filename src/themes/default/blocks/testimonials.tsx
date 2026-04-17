'use client'

import { motion } from 'motion/react'
import { TestimonialsColumn } from './testimonial-column'
import { SmartIcon } from '@/shared/blocks/common/smart-icon'
import { Section as SectionType } from '@/shared/types/blocks/landing'
import { Badge } from '@/shared/components/ui/badge'
import { cn } from '@/shared/lib/utils'

export function Testimonials({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null
  }

  // Transform section items to testimonial format
  const testimonials =
    section.items?.map((item) => ({
      text: item.description || '',
      image: item.image?.src || '',
      name: item.title || '',
      role: item.label || '',
    })) || []

  if (testimonials.length === 0) return null;

  // Split testimonials into three columns
  const firstColumn = testimonials.slice(0, Math.ceil(testimonials.length / 3))
  const secondColumn = testimonials.slice(
    Math.ceil(testimonials.length / 3),
    Math.ceil((testimonials.length * 2) / 3)
  )
  const thirdColumn = testimonials.slice(
    Math.ceil((testimonials.length * 2) / 3)
  )

  return (
    <section
      id={section.id}
      className={cn('py-20 relative overflow-hidden bg-background text-foreground', section.className)}
    >
      <div className="container z-10 mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          {section.label && (
            <Badge className="px-4 py-1 shadow-sm gap-1.5" variant="accent">
              {section.icon && <SmartIcon name={section.icon as string} size={14} />}
              {section.label}
            </Badge>
          )}

          <h2 className="text-4xl font-serif font-extrabold tracking-tight mt-6 text-center lg:text-5xl">
            {section.title}
          </h2>
          <p className="text-center mt-6 text-lg text-muted-foreground opacity-90 leading-relaxed max-w-2xl mx-auto">
            {section.description}
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  )
}
