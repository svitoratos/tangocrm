"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Video, 
  GraduationCap, 
  Mic, 
  Briefcase, 
  Target, 
  Upload, 
  Settings, 
  Link as LinkIcon, 
  Users,
  HelpCircle,
  ChevronLeft,
  Check
} from "lucide-react";
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe';


interface OnboardingProps {
  userName?: string;
  onComplete?: (data: {
    roles: string[];
    goals: string[];
    setupTask?: string;
  }) => void;
}

type Step = 1 | 2 | 3 | 4;

const roleOptions = [
  { 
    id: "content-creator", 
    label: "Content Creator", 
    icon: Video,
    description: "Organize your content, track deals, and grow your creative business — all in one place.",
    perfectFor: ["YouTube, TikTok & Instagram growth", "Brand sponsorships & collabs", "Managing content calendars", "Tracking revenue from partnerships"]
  },
  { 
    id: "coach", 
    label: "Coach", 
    icon: GraduationCap,
    description: "Streamline your programs, track clients, and grow your impact with ease.",
    perfectFor: ["1:1 coaching sessions", "Group programs & masterminds", "Client communication tracking", "Speaking engagements & workshops", "Revenue and progress tracking"]
  },
  { 
    id: "podcaster", 
    label: "Podcaster", 
    icon: Mic,
    description: "Manage sponsorships, track episodes, and grow your show like a pro.",
    perfectFor: ["Sponsorship and brand deals", "Episode planning and tracking", "Premium content & subscriptions", "Tracking deliverables and revenue"]
  },
  { 
    id: "freelancer", 
    label: "Freelancer", 
    icon: Briefcase,
    description: "Keep client work organized and scale your solo business with confidence.",
    perfectFor: ["Client and project tracking", "Calendar management", "Deliverables and due dates", "Revenue tracking"]
  },
];

// Niche-specific goals
const NICHE_GOALS = {
  "content-creator": [
    { id: "brand-partnerships", label: "Manage my brand partnerships and sponsorships" },
    { id: "content-pipeline", label: "Organize my content pipeline and calendar" },
    { id: "revenue-tracking", label: "Track revenue from sponsored content and deals" },
    { id: "audience-growth", label: "Grow my audience across platforms" },
    { id: "collaboration-tracking", label: "Manage collaborations and partnerships" },
  ],
  "coach": [
    { id: "client-tracking", label: "Track client progress and coaching sessions" },
    { id: "program-management", label: "Manage my coaching programs and masterminds" },
    { id: "communication-tracking", label: "Track client communications and notes" },
    { id: "revenue-tracking", label: "Track revenue from coaching packages" },
    { id: "speaking-engagements", label: "Manage speaking engagements and workshops" },
  ],
  "podcaster": [
    { id: "sponsorship-management", label: "Manage podcast sponsorships and brand deals" },
    { id: "episode-tracking", label: "Track episodes and release schedules" },
    { id: "premium-content", label: "Manage premium content and subscriptions" },
    { id: "deliverables-tracking", label: "Track deliverables and sponsor requirements" },
    { id: "revenue-tracking", label: "Track revenue from podcast monetization" },
  ],
  "freelancer": [
    { id: "client-tracking", label: "Track clients and project progress" },
    { id: "proposal-management", label: "Manage proposals and contracts" },
    { id: "deliverables-tracking", label: "Track deliverables and due dates" },
    { id: "revenue-tracking", label: "Track revenue from freelance work" },
    { id: "project-management", label: "Manage project timelines and milestones" },
  ],
};

// Function to get relevant goals based on selected roles
const getRelevantGoals = (selectedRoles: string[]) => {
  const allGoals = new Map<string, { id: string; label: string }>();
  selectedRoles.forEach(role => {
    const roleGoals = NICHE_GOALS[role as keyof typeof NICHE_GOALS] || [];
    roleGoals.forEach(goal => {
      if (!allGoals.has(goal.id)) {
        allGoals.set(goal.id, goal);
      }
    });
  });
  return Array.from(allGoals.values());
};

