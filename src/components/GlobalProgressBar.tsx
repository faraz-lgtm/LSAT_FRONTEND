import React from 'react';
import { CheckCircle } from 'lucide-react';

interface GlobalProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

const steps = [
  { id: 1, label: 'Select Items', shortLabel: 'Select' },
  { id: 2, label: 'Review Cart', shortLabel: 'Review' },
  { id: 3, label: 'Your Info', shortLabel: 'Info' },
  { id: 4, label: 'Appointments', shortLabel: 'Appt' },
  { id: 5, label: 'Checkout', shortLabel: 'Check' },
];

export const GlobalProgressBar: React.FC<GlobalProgressBarProps> = ({ 
  currentStep, 
  className = '' 
}) => {
  return (
    <div className={`w-full bg-white dark:bg-gray-800 rounded-lg p-2 mb-4 ${className}`}>
      {/* Header */}
      {/* <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Checkout Progress</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Step {currentStep} of {steps.length}
        </span>
      </div> */}
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1">
              {/* Step Circle */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold z-10 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-2 h-2" />
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-1">
                <div className={`text-xs font-medium text-center ${
                  isCurrent 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : isCompleted 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.shortLabel}
                </div>
              </div>
              
              {/* Connecting Line - Only between circles */}
              {index < steps.length - 1 && (
                <div className={`absolute top-2 left-1/2 w-full h-0.5 ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} style={{ transform: 'translateX(50%)' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalProgressBar;
