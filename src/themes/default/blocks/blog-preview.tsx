import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { Section } from '@/shared/types/blocks/landing';
import { Post as PostType } from '@/shared/types/blocks/blog';
import { cn } from '@/shared/lib/utils';

export function BlogPreview({
  section,
  posts,
  className,
}: {
  section: Section;
  posts?: PostType[];
  className?: string;
}) {
  const items = posts || (section as any).posts || [];

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section id={section.id} className={cn('py-16 md:py-24', className)}>
      <div className="container px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            {section.title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="text-muted-foreground mt-2 max-w-xl text-lg">
                {section.description}
              </p>
            )}
          </div>
          <Link
            href="/blog"
            className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            View All Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Post Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post: PostType, idx: number) => (
            <Link
              key={idx}
              href={post.url || `/blog/${post.slug}`}
              className="group block"
            >
              <div className="bg-card h-full overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
                {post.image && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  {post.created_at && (
                    <p className="text-muted-foreground mb-2 text-xs">
                      {post.created_at}
                    </p>
                  )}
                  <h3 className="group-hover:text-primary mb-2 text-lg font-bold leading-snug transition-colors">
                    {post.title}
                  </h3>
                  {post.description && (
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                      {post.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
