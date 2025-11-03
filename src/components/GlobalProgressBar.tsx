import React from 'react';
import { CheckCircle } from 'lucide-react';

interface GlobalProgressBarProps {
  currentStep: 1 | 2 | 3 | 4;
  className?: string;
}

const steps = [
  { id: 1, label: 'Select Items', shortLabel: 'Select' },
  { id: 2, label: 'Review Cart', shortLabel: 'Review' },
  { id: 3, label: 'Your Info', shortLabel: 'Info' },
  { id: 4, label: 'Appointments', shortLabel: 'Appt' },
];

export const GlobalProgressBar: React.FC<GlobalProgressBarProps> = ({ 
  currentStep, 
  className = '' 
}) => {
  return (
    <div className={`w-full bg-white dark:bg-gray-800 rounded-lg p-1 sm:p-1.5 ${className}`}>
      {/* Progress Steps */}
      <div className="flex items-center justify-between px-0.5 sm:px-1">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center relative flex-1 min-w-0">
              {/* Step Circle */}
              <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-semibold z-10 flex-shrink-0 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-1 h-1 sm:w-1.5 sm:h-1.5" />
                ) : (
                  step.id
                )}
              </div>
              
              {/* Step Label */}
              <div className="mt-0.5">
                <div className={`text-[9px] sm:text-[10px] font-medium text-center truncate w-full ${
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
                <div className={`absolute top-1.25 sm:top-1.5 left-1/2 w-full h-0.5 ${
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
