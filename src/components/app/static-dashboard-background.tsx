"use client";

import React from 'react';

export const StaticDashboardBackground: React.FC = () => {
  return (
    <div className="h-screen bg-white flex">
      {/* Simple Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg text-slate-800">Tango</span>
          </div>
        </div>

        {/* Simple Navigation */}
        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500 text-white">
            <span className="font-medium text-sm">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600">
            <span className="font-medium text-sm">CRM</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600">
            <span className="font-medium text-sm">Clients</span>
          </div>
          
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600">
            <span className="font-medium text-sm">Calendar</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
          <div className="flex items-center gap-4">
            <input 
              type="text" 
              placeholder="Search..." 
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm w-64"
              disabled
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-800">$12,450</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">$</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Clients</p>
                  <p className="text-2xl font-bold text-slate-800">24</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Projects</p>
                  <p className="text-2xl font-bold text-slate-800">8</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold">📁</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Growth</p>
                  <p className="text-2xl font-bold text-slate-800">+18%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Opportunities</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Tech Startup Video</p>
                    <p className="text-sm text-slate-600">Contract</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">$2,500</p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">In Progress</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Product Launch</p>
                    <p className="text-sm text-slate-600">Outreach</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">$1,800</p>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Awaiting</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Tasks</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Review client feedback</p>
                    <p className="text-sm text-slate-600">2 hours</p>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">pending</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">Schedule content shoot</p>
                    <p className="text-sm text-slate-600">Tomorrow</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">scheduled</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 