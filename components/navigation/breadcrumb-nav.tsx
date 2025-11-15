'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  currentPage?: string;
}

export function BreadcrumbNav({ items, currentPage }: BreadcrumbNavProps) {
  return (
    <div className="flex items-center space-x-2 text-sm">
      {/* Back button */}
      {items.length > 0 && (
        <Link href={items[items.length - 1].href}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
      )}
      
      {/* Breadcrumb trail */}
      <div className="hidden md:flex items-center space-x-2 text-gray-500">
        {items.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link 
              href={item.href}
              className="flex items-center space-x-1 hover:text-gray-900 transition-colors"
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </React.Fragment>
        ))}
        {currentPage && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{currentPage}</span>
          </>
        )}
      </div>
    </div>
  );
}

// Quick navigation component for role dashboards
interface QuickNavProps {
  backTo: {
    label: string;
    href: string;
  };
  showHome?: boolean;
}

export function QuickNav({ backTo, showHome = true }: QuickNavProps) {
  return (
    <div className="flex items-center space-x-2">
      <Link href={backTo.href}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backTo.label}
        </Button>
      </Link>
      
      {showHome && (
        <>
          <span className="text-gray-300">|</span>
          <Link href="/capitallab/collaborative">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Hub
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
