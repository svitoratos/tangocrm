"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Target, ChevronDown } from "lucide-react";

export const PipelineOverviewSection = () => {
  const [selectedNiche] = useState("Content Creator");

  const pipelineStages = [
    { name: "Discovery Call", amount: "$8.2K", color: "bg-emerald-500", percentage: 65 },
    { name: "Proposal Sent", amount: "$12.1K", color: "bg-blue-500", percentage: 45 },
    { name: "Negotiation", amount: "$4.2K", color: "bg-orange-500", percentage: 30 },
  ];

  const nicheTags = ["YouTube", "Coaching", "Brand Deals"];

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center">
          <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-xl shadow-slate-900/5">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-emerald-600" />
                  Pipeline Overview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 rounded-xl border border-emerald-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-emerald-700">Monthly Revenue</span>
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-800">$24.5K</div>
                  <div className="text-xs text-emerald-600 mt-1">+12% from last month</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-xl border border-blue-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700">Active Clients</span>
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-800">18</div>
                  <div className="text-xs text-blue-600 mt-1">+3 this week</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 rounded-xl border border-orange-200/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-700">Close Rate</span>
                    <Target className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-800">92%</div>
                  <div className="text-xs text-orange-600 mt-1">Above industry avg</div>
                </div>
              </div>

              {/* Pipeline Stages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  Pipeline Stages
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </h3>
                <div className="space-y-3">
                  {pipelineStages.map((stage, index) => (
                    <div key={index} className="bg-slate-50/80 p-4 rounded-lg border border-slate-200/60">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-slate-700">{stage.name}</span>
                        <span className="font-semibold text-slate-800">{stage.amount}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${stage.color} transition-all duration-500 ease-in-out`}
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{stage.percentage}% completion</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Niche Selection */}
              <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-orange-50 p-6 rounded-xl border border-slate-200/60">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Niche: {selectedNiche}</h3>
                <div className="flex flex-wrap gap-2">
                  {nicheTags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-white/80 text-slate-700 hover:bg-emerald-50 transition-colors duration-200 px-3 py-1"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  Specialized focus areas generating <span className="font-semibold text-emerald-700">85% of revenue</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};