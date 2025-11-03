import { useNavigate } from "react-router-dom";
import { useCurrencyFormatter } from "../../utils/currency";

interface OrderSummaryProps{
    totalPrice:number
}

const OrderSummary = ({totalPrice}:OrderSummaryProps) => {
  const navigate = useNavigate();
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-3 sm:p-4 shadow-xl h-full lg:h-[60vh] lg:max-h-[800px] flex flex-col">
      <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-shrink-0">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded flex items-center justify-center">
          <span className="text-xs sm:text-sm">📋</span>
        </div>
        <h3 className="text-sm sm:text-base font-bold">Order Summary</h3>
      </div>
      
      <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3 flex-shrink-0">
        <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-blue-500/30">
          <span className="text-blue-100 text-[10px] sm:text-xs">Subtotal</span>
          <span className="font-semibold text-xs sm:text-sm">{formatCurrency(totalPrice * 100)}</span>
        </div>
        <div className="flex justify-between items-center py-0.5 sm:py-1 border-b border-blue-500/30">
          <span className="text-blue-100 text-[10px] sm:text-xs">Tax</span>
          <span className="font-semibold text-xs sm:text-sm">{formatCurrency(0)}</span>
        </div>
        <div className="flex justify-between items-center py-1 sm:py-1.5 bg-white/10 rounded px-2">
          <span className="text-xs sm:text-sm font-bold">Total</span>
          <span className="text-sm sm:text-base font-bold">{formatCurrency(totalPrice * 100)}</span>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-800 text-[8px] sm:text-[10px]">✓</span>
          </div>
          <span className="text-blue-100">Flexible scheduling</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-800 text-[8px] sm:text-[10px]">✓</span>
          </div>
          <span className="text-blue-100">Expert LSAT tutors</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-800 text-[8px] sm:text-[10px]">✓</span>
          </div>
          <span className="text-blue-100">Personalized study plans</span>
        </div>
      </div>

      <div className="mt-auto space-y-1.5 sm:space-y-2 flex-shrink-0">
        <button 
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2.5 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-all duration-200 shadow-lg text-xs sm:text-sm fixed bottom-3 left-6 right-6 max-w-[calc(100%-3rem)] sm:max-w-none sm:static sm:bottom-auto sm:left-auto sm:right-auto z-50 lg:static mx-auto" 
          onClick={() => navigate("/Appointment")}
        >
          Continue to Checkout
        </button>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] text-blue-200">
            <span>🔒</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
