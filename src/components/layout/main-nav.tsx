'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Settings, Calendar } from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();
  
  const routes = [
    {
      href: '/boards',
      label: 'Boards',
      icon: LayoutDashboard,
      active: pathname?.startsWith('/boards'),
    },
    {
      href: '/calendar',
      label: 'Calendar',
      icon: Calendar,
      active: pathname?.startsWith('/calendar'),
    },
    {
      href: '/templates',
      label: 'Templates',
      icon: FileText,
      active: pathname?.startsWith('/templates'),
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      active: pathname?.startsWith('/settings'),
    },
  ];

  return (
    <nav className="flex items-center space-x-4">
      {routes.map((route) => (
        <Link key={route.href} href={route.href}>
          <Button
            variant={route.active ? "default" : "ghost"}
            className="gap-2"
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
} 