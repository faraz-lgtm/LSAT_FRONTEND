import { useNavigate } from "react-router-dom";

interface OrderSummaryProps{
    totalPrice:number
}
const OrderSummary = ({totalPrice}:OrderSummaryProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="w-[300px] bg-blue-700 text-white rounded-2xl p-6 shadow-lg h-full min-h-[50vh]">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        {/* <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>$1089.96</span>
        </div>
        <div className="flex justify-between text-sm text-green-300 mb-2">
          <span>Savings (15%)</span>
          <span>- $163.49</span>
        </div> */}
        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total</span>
          <span>${totalPrice}</span>
        </div>
        <div className="flex flex-col justify-end h-[60%]">
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg" onClick={()=>{
            navigate("/Appointment");
          }} >
            Make Appointment
          </button>
          <p className="text-xs mt-2 text-center opacity-80">
            🔒 Secure Checkout
          </p>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;
