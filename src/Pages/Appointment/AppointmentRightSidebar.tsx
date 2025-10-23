import { ArrowLeft } from "lucide-react";

interface RightPanelProps {
  title: "Appointments" | "Your Information";
  children?: React.ReactNode;
  footerFn: Function;
  setSelected:React.Dispatch<React.SetStateAction<"information" | "appointments">>;
  isLoading?: boolean;
  onNavigateBack?: () => void;
}

const RightPanel = ({ title, children, footerFn, setSelected, isLoading = false, onNavigateBack }: RightPanelProps) => {
  return (
    <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
        {(title === "Your Information" || title === "Appointments") && (
          <button
            onClick={() => {
              if (title === "Your Information") {
                onNavigateBack?.(); // Use the passed navigation function
              } else if (title === "Appointments") {
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
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isLoading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Creating Customer...</span>
              </div>
            ) : (
              title === "Appointments" ? "Checkout" : "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
