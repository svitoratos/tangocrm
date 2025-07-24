'use client'

import { CheckCircle } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  completed: boolean
  current: boolean
}

interface OnboardingProgressProps {
  steps: OnboardingStep[]
  className?: string
}

export function OnboardingProgress({ steps, className = '' }: OnboardingProgressProps) {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center ${step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.current 
                  ? 'bg-blue-600 text-white' 
                  : step.completed 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <span className="ml-2 font-medium hidden sm:inline">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step.completed ? 'bg-green-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 