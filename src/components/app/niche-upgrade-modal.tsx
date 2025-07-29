"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Video, GraduationCap, Mic, Briefcase, Zap, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe';

interface NicheUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNiche: string;
  hasCorePlan?: boolean;
}

interface Niche {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  price: number;
  features: string[];
  description: string;
}

const NICHE_DATA: Niche[] = [
  {
    id: 'creator',
    name: 'Creator',
    label: 'Content Creator',
    icon: <Video size={24} />,
    color: '#8b5cf6',
    price: 9.99,
    description: 'Perfect for content creators and influencers',
    features: [
      'Content planning & scheduling',
      'Brand collaboration tracking',
      'Audience engagement metrics',
      'Calendar and Task Management'
    ]
  },
  {
    id: 'coach',
    name: 'Coach',
    label: 'Online Coach',
    icon: <GraduationCap size={24} />,
    color: '#10b981',
    price: 9.99,
    description: 'Perfect for coaches, consultants, and educators',
    features: [
      'Client progress tracking',
      'Session scheduling & reminders',
      'Program & course management',
      'Calendar and Task Management'
    ]
  },
  {
    id: 'podcaster',
    name: 'Podcaster',
    label: 'Podcast Host',
    icon: <Mic size={24} />,
    color: '#f97316',
    price: 9.99,
    description: 'Built for podcasters and audio content creators',
    features: [
      'Episode planning & scheduling',
      'Guest management system',
      'Sponsorship tracking',
      'Content calendar',
      'Calendar and Task Management'
    ]
  },
  {
    id: 'freelancer',
    name: 'Freelancer',
            label: 'Freelancer/Consultant',
    icon: <Briefcase size={24} />,
    color: '#3b82f6',
    price: 9.99,
    description: 'Designed for freelancers and consultants',
    features: [
      'Project management',
      'Client relationship management',
      'Calendar and Task Management'
    ]
  }
];

export const NicheUpgradeModal: React.FC<NicheUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentNiche,
  hasCorePlan = true
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const availableNiches = NICHE_DATA.filter(niche => niche.id !== currentNiche);

  const handleUpgrade = () => {
    if (selectedNiche) {
      // Store the selected niche in sessionStorage so we can retrieve it after payment
      sessionStorage.setItem('pendingNicheUpgrade', selectedNiche);
      
      // Use the appropriate payment link based on billing cycle
      const monthlyPaymentLink = 'https://buy.stripe.com/14A28s5l0dqzgZG0XO2Nq02';
      const yearlyPaymentLink = 'https://buy.stripe.com/4gM6oIdRw9aj24Mayo2Nq04';
      
      const addNichePaymentLink = billingCycle === 'yearly' ? yearlyPaymentLink : monthlyPaymentLink;
      
      // Open in same window to avoid getting stuck
      window.location.href = addNichePaymentLink;
      onClose();
    }
  };

  const getSelectedNichePrice = () => {
    if (!selectedNiche) return 0;
    const niche = NICHE_DATA.find(n => n.id === selectedNiche);
    if (!niche) return 0;
    
    if (billingCycle === 'monthly') {
      return niche.price;
    } else {
      return niche.price * 12 * 0.8; // 20% off yearly
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {hasCorePlan ? 'Add More Niches' : 'Get Tango Core First'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {hasCorePlan 
                    ? 'Unlock additional business types and features'
                    : 'You need the Tango Core plan before adding additional niches'
                  }
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!hasCorePlan ? (
                // Show message for users without core plan
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">💜</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Start with Tango Core
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You need to complete onboarding and get the Tango Core plan before you can add additional business types.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        onClose();
                        window.location.href = '/onboarding';
                      }}
                      className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white"
                    >
                      Go to Onboarding
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // Show niche selection for users with core plan
                <>
              {/* Billing cycle toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                    billingCycle === 'yearly'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  Yearly
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Save 20%
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableNiches.map((niche) => (
                  <Card
                    key={niche.id}
                    className={`relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedNiche === niche.id 
                        ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedNiche(niche.id)}
                  >
                    {selectedNiche === niche.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check size={12} className="text-white" />
                      </motion.div>
                    )}

                    {/* Niche Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${niche.color}20`, color: niche.color }}
                      >
                        {niche.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{niche.name}</h3>
                        <p className="text-sm text-gray-600">{niche.label}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">{niche.description}</p>

                    {/* Price */}
                    <div className="mb-4">
                      {billingCycle === 'monthly' ? (
                        <div>
                          <span className="text-2xl font-bold text-gray-900">${niche.price}</span>
                          <span className="text-gray-600">/month</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg line-through text-gray-400">
                              ${(niche.price * 12).toFixed(2)}
                            </span>
                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                              Save ${(niche.price * 12 * 0.2).toFixed(2)}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              ${(niche.price * 12 * 0.8).toFixed(2)}
                            </span>
                            <span className="text-gray-600">/year</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Includes:</h4>
                      {niche.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check size={14} className="text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Benefits Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-purple-600" />
                  Why Add More Niches?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Diversify Your Business</h4>
                      <p className="text-sm text-gray-600">Manage multiple business types from one platform</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <BarChart3 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Advanced Analytics</h4>
                      <p className="text-sm text-gray-600">Get insights across all your business types</p>
                    </div>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="text-sm text-gray-600">
                {selectedNiche ? (
                  <div>
                    <div>Selected: <strong>{NICHE_DATA.find(n => n.id === selectedNiche)?.name}</strong></div>
                    <div className="text-emerald-600 font-medium">
                      ${getSelectedNichePrice().toFixed(2)}/{billingCycle === 'monthly' ? 'month' : 'year'}
                      {billingCycle === 'yearly' && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Save ${(NICHE_DATA.find(n => n.id === selectedNiche)?.price! * 12 * 0.2).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span>Choose a niche to upgrade</span>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpgrade}
                  disabled={!selectedNiche}
                  className="bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700"
                >
                  Upgrade to {selectedNiche ? NICHE_DATA.find(n => n.id === selectedNiche)?.name : 'Niche'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 