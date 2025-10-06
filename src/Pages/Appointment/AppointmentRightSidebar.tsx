import { ArrowLeft } from "lucide-react";

interface RightPanelProps {
  title: "Appointments" | "Your Information" | "Payments";
  children?: React.ReactNode;
  footerFn: Function;
  setSelected:React.Dispatch<React.SetStateAction<"information" | "appointments" | "payments">>
}

const RightPanel = ({ title, children, footerFn,setSelected }: RightPanelProps) => {
  return (
    <>
      <div className="flex-1 bg-white rounded-2xl shadow-md p-6 h-[70vh] overflow-y-scroll">
        {(title === "Your Information" || title === "Payments") && (
          <button
            onClick={() => {
              if (title === "Your Information") {
                setSelected("appointments");
              } else if (title === "Payments") {
                setSelected("information");
              }
            }}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold mb-4">{title}</h2>

        {/* Content */}
        <div className="space-y-4">{children}</div>

        {/* Footer (optional) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => footerFn()}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default RightPanel;
