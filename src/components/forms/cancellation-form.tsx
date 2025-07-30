'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CancellationFormData {
  reason: string;
  customReason?: string;
  improvement?: string;
  comeback?: string;
}

interface CancellationFormProps {
  onSubmit?: (data: CancellationFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const cancellationReasons = [
  { id: 'not-using', label: "I'm not using it enough" },
  { id: 'too-expensive', label: 'Too expensive' },
  { id: 'found-alternative', label: 'Found an alternative' },
  { id: 'missing-features', label: 'Missing features I need' },
  { id: 'too-complicated', label: 'Too complicated' },
  { id: 'taking-break', label: 'Just taking a break' },
  { id: 'other', label: 'Other' },
];

const comebackOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'not-sure', label: 'Not sure' },
];

export default function CancellationForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: CancellationFormProps) {
  const [formData, setFormData] = useState<CancellationFormData>({
    reason: '',
    customReason: '',
    improvement: '',
    comeback: '',
  });

  const [errors, setErrors] = useState<{ reason?: string }>({});

  const handleReasonChange = (reasonId: string) => {
    setFormData(prev => ({
      ...prev,
      reason: reasonId,
      customReason: reasonId !== 'other' ? '' : prev.customReason,
    }));
    
    // Clear error when user selects a reason
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors: { reason?: string } = {};
    
    if (!formData.reason) {
      newErrors.reason = 'Please select a reason for canceling';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Call onSubmit with form data
    onSubmit?.(formData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center justify-center gap-2">
          <span className="text-2xl">🙁</span>
          We're sorry to see you go.
        </CardTitle>
        <CardDescription className="text-gray-600 text-base mt-2">
          Before you cancel, would you mind sharing why? Your feedback helps us improve.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cancellation Reason */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium text-gray-900">
                Why are you canceling? <span className="text-red-500">*</span>
              </Label>
              {errors.reason && (
                <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
              )}
            </div>
            
            <div className="space-y-3">
              {cancellationReasons.map((reason) => (
                <div key={reason.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={reason.id}
                    checked={formData.reason === reason.id}
                    onCheckedChange={() => handleReasonChange(reason.id)}
                    className="mt-0.5"
                  />
                  <Label 
                    htmlFor={reason.id} 
                    className="text-sm font-normal text-gray-700 cursor-pointer leading-5"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </div>
            
            {/* Custom reason text field */}
            {formData.reason === 'other' && (
              <div className="mt-3 ml-6">
                <Textarea
                  placeholder="Please specify your reason..."
                  value={formData.customReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, customReason: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            )}
          </div>

          {/* Improvement Suggestion */}
          <div className="space-y-2">
            <Label className="text-base font-medium text-gray-900">
              How could we have improved your experience? <span className="text-gray-500">(Optional)</span>
            </Label>
            <Textarea
              placeholder="Share your thoughts on what we could have done better..."
              value={formData.improvement}
              onChange={(e) => setFormData(prev => ({ ...prev, improvement: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Comeback Possibility */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-900">
              Would you consider coming back in the future? <span className="text-gray-500">(Optional)</span>
            </Label>
            
            <RadioGroup
              value={formData.comeback}
              onValueChange={(value) => setFormData(prev => ({ ...prev, comeback: value }))}
              className="space-y-2"
            >
              {comebackOptions.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`comeback-${option.id}`} />
                  <Label 
                    htmlFor={`comeback-${option.id}`} 
                    className="text-sm font-normal text-gray-700 cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Complete Cancellation'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              Keep My Subscription
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}