const setupTasks = [
  { id: "pipeline-stages", label: "Set up your pipeline stages", icon: Target },
  { id: "import-contacts", label: "Import your existing contacts", icon: Upload },
  { id: "configure-workspace", label: "Configure your workspace", icon: Settings },
  { id: "connect-tools", label: "Connect your tools", icon: LinkIcon },
  { id: "invite-team", label: "Invite team members", icon: Users },
];

export const TangoOnboarding = ({ userName = "Creator", onComplete }: OnboardingProps) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedSetupTask, setSelectedSetupTask] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Set billing cycle from URL parameter if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const billingParam = urlParams.get('billing');
    if (billingParam === 'yearly' || billingParam === 'monthly') {
      setBillingCycle(billingParam);
    }
  }, []);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        // Only allow one niche selection
        return [roleId];
      }
    });
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleStartTrial = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log('Starting trial with billing cycle:', billingCycle);
      console.log('Selected roles:', selectedRoles);
      
      // Map role IDs to payment link keys
      const roleToPaymentKey: Record<string, keyof typeof STRIPE_PAYMENT_LINKS> = {
        'content-creator': 'creator',
        'coach': 'coach',
        'podcaster': 'podcaster',
        'freelancer': 'freelancer'
      };
      
      // Use the payment link for the selected niche and billing cycle
      const selectedRole = selectedRoles[0] || 'content-creator';
      const selectedNiche = roleToPaymentKey[selectedRole] || 'creator';
      const paymentLink = STRIPE_PAYMENT_LINKS[selectedNiche]?.[billingCycle];
      
      console.log('Selected role:', selectedRole);
      console.log('Mapped niche:', selectedNiche);
      console.log('Payment link:', paymentLink);
      
      if (paymentLink) {
        // Redirect to Stripe payment link
        window.location.href = paymentLink;
      } else {
        throw new Error('Payment link not available. Please contact support.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = (skipSetup = false) => {
    const data = {
      roles: selectedRoles,
      goals: selectedGoals,
      setupTask: skipSetup ? undefined : selectedSetupTask,
    };
    onComplete?.(data);
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return selectedRoles.length > 0;
      case 2:
        return selectedGoals.length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const getSelectedRoleLabels = () => {
    return selectedRoles.map(roleId => roleOptions.find(role => role.id === roleId)?.label || "").join(", ");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png" 
              alt="Tango Logo" 
              width={140} 
              height={112}
              className="object-contain cursor-pointer"
              style={{ height: 'auto' }}
            />
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Back to Landing Page Button */}
          <Link href="/" className="flex items-center space-x-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Landing</span>
          </Link>
          
          {/* Progress Dots */}
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors ${
                  step === currentStep
                    ? "bg-emerald-500"
                    : step < currentStep
                    ? "bg-emerald-300"
                    : "bg-stone-300"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className={`flex-1 ${currentStep === 4 ? 'flex justify-center' : 'flex'}`}>
        {/* Left Side - Form */}
        <div className={`${currentStep === 4 ? 'w-full max-w-4xl' : 'w-3/5'} p-8 flex flex-col`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-6">
                      What best describes your business?
                    </h1>
                    <p className="text-slate-600 text-lg">
                      Choose 1 niche to start — you can add more after signing up
                    </p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6 max-w-xl mx-auto">
                    <p className="text-sm font-semibold text-emerald-800 mb-3 text-center">
                      Start your Tango journey
                    </p>
                    <p className="text-sm text-emerald-700 mb-1 text-center">
                      Choose 1 niche to start — you can upgrade and add more after signing up.
                    </p>
                    <p className="text-sm text-emerald-700 text-center">
                      $39.99/month for your first niche $9.99/month for each additional niche
                    </p>
                    <p className="text-xs text-slate-500 text-center mt-3">
                      No setup fees · Cancel anytime · Billed immediately
                    </p>
                  </div>

                  {/* Selection Counter */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-slate-600">
                      {selectedRoles.length === 0 ? 'No niche selected' : '1 niche selected'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {roleOptions.map((role) => {
                      const IconComponent = role.icon;
                      const isSelected = selectedRoles.includes(role.id);
                      const isDisabled = !isSelected && selectedRoles.length >= 1;
                      
                      return (
                        <motion.div
                          key={role.id}
                          whileHover={{ y: isDisabled ? 0 : -4 }}
                          whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                          className="h-full"
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-200 p-6 border-2 h-full flex flex-col ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-50 shadow-lg"
                                : isDisabled
                                ? "border-stone-200 bg-stone-50 opacity-50"
                                : "border-stone-200 hover:border-emerald-200 hover:shadow-md bg-white"
                            }`}
                            onClick={() => !isDisabled && handleRoleToggle(role.id)}
                          >
                            <div className="space-y-4 flex-1 flex flex-col">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-3 rounded-lg ${
                                    role.id === "content-creator" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                                    role.id === "coach" ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                                    role.id === "podcaster" ? "bg-gradient-to-r from-orange-500 to-red-500" :
                                    "bg-gradient-to-r from-blue-500 to-indigo-500"
                                  } text-white`}>
                                    <IconComponent className="w-6 h-6" />
                                  </div>
                                  <h3 className="text-xl font-semibold text-slate-800">
                                    {role.label}
                                  </h3>
                                </div>
                                {isSelected && (
                                  <Check className="w-6 h-6 text-emerald-500" />
                                )}
                              </div>
                              
                              <p className="text-slate-600 text-sm flex-1">
                                {role.description}
                              </p>
                              
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">
                                  Perfect for:
                                </p>
                                <div className="space-y-1">
                                  {role.perfectFor.map((item, index) => (
                                    <div 
                                      key={index} 
                                      className="text-xs text-slate-600 flex items-center"
                                    >
                                      <Check className="w-3 h-3 text-emerald-500 mr-2 flex-shrink-0" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">
                      What would you like to do with Tango?
                    </h1>
                    <p className="text-slate-600">
                      Select all answers below that apply to you.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {getRelevantGoals(selectedRoles).map((goal) => (
                      <Label
                        key={goal.id}
                        htmlFor={goal.id}
                        className="cursor-pointer block"
                      >
                        <Card className={`p-4 border-2 transition-all hover:border-emerald-200 ${
                          selectedGoals.includes(goal.id)
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-stone-200"
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={goal.id}
                              checked={selectedGoals.includes(goal.id)}
                              onCheckedChange={() => handleGoalToggle(goal.id)}
                            />
                            <span className="font-medium">{goal.label}</span>
                          </div>
                        </Card>
                      </Label>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">
                      Trusted by Creators Everywhere
                    </h1>
                    <p className="text-slate-600 text-lg mb-8">
                      Tango powers thousands of creative businesses — from solo freelancers to full-time content teams.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Used by creators */}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 mb-3">✅ Used by creators from:</p>
                      <p className="text-sm text-slate-600">
                        YouTube • TikTok • Instagram • Spotify • Substack • Patreon • Kajabi • Thinkific • Zoom
                      </p>
                    </div>

                    {/* Testimonials */}
                    <div className="space-y-4">
                      <Card className="p-4 border-l-4 border-purple-500 bg-purple-50">
                        <p className="text-sm text-slate-700 mb-2">
                          🟣 "Tango helped me close 5 new brand deals this month — everything's finally organized."
                        </p>
                        <p className="text-xs text-slate-600 font-medium">— Maya S., Lifestyle Creator</p>
                      </Card>

                      <Card className="p-4 border-l-4 border-purple-500 bg-purple-50">
                        <p className="text-sm text-slate-700 mb-2">
                          🟣 "I used to juggle spreadsheets and DMs. Now I manage all my coaching clients in one place."
                        </p>
                        <p className="text-xs text-slate-600 font-medium">— Leo M., Online Coach</p>
                      </Card>

                      <Card className="p-4 border-l-4 border-purple-500 bg-purple-50">
                        <p className="text-sm text-slate-700 mb-2">
                          🟣 "As a podcaster, staying on top of sponsorships and episodes is everything. Tango saves me hours."
                        </p>
                        <p className="text-xs text-slate-600 font-medium">— Chris R., Podcaster</p>
                      </Card>

                      <Card className="p-4 border-l-4 border-purple-500 bg-purple-50">
                        <p className="text-sm text-slate-700 mb-2">
                          🟣 "The dashboard is clean, simple, and actually fun to use. I track payments, projects, and content all in one."
                        </p>
                        <p className="text-xs text-slate-600 font-medium">— Rae T., Freelance Designer</p>
                      </Card>
                    </div>


                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="flex items-center justify-center min-h-screen relative">
                  {/* Background Dots for Screen 4 */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-300 rounded-full opacity-60 animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-6 h-6 bg-orange-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-32 left-16 w-3 h-3 bg-emerald-500 rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-60 left-32 w-5 h-5 bg-orange-300 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                    <div className="absolute bottom-48 right-12 w-4 h-4 bg-emerald-400 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute top-80 right-8 w-3 h-3 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="absolute bottom-80 left-8 w-5 h-5 bg-emerald-300 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                  </div>
                  
                  <div className="space-y-8 max-w-2xl w-full text-center relative z-10">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <span className="text-3xl">💜</span>
                      </div>
                      <h1 className="text-4xl font-bold text-slate-800 mb-4">
                        Join thousands of creators
                      </h1>
                      <p className="text-slate-600 text-lg">
                        Start your Tango journey and see why creators love Tango
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Selected niches */}
                      <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-slate-700 mb-3 text-center">Your selected niches:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedRoles.map((roleId) => {
                            const role = roleOptions.find(r => r.id === roleId);
                            return (
                              <span key={roleId} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                                {role?.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Plan details */}
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm font-semibold text-emerald-800 mb-2">Plan: Tango Core</p>
                        
                        {/* Billing cycle toggle */}
                        <div className="flex items-center justify-center gap-4 mb-4">
                          <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              billingCycle === 'monthly'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                              billingCycle === 'yearly'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            Yearly
                            <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                              Save 20%
                            </span>
                          </button>
                        </div>

                        {selectedRoles.length === 1 ? (
                          <div className="text-sm text-emerald-700">
                            {billingCycle === 'monthly' ? (
                              <p>$39.99/month</p>
                            ) : (
                              <div>
                                <p className="line-through text-emerald-500">$479.88/year</p>
                                <p className="font-semibold text-lg">$383.90/year</p>
                                <p className="text-xs text-emerald-600">Save $95.98 annually</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-emerald-700">
                            {billingCycle === 'monthly' ? (
                              <>
                                <p>$39.99/month for first niche</p>
                                <p>+$9.99/month for each additional niche</p>
                                <p className="font-semibold mt-1">
                                  Total: ${(39.99 + (selectedRoles.length - 1) * 9.99).toFixed(2)}/month
                                </p>
                              </>
                            ) : (
                              <>
                                <p>${(39.99 * 12).toFixed(2)}/year for first niche</p>
                                <p>+${(9.99 * 12).toFixed(2)}/year for each additional niche</p>
                                <p className="line-through text-emerald-500 mt-1">
                                  Total: ${((39.99 + (selectedRoles.length - 1) * 9.99) * 12).toFixed(2)}/year
                                </p>
                                <p className="font-semibold text-lg">
                                  Total: ${(((39.99 + (selectedRoles.length - 1) * 9.99) * 12) * 0.8).toFixed(2)}/year
                                </p>
                                <p className="text-xs text-emerald-600">
                                  Save ${(((39.99 + (selectedRoles.length - 1) * 9.99) * 12) * 0.2).toFixed(2)} annually
                                </p>
                              </>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-emerald-600 mt-2">Cancel anytime</p>
                      </div>

                      {/* What's included */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-center">What's included:</h3>
                        <ul className="space-y-2 text-sm text-gray-600 flex flex-col items-center">
                          <li className="flex items-center">
                            <span className="mr-2">•</span> Unlimited client management
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span> Advanced CRM pipeline
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span> Revenue tracking & analytics
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span> Content calendar & scheduling
                          </li>
                          <li className="flex items-center">
                            <span className="mr-2">•</span> Brand deal management
                          </li>

                        </ul>
                      </div>

                      {/* Error message */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{error}</p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={handleStartTrial}
                          disabled={isLoading}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-bold rounded px-8 py-4 text-lg transition disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Start Your Journey"
                          )}
                        </Button>
                      </div>

                      {/* Security notice */}
                      <div className="text-xs text-gray-500 text-center">
                        🔒 Secure payment powered by Stripe. Your payment information is encrypted and secure.
                      </div>
                      
                      {/* Back button */}
                      <div className="text-center pt-4">
                        <Button 
                          variant="ghost" 
                          onClick={handleBack} 
                          className="flex items-center text-slate-600 hover:text-slate-800 mx-auto"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentStep !== 4 && (
            <div className="flex items-center justify-between pt-8">
              {currentStep > 1 ? (
                <Button variant="ghost" onClick={handleBack} className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              <div className="flex space-x-3">
                {currentStep === 2 && (
                  <Button variant="outline" onClick={handleContinue}>
                    Skip for now
                  </Button>
                )}
                <Button
                  onClick={currentStep === 3 ? handleContinue : handleContinue}
                  disabled={!canContinue()}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {currentStep === 3 ? "Continue" : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Visual Feedback */}
        <div className={`${currentStep === 4 ? 'hidden' : 'w-2/5'} p-8 relative overflow-hidden`}>
          {/* Background Dots */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-300 rounded-full opacity-60"></div>
            <div className="absolute top-40 right-20 w-6 h-6 bg-orange-400 rounded-full opacity-50"></div>
            <div className="absolute bottom-32 left-16 w-3 h-3 bg-emerald-500 rounded-full opacity-70"></div>
            <div className="absolute top-60 left-32 w-5 h-5 bg-orange-300 rounded-full opacity-40"></div>
            <div className="absolute bottom-48 right-12 w-4 h-4 bg-emerald-400 rounded-full opacity-60"></div>
          </div>

          {/* Dynamic Content */}
          <div className="relative z-10 flex items-center justify-center h-full">
            <AnimatePresence mode="wait">
              {currentStep === 1 && selectedRoles.length > 0 && (
                <motion.div
                  key="roles-feedback"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="text-4xl text-white font-bold">
                      {selectedRoles.length}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {selectedRoles.length} Niche{selectedRoles.length > 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-slate-600">
                    {getSelectedRoleLabels()}
                  </p>
                </motion.div>
              )}

              {currentStep === 2 && selectedGoals.length > 0 && (
                <motion.div
                  key="goals-feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4 max-w-sm"
                >
                  <h3 className="text-xl font-bold text-slate-800 text-center mb-6">
                    My goals with Tango:
                  </h3>
                  <div className="space-y-3">
                    {selectedGoals.map((goalId, index) => {
                      const allGoals = getRelevantGoals(selectedRoles);
                      const goal = allGoals.find(g => g.id === goalId);
                      return (
                        <motion.div
                          key={goalId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {goal?.label}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

                            {currentStep === 3 && (
                <motion.div
                  key="testimonials-feedback"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <span className="text-3xl">💜</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    Real creators, real results
                  </h3>
                  <p className="text-slate-600">
                    See what others are saying about Tango
                  </p>
                </motion.div>
              )}


            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
};
