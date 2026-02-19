import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  previousValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  previousValue,
  trend,
  trendValue,
  className,
}: KpiCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        <p className="mt-1.5 text-2xl font-bold truncate">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
        {trendValue && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-urgency-low',
                trend === 'down' && 'text-urgency-high',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend === 'up' && '\u2191 '}
              {trend === 'down' && '\u2193 '}
              {trendValue}
            </span>
            {previousValue && (
              <span className="text-xs text-muted-foreground">
                from {previousValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
