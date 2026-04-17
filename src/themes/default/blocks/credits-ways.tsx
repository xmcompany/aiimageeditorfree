import { Gift, CalendarCheck, Users, ArrowRight } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';
import { Section } from '@/shared/types/blocks/landing';
import { cn } from '@/shared/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  Gift: <Gift className="h-6 w-6" />,
  CalendarCheck: <CalendarCheck className="h-6 w-6" />,
  Users: <Users className="h-6 w-6" />,
};

export function CreditsWays({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const items: any[] = (section as any).items || [];
  const initialCreditsAmount: number = (section as any).initialCreditsAmount || 0;

  // Dynamically patch the first item's description with actual credits amount
  const patchedItems = items.map((item, idx) => {
    if (idx === 0 && initialCreditsAmount > 0) {
      return {
        ...item,
        description: `Create a free account and receive ${initialCreditsAmount} bonus credits instantly. No credit card required. Start generating AI videos right away.`,
      };
    }
    return item;
  });

  return (
    <section id={section.id} className={cn('py-16 md:py-24', className)}>
      <div className="container px-4">
        <div className="mb-12 text-center">
          {section.title && (
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              {section.title}
            </h2>
          )}
          {section.description && (
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              {section.description}{' '}
              <Link
                href="/blog/how-to-create-ai-videos-for-free"
                className="text-primary underline underline-offset-2 hover:opacity-80 font-medium whitespace-nowrap"
              >
                Learn more →
              </Link>
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {patchedItems.map((item, idx) => (
            <div
              key={idx}
              className="relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Icon + subtitle */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {ICON_MAP[item.icon] || <Gift className="h-6 w-6" />}
                </div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {item.subtitle}
                </span>
              </div>

              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {item.description}
              </p>

              {item.url && item.cta && (
                <Link
                  href={item.url}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {item.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}

              {/* Step number */}
              <div className="absolute top-4 right-4 text-5xl font-black text-muted/20 select-none leading-none">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
