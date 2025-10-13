import { removeFromCart } from "@/redux/cartSlice";
import { Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import QuantityController from "./QuantityController";

interface CartCardProps {
  id:number;
  BigText: string;   // e.g. "5x"
  Desc: string;      // e.g. "5x Prep Session Bundle"
  price: string;     // e.g. "$575.00"
  quantity:number;
}

const CartCard = ({ id,BigText, Desc, price , quantity }: CartCardProps) => {
  const dispatch = useDispatch();

  const handleDelete = (id:number) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-sm p-5 mb-4">
      {/* Left side: Icon and content */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg">
          {BigText}
        </div>

        <div className="flex-1">
          <p className="font-medium text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{Desc}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Individual LSAT tutoring session</p>
          
          <div className="flex items-center space-x-2 mt-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">Quantity:</span>
            <QuantityController initial={quantity} id={id} />
          </div>
        </div>
      </div>

      {/* Right side: Price and Actions */}
      <div className="flex flex-col items-end space-y-2">
        <button 
          className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors" 
          onClick={() => handleDelete(id)}
        >
          <Trash2 size={18} />
        </button>
        <p className="font-semibold text-gray-800 dark:text-gray-200">${price}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">per session</p>
      </div>
    </div>
  );
};

export default CartCard;
