import { useNavigate } from "react-router-dom";
import { useCurrencyFormatter } from "../../utils/currency";

interface OrderSummaryProps{
    totalPrice:number
}

const OrderSummary = ({totalPrice}:OrderSummaryProps) => {
  const navigate = useNavigate();
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <span className="text-lg">📋</span>
        </div>
        <h3 className="text-xl font-bold">Order Summary</h3>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-blue-500/30">
          <span className="text-blue-100">Subtotal</span>
          <span className="font-semibold">{formatCurrency(totalPrice * 100)}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-blue-500/30">
          <span className="text-blue-100">Tax</span>
          <span className="font-semibold">{formatCurrency(0)}</span>
        </div>
        <div className="flex justify-between items-center py-3 bg-white/10 rounded-lg px-3">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-bold">{formatCurrency(totalPrice * 100)}</span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
            <span className="text-green-800 text-xs">✓</span>
          </div>
          <span className="text-blue-100">🔒 Secure checkout</span>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
            <span className="text-green-800 text-xs">✓</span>
          </div>
          <span className="text-blue-100">⭐ Trusted by 1,500+ students</span>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
            <span className="text-green-800 text-xs">✓</span>
          </div>
          <span className="text-blue-100">💬 Average rating 4.9/5 </span>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg" 
          onClick={() => navigate("/Appointment")}
        >
          Continue to Checkout
        </button>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-xs text-blue-200">
            <span>🔒</span>
            <span>Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white/10 rounded-xl border border-white/20">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-lg">⚡</span>
          <span className="font-semibold text-sm">Quick Setup</span>
        </div>
        <p className="text-xs text-blue-200 leading-relaxed">
          Book your first session within 30 minutes of checkout
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
