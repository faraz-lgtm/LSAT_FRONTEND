import { ArrowLeft } from "lucide-react";

interface RightPanelProps {
  title: "Appointments" | "Your Information";
  children?: React.ReactNode;
  footerFn: Function;
  setSelected:React.Dispatch<React.SetStateAction<"information" | "appointments">>;
  isLoading?: boolean;
  loadingText?: string;
  onNavigateBack?: () => void;
  hideFooter?: boolean;
}

const RightPanel = ({ title, children, footerFn, setSelected, isLoading = false, loadingText = "Creating Customer...", onNavigateBack, hideFooter = false }: RightPanelProps) => {
  // Hide footer for "Your Information" panel since button is now inline, or if explicitly hidden
  const showFooter = title === "Appointments" && !hideFooter;
  const isInformationPanel = title === "Your Information";
  
  return (
    <div className={`w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col`}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2.5 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>

      {/* Content - Natural flow */}
      <div className={`${isInformationPanel ? "flex-none p-3" : "flex-1 p-3"} w-full`}>
        {children}
      </div>

      {/* Footer - Fixed at bottom using flexbox - Only show if not hidden */}
      {showFooter && (
        <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 px-3 py-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-end">
            <button
              onClick={() => footerFn()}
              disabled={isLoading}
              type="button"
              className={`px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg text-sm min-w-[120px] ${
                isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  <span className="text-xs">{loadingText}</span>
                </div>
              ) : (
                "Checkout"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightPanel;
