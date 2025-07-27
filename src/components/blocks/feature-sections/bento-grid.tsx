"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Users, Calendar, DollarSign, BarChart3, Play, Mic, FileText, MessageCircle, TrendingUp, Clock, Star, CheckCircle, Target, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function FeaturesSectionBentoGrid() {
  const features = [
    {
      title: "Creator Dashboard",
      description:
        "Manage your content pipeline, track follower growth, and oversee brand collaborations all in one place.",
      skeleton: <SkeletonCreator />,
      className:
        "col-span-1 lg:col-span-3",
    },
    {
      title: "Coach Interface", 
      description:
        "Track client progress, schedule sessions, and manage coaching programs with ease.",
      skeleton: <SkeletonCoach />,
      className: "col-span-1 lg:col-span-3",
    },
    {
      title: "Podcaster View",
      description:
        "Plan episodes, manage guest outreach, and track sponsorship opportunities seamlessly.",
      skeleton: <SkeletonPodcaster />,
      className:
        "col-span-1 lg:col-span-3",
    },
    {
      title: "Freelancer Setup",
      description:
        "Manage project pipelines, client communications, and invoice tracking in one dashboard.",
      skeleton: <SkeletonFreelancer />,
      className: "col-span-1 lg:col-span-3",
    },
    {
      title: "Pipeline Overview",
      description:
        "Get a real-time view of your complete sales pipeline with customizable stages and deal tracking.",
      skeleton: <SkeletonPipeline />,
      className:
        "col-span-1 lg:col-span-6",
    },
  ];
  
  return (
    <div id="features" className="relative z-20 mx-auto max-w-7xl pt-8 pb-0 lg:pt-20 lg:pb-0 bg-white">
      <div className="px-8">
        <h4 className="mx-auto max-w-5xl text-center text-3xl font-semibold tracking-tight text-slate-800 lg:text-5xl lg:leading-tight">
          Built for Your Unique Business Model
        </h4>

        <p className="mx-auto my-3 max-w-2xl text-center text-sm font-normal text-slate-500 lg:text-base">
          Every niche has different needs. Our CRM adapts to how you actually work.
        </p>
      </div>

      <div className="relative">
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-6 bg-white">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle isCentered={feature.title === "Pipeline Overview"}>{feature.title}</FeatureTitle>
              <FeatureDescription isCentered={feature.title === "Pipeline Overview"}>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`relative overflow-hidden p-4 sm:p-8 bg-white`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children, isCentered = false }: { children?: React.ReactNode; isCentered?: boolean }) => {
  return (
    <p className={`mx-auto max-w-5xl text-xl tracking-tight text-slate-800 md:text-2xl md:leading-snug font-semibold ${isCentered ? 'text-center' : 'text-left'}`}>
      {children}
    </p>
  );
};

const FeatureDescription = ({ children, isCentered = false }: { children?: React.ReactNode; isCentered?: boolean }) => {
  return (
    <p
      className={cn(
        "my-2 text-sm md:text-base font-normal text-slate-500",
        isCentered ? 'text-center mx-auto max-w-2xl' : 'text-left max-w-4xl'
      )}
    >
      {children}
    </p>
  );
};

export const SkeletonCreator = () => {
  return (
    <div className="relative flex h-full gap-4 px-2 py-8">
      <div className="group mx-auto h-full w-full bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
        <div className="flex h-full w-full flex-1 flex-col space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-purple-700">Content Pipeline</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-slate-700">Video Ideas</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs">Draft</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-slate-700">Brand Collab</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">Active</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-slate-700">Revenue</span>
              </div>
              <div className="text-lg font-bold text-purple-600">$8.4K</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-slate-700">Growth</span>
              </div>
              <div className="text-lg font-bold text-pink-600">+12%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonCoach = () => {
  return (
    <div className="relative flex h-full gap-4 px-2 py-8">
      <div className="group mx-auto h-full w-full bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg">
        <div className="flex h-full w-full flex-1 flex-col space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-emerald-700">Client Progress</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700">Sarah J.</span>
              </div>
              <span className="text-sm text-emerald-600 font-medium">Week 3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-700">Mike C.</span>
              </div>
              <span className="text-sm text-emerald-600 font-medium">Week 8</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Sessions</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">24</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Growth</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">+18%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonPodcaster = () => {
  return (
    <div className="relative flex h-full gap-4 px-2 py-8">
      <div className="group mx-auto h-full w-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="flex h-full w-full flex-1 flex-col space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-blue-700">Episode Planning</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-slate-700">AI in Business</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">Recording</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                      <span className="text-sm font-medium text-slate-700">Guest: Dr. Christy R.</span>
              <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs">Scheduled</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700">Episodes</span>
              </div>
              <div className="text-lg font-bold text-blue-600">47</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Sponsors</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">$2.4K</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonFreelancer = () => {
  return (
    <div className="relative flex h-full gap-4 px-2 py-8">
      <div className="group mx-auto h-full w-full bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
        <div className="flex h-full w-full flex-1 flex-col space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-orange-700">Project Pipeline</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-slate-700">Website Redesign</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm font-medium text-slate-700">Logo Design</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs">Completed</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-slate-700">Clients</span>
              </div>
              <div className="text-lg font-bold text-orange-600">12</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-700">Revenue</span>
              </div>
              <div className="text-lg font-bold text-emerald-600">$8.2K</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonPipeline = () => {
  const [selectedNiche] = React.useState("Content Creator");

  const pipelineStages = [
    { name: "Discovery Call", amount: "$8.2K", color: "bg-emerald-500", percentage: 65 },
    { name: "Proposal Sent", amount: "$12.1K", color: "bg-blue-500", percentage: 45 },
    { name: "Negotiation", amount: "$4.2K", color: "bg-orange-500", percentage: 30 },
  ];

  const nicheTags = ["YouTube", "Coaching", "Brand Deals"];

  return (
    <div className="relative flex h-full gap-4 px-2 py-8">
      <Card className="w-full bg-white/80 backdrop-blur-sm border-0 shadow-none">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-emerald-600" />
              <h3 className="text-xl font-semibold text-slate-800">Pipeline Overview</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
          </div>
          
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-emerald-700">Monthly Revenue</span>
                <TrendingUp className="h-3 w-3 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-800">$24.5K</div>
              <div className="text-xs text-emerald-600">+12% from last month</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-700">Active Clients</span>
                <Users className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-800">18</div>
              <div className="text-xs text-blue-600">+3 this week</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-orange-700">Growth Rate</span>
                <TrendingUp className="h-3 w-3 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-orange-800">+24%</div>
              <div className="text-xs text-orange-600">This month</div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              Pipeline Stages
              <ChevronDown className="h-3 w-3 text-slate-500" />
            </h4>
            <div className="space-y-2">
              {pipelineStages.map((stage, index) => (
                <div key={index} className="bg-slate-50/80 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{stage.name}</span>
                    <span className="text-sm font-semibold text-slate-800">{stage.amount}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${stage.color} transition-all duration-500 ease-in-out`}
                      style={{ width: `${stage.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Niche Selection */}
          <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-orange-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">Your Niche: {selectedNiche}</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {nicheTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-white/80 text-slate-700 text-xs px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-slate-600">
              Specialized focus areas generating <span className="font-semibold text-emerald-700">85% of revenue</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};