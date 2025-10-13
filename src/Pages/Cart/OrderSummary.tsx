import { useNavigate } from "react-router-dom";

interface OrderSummaryProps{
    totalPrice:number
}

const OrderSummary = ({totalPrice}:OrderSummaryProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-blue-600 text-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${totalPrice}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>$0.00</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-blue-500 pt-2">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-green-300">✓</span>
          <span>Flexible scheduling</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-green-300">✓</span>
          <span>Expert LSAT tutors</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-green-300">✓</span>
          <span>Personalized study plans</span>
        </div>
      </div>

      <div className="flex flex-col justify-end h-32">
        <button 
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors" 
          onClick={() => navigate("/Appointment")}
        >
          Make Appointment
        </button>
        <p className="text-xs mt-2 text-center opacity-80">
          🔒 Secure Checkout
        </p>
      </div>

      <div className="mt-4 p-3 bg-blue-700 rounded-lg">
        <div className="flex items-center space-x-2 text-sm">
          <span>⏰</span>
          <span className="font-medium">Quick Setup</span>
        </div>
        <p className="text-xs mt-1 opacity-90">
          Book your first session within 24 hours
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
