"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, Target, Calendar, Users, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePaymentStatus } from '@/hooks/use-payment-status'

const setupSteps = [
  {
    id: 'workspace',
    title: 'Setting up your workspace',
    description: 'Customizing your dashboard for your niche',
    icon: Target,
    duration: 2000
  },
  {
    id: 'calendar',
    title: 'Configuring your calendar',
    description: 'Integrating scheduling and timeline views',
    icon: Calendar,
    duration: 1500
  },
  {
    id: 'pipelines',
    title: 'Creating your pipelines',
    description: 'Setting up your opportunity tracking',
    icon: BarChart3,
    duration: 1800
  },
  {
    id: 'clients',
    title: 'Preparing client management',
    description: 'Getting your CRM ready for action',
    icon: Users,
    duration: 1200
  }
]

export default function SetupPage() {
  const router = useRouter()
  const { primaryNiche, hasCompletedOnboarding, hasActiveSubscription } = usePaymentStatus()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    // Redirect if not properly onboarded
    if (!hasCompletedOnboarding || !hasActiveSubscription) {
      router.push('/onboarding')
      return
    }

    let stepStartTime = Date.now()
    let currentStepIndex = 0

    const progressInterval = setInterval(() => {
      const currentStepData = setupSteps[currentStepIndex]
      if (!currentStepData) {
        clearInterval(progressInterval)
        return
      }

      const stepElapsed = Date.now() - stepStartTime
      const stepProgress = Math.min((stepElapsed / currentStepData.duration) * 100, 100)
      
      // Calculate overall progress
      const overallProgress = ((currentStepIndex * 100 + stepProgress) / setupSteps.length)
      setProgress(overallProgress)
      setCurrentStep(currentStepIndex)

      // If step is complete, move to next
      if (stepProgress >= 100) {
        setCompletedSteps(prev => [...prev, currentStepData.id])
        currentStepIndex++
        stepStartTime = Date.now()

        // If all steps complete, redirect to dashboard
        if (currentStepIndex >= setupSteps.length) {
          clearInterval(progressInterval)
          setTimeout(() => {
            router.push(`/dashboard?niche=${primaryNiche}&section=dashboard&setup=complete`)
          }, 1000)
        }
      }
    }, 100)

    return () => clearInterval(progressInterval)
  }, [router, primaryNiche, hasCompletedOnboarding, hasActiveSubscription])

  const currentStepData = setupSteps[currentStep]
  const CurrentIcon = currentStepData?.icon || Loader2

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Green circles */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-emerald-200 rounded-full opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-emerald-300 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-emerald-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-emerald-300 rounded-full opacity-30"></div>
        <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-emerald-200 rounded-full opacity-40"></div>
        
        {/* Orange circles */}
        <div className="absolute top-1/4 right-10 w-5 h-5 bg-orange-200 rounded-full opacity-50"></div>
        <div className="absolute bottom-40 left-10 w-4 h-4 bg-orange-300 rounded-full opacity-40"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-orange-200 rounded-full opacity-60"></div>
        <div className="absolute bottom-1/4 right-10 w-6 h-6 bg-orange-300 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-orange-200 rounded-full opacity-50"></div>
      </div>
      
      {/* Header with Logo */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-center">
          <img 
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png" 
            alt="Tango Logo" 
            width={140} 
            height={112}
            className="object-contain cursor-pointer"
            style={{ height: 'auto' }}
          />
        </div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <Card className="w-full max-w-lg shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-800">
              <CurrentIcon className={`h-8 w-8 text-emerald-600 ${progress < 100 ? 'animate-spin' : ''}`} />
              Setting up your CRM
            </CardTitle>
            <CardDescription className="text-slate-600 text-base">
              We're customizing everything for your {primaryNiche} business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Current step */}
            {currentStepData && (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  {currentStepData.title}
                </h3>
                <p className="text-slate-600 text-sm">
                  {currentStepData.description}
                </p>
              </div>
            )}
            
            {/* Setup steps list */}
            <div className="space-y-3">
              {setupSteps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = completedSteps.includes(step.id)
                const isCurrent = currentStep === index
                const isPending = currentStep < index
                
                return (
                  <div 
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isCompleted ? 'bg-emerald-50 border border-emerald-200' :
                      isCurrent ? 'bg-blue-50 border border-blue-200' :
                      'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    ) : isCurrent ? (
                      <StepIcon className="h-5 w-5 text-blue-600 flex-shrink-0 animate-pulse" />
                    ) : (
                      <StepIcon className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isCompleted ? 'text-emerald-800' :
                        isCurrent ? 'text-blue-800' :
                        'text-slate-600'
                      }`}>
                        {step.title}
                      </p>
                      <p className={`text-sm ${
                        isCompleted ? 'text-emerald-600' :
                        isCurrent ? 'text-blue-600' :
                        'text-slate-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Progress percentage */}
            <div className="text-center">
              <span className="text-2xl font-bold text-emerald-600">
                {Math.round(progress)}%
              </span>
              <p className="text-sm text-slate-500">Complete</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}