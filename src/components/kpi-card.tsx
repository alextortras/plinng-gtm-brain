import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  className,
}: KpiCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
        {(subtitle || trendValue) && (
          <div className="mt-1 flex items-center gap-2">
            {trendValue && (
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-urgency-low',
                  trend === 'down' && 'text-urgency-high',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '\u2191'}
                {trend === 'down' && '\u2193'}
                {trendValue}
              </span>
            )}
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
