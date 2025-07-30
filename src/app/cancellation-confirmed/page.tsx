'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function CancellationConfirmedPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Subscription Canceled
            </CardTitle>
            <CardDescription className="text-base text-gray-600 mt-2">
              We've successfully canceled your subscription. Thank you for your feedback.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-medium text-blue-900">What happens next?</h3>
                  <ul className="mt-2 text-sm text-blue-800 space-y-1">
                    <li>• You'll continue to have access until the end of your billing period</li>
                    <li>• We'll send you a confirmation email with all the details</li>
                    <li>• Your data will be safely stored for 30 days if you change your mind</li>
                    <li>• You can reactivate anytime before your subscription ends</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">We're sorry to see you go</h3>
              <p className="text-sm text-gray-600">
                Your feedback is invaluable in helping us improve our service. 
                We'll review your suggestions and work on making our platform better for everyone.
              </p>
              <p className="text-sm text-gray-600">
                If you have any questions or change your mind, don't hesitate to reach out to our support team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/contact">
                  Contact Support
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Changed your mind? You can{' '}
                <Link href="/dashboard/settings" className="text-blue-600 hover:text-blue-500 underline">
                  reactivate your subscription
                </Link>{' '}
                anytime before it ends.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}