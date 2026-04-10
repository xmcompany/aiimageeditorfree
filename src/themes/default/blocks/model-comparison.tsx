'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

function renderValue(value: any) {
  if (value === true || value === 'true' || value === '✓')
    return <Check className="mx-auto h-4 w-4 text-green-500" />;
  if (value === false || value === 'false' || value === '✗')
    return <X className="mx-auto h-4 w-4 text-red-400" />;
  if (value === '-' || value === '' || value === null || value === undefined)
    return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  return <span>{String(value)}</span>;
}

export function ModelComparison({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const columns: { key: string; label: string }[] = section.columns || [];
  const rows: { label: string; values: Record<string, any> }[] =
    section.rows || [];

  if (!columns.length || !rows.length) return null;

  return (
    <section
      id={section.id || 'model-comparison'}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="container px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {section.title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {section.title}
            </h2>
          )}
          {section.description && (
            <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
              {section.description}
            </p>
          )}
        </motion.div>

        <motion.div
          className="overflow-x-auto rounded-xl border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold">Feature</th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-center font-semibold"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/30',
                    idx % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  )}
                >
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-center">
                      {renderValue(row.values?.[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
