'use client'

import { useGoogleAnalytics } from '@/hooks/use-google-analytics'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface TrackButtonClickProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  trackingName: string
  page?: string
  children: React.ReactNode
}

export const TrackButtonClick = forwardRef<HTMLButtonElement, TrackButtonClickProps>(
  ({ trackingName, page, children, onClick, ...props }, ref) => {
    const { trackButtonClick } = useGoogleAnalytics()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      trackButtonClick(trackingName, page)
      onClick?.(e)
    }

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    )
  }
)

TrackButtonClick.displayName = 'TrackButtonClick' 