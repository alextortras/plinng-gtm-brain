'use client';

import { usePathname } from 'next/navigation';

const pageTitles: Record<string, string> = {
  '/': 'Global Dashboard',
  '/leaderboards': 'Rep Leaderboards',
  '/forecasts': 'Revenue Forecasts',
  '/brain': 'Brain Insights',
  '/settings': 'Strategy Settings',
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'GTM Brain';

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Plinng Team</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          P
        </div>
      </div>
    </header>
  );
}
