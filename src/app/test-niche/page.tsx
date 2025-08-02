'use client';

import { Metadata } from 'next'
import { generateMetadata } from '@/lib/metadata'
import { NewCreatorJournal } from '@/components/app/NewCreatorJournal';

export const metadata: Metadata = generateMetadata({
  title: 'Test Niche - Tango CRM',
  description: 'Test page for Tango CRM niche functionality and creator journal components. Internal testing page for the creator CRM platform.',
  keywords: [
    'Tango CRM test niche',
    'creator CRM testing',
    'CRM platform test',
    'Tango CRM niche test',
    'creator business test',
    'CRM platform testing',
    'Tango CRM development'
  ],
  image: '/test-niche-og-image.jpg'
})

export default function TestNichePage() {
  return (
    <div className="h-screen">
      <NewCreatorJournal />
    </div>
  );
} 