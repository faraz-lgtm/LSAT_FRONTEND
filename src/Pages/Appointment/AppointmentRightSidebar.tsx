import { ArrowLeft } from "lucide-react";

interface RightPanelProps {
  title: "Appointments" | "Your Information" | "Payments";
  children?: React.ReactNode;
  footerFn: Function;
  setSelected:React.Dispatch<React.SetStateAction<"information" | "appointments" | "payments">>
}

const RightPanel = ({ title, children, footerFn,setSelected }: RightPanelProps) => {
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        {(title === "Your Information" || title === "Payments") && (
          <button
            onClick={() => {
              if (title === "Your Information") {
                setSelected("appointments");
              } else if (title === "Payments") {
                setSelected("information");
              }
            }}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        )}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>

      {/* Content */}
      <div className="p-6 h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-6">{children}</div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex justify-end">
          <button
            onClick={() => footerFn()}
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
