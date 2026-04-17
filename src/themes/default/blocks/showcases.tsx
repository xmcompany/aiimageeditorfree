'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'motion/react';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function Showcases({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const t = useTranslations('common.showcase');
  const groups = (section as any).groups || [];
  const [selectedGroup, setSelectedGroup] = useState<string>(
    groups.length > 0 ? groups[0].name : ''
  );

  const filteredItems = useMemo(() => {
    if (!section.items) return [];
    if (!selectedGroup || !groups.length) return section.items;
    if (selectedGroup === 'all') return section.items;
    return section.items.filter((item) => item.group === selectedGroup);
  }, [section.items, selectedGroup, groups.length]);

  return (
    <section
      id={section.id || section.name}
      className={cn('py-24 md:py-36', section.className, className)}
    >
      <motion.div
        className="container mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
      >
        {section.sr_only_title && (
          <h1 className="sr-only">{section.sr_only_title}</h1>
        )}
        <h2 className="mx-auto mb-6 max-w-full text-4xl font-serif font-extrabold tracking-tight text-pretty md:max-w-5xl lg:text-6xl">
          {section.title}
        </h2>
        <p className="text-muted-foreground text-md mx-auto mb-4 max-w-full md:max-w-5xl">
          {section.description}
        </p>
      </motion.div>

      {groups.length > 0 && (
        <motion.div
          className="container mb-12 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          {groups.map(
            (group: { name: string; title: string }, index: number) => {
              const isSelected = selectedGroup === group.name;
              return (
                <motion.button
                  key={group.name}
                  onClick={() => setSelectedGroup(group.name)}
                  className={cn(
                    'relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                    isSelected
                      ? ''
                      : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground border'
                  )}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2 + index * 0.1,
                    ease: [0.22, 1, 0.36, 1] as const,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSelected ? (
                    <>
                      <span className="bg-primary absolute inset-0 rounded-lg p-[2px]">
                        <span className="bg-background block h-full w-full rounded-[calc(0.5rem-2px)]" />
                      </span>
                      <span className="bg-primary relative z-10 bg-clip-text text-transparent">
                        {group.title}
                      </span>
                    </>
                  ) : (
                    <span>{group.title}</span>
                  )}
                </motion.button>
              );
            }
          )}
        </motion.div>
      )}

      <div className="container grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const hasButton = !!(item as any).button;
            const cardContent = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1] as const,
                }}
              >
                <Card className="rounded-[var(--radius)] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-primary/5">
                  <CardContent className="p-0">
                    <motion.div
                      className="relative aspect-16/10 w-full overflow-hidden"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Image
                        src={item.image?.src ?? ''}
                        alt={item.image?.alt ?? ''}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        fill
                        className="object-cover transition-transform duration-500"
                      />
                    </motion.div>
                    <div className="p-6">
                      <h3 className="mb-3 line-clamp-1 text-xl font-bold tracking-tight">
                        {item.title || item.prompt}
                      </h3>
                      <p
                        className="text-muted-foreground line-clamp-2 text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: item.description ?? '',
                        }}
                      />
                      {hasButton && (
                        <div className="mt-6">
                          <Button
                            asChild
                            variant={(item as any).button.variant || 'default'}
                            size="lg"
                            className="w-full rounded-[var(--radius)] font-bold transition-all hover:scale-[1.02]"
                          >
                            <Link
                              href={(item as any).button.url || ''}
                              target={(item as any).button.target || '_self'}
                            >
                              {(item as any).button.icon && (
                                <SmartIcon
                                  name={(item as any).button.icon as string}
                                  className="mr-2"
                                />
                              )}
                              {(item as any).button.title}
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );

            return hasButton ? (
              <div key={index}>{cardContent}</div>
            ) : (
              <Link key={index} href={item.url || ''} target={item.target}>
                {cardContent}
              </Link>
            );
          })
        ) : (
          <motion.div
            className="text-muted-foreground col-span-full text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {t('no_items')}
          </motion.div>
        )}
      </div>
    </section>
  );
}
