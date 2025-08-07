"use client";

import { PricingTable as ClerkPricingTable } from '@clerk/nextjs';

/**
 * Simple wrapper around Clerk's PricingTable component
 * This can be used throughout the application where billing/pricing is needed
 */
export const PricingTable = () => {
  return <ClerkPricingTable />;
};

export default PricingTable;