"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect } from "react";

interface PostSignupLoadingProps {
  userName?: string;
  selectedRoles?: string[];
  selectedGoals?: string[];
  setupTask?: string;
  onSetupComplete?: () => void;
}

export const PostSignupLoading = ({ 
  userName = "Creator",
  selectedRoles = [],
  selectedGoals = [],
  setupTask = "Set up your first campaign",
  onSetupComplete 
}: PostSignupLoadingProps) => {
  // Simulate setup completion after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSetupComplete) {
        onSetupComplete();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onSetupComplete]);
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <img 
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png" 
            alt="Tango Logo" 
            width={140} 
            height={112}
            className="object-contain"
            style={{ height: 'auto' }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-4xl p-8 flex flex-col">
          <div className="flex items-center justify-center min-h-screen relative">
            {/* Background Dots */}
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
              {/* Success Icon */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto"
              >
                <span className="text-4xl">🎉</span>
              </motion.div>

              {/* Main Heading */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold text-slate-800 mb-4">
                  You're In!
                </h1>
                <p className="text-slate-600 text-lg">
                  We're setting up your Tango workspace...
                </p>
              </motion.div>

              {/* Progress Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Creating your CRM dashboard</span>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Personalizing your workspace</span>
                </div>
                
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-700 font-medium">Getting everything ready for you</span>
                </div>
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-purple-50 border border-purple-200 rounded-lg p-6"
              >
                <p className="text-slate-700 text-lg italic mb-2">
                  "The CRM feels built just for me. This is what I've been waiting for."
                </p>
                <p className="text-slate-600 font-medium">— Ava, Creator & Coach</p>
              </motion.div>

              {/* Loading Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-slate-700 font-semibold">Hang tight — good things are coming.</span>
                </div>
                <p className="text-slate-600">
                  This will only take a few seconds.
                </p>
              </motion.div>

              {/* Loading Spinner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="flex justify-center pt-4"
              >
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 