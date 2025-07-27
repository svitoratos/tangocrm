'use client'

import { useGoogleAnalytics } from '@/hooks/use-google-analytics'
import { FormHTMLAttributes, forwardRef } from 'react'

interface TrackFormSubmissionProps extends FormHTMLAttributes<HTMLFormElement> {
  formName: string
  children: React.ReactNode
}

export const TrackFormSubmission = forwardRef<HTMLFormElement, TrackFormSubmissionProps>(
  ({ formName, children, onSubmit, ...props }, ref) => {
    const { trackFormSubmission } = useGoogleAnalytics()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      // Track form submission attempt
      trackFormSubmission(formName, true)
      
      // Call original onSubmit if provided
      onSubmit?.(e)
    }

    return (
      <form ref={ref} onSubmit={handleSubmit} {...props}>
        {children}
      </form>
    )
  }
)

TrackFormSubmission.displayName = 'TrackFormSubmission' 