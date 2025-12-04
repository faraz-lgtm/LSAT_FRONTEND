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
    <div className={`flex justify-center ${className}`}>
      <div className="customer-progress-bar bg-white dark:bg-gray-800 rounded-lg p-2 sm:p-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                {/* Step Circle */}
                <div className={`flex items-center justify-center rounded-full font-semibold z-10 flex-shrink-0 ${
                  isCompleted || isCurrent
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`} style={{ 
                  width: 'clamp(1.25rem, var(--customer-progress-bar-circle-size), 2rem)',
                  height: 'clamp(1.25rem, var(--customer-progress-bar-circle-size), 2rem)',
                  fontSize: 'var(--customer-progress-bar-text-size)'
                }}>
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                
                {/* Step Label */}
                <div className={`ml-2 sm:ml-3 font-medium whitespace-nowrap ${
                  isCurrent || isCompleted
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} style={{ fontSize: 'var(--customer-progress-bar-text-size)' }}>
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </div>
              </div>
              
              {/* Connecting Line - Only between steps */}
              {index < steps.length - 1 && (
                <div className={`flex-1 mx-2 sm:mx-4 h-0.5 ${
                  isCompleted 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalProgressBar;
