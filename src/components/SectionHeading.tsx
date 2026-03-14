import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  label?: string;
  title: string;
  description: string;
  className?: string;
}

const SectionHeading = ({
  label,
  title,
  description,
  className,
}: SectionHeadingProps) => {
  return (
    <div className={cn('mx-auto max-w-3xl text-center', className)}>
      {label && (
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
          {label}
        </p>
      )}
      <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h2>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default SectionHeading;
