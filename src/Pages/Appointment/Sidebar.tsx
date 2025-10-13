import { Card, CardContent } from "@/components/dashboard/ui/card";
import { CheckCircle } from "lucide-react";

type AppointmentSideBarProps = {
  selected: "appointments" | "information" | "payments";
};

export function AppointmentSideBar({ selected }: AppointmentSideBarProps) {
  const items = [
    { key: "appointments", label: "Appointments", completed: true },
    { key: "information", label: "Your Information", completed: selected === "payments" },
    { key: "payments", label: "Payments", completed: false },
  ] as const;

  return (
    <Card className="w-80 rounded-xl shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">60-Minute Single Prep Session</h2>
          <p className="text-blue-100 text-sm">Complete your booking in 3 easy steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex-1">
          <div className="space-y-6">
            {items.map((item, index) => {
              const isActive = selected === item.key;
              const isCompleted = item.completed;
              
              return (
                <div key={item.key} className="flex items-start space-x-4">
                  {/* Step Number/Icon */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                      }`}>
                        <span className="text-sm font-semibold">{index + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${
                      isActive ? 'text-white' : isCompleted ? 'text-green-200' : 'text-blue-200'
                    }`}>
                      {item.label}
                    </h3>
                    {isActive && (
                      <p className="text-blue-100 text-sm mt-1">
                        {item.key === 'appointments' && 'Select your preferred time slots'}
                        {item.key === 'information' && 'Provide your contact details'}
                        {item.key === 'payments' && 'Complete your payment'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-6 border-t border-blue-500">
          <h4 className="font-semibold text-white mb-3">Need Help?</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-blue-200">📞</span>
              <span className="text-blue-100">+1 (289) 806-7343</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-200">✉️</span>
              <span className="text-blue-100">support@betterlsat.com</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
