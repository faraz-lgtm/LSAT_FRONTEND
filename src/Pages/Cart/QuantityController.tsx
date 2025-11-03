import { decreaseQuantity, increaseQuantityAsync } from "@/redux/cartSlice";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";

interface QuantityControllerProps {
  initial?: number;
  id:number;
}

const QuantityController: React.FC<QuantityControllerProps> = ({ initial = 1 ,id}) => {

  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.cart);

  const handleIncreaseQuantity = (id:number) => {
    dispatch(increaseQuantityAsync(id));
  };
  const handleDecreaseQuantity = (id:number) => {
    dispatch(decreaseQuantity(id));
  };

  const [quantity, setQuantity] = useState(initial);

  const updateQuantity = (newValue: number,increase:boolean=false,decrease:boolean=false) => {
    if(increase){
      handleIncreaseQuantity(id);
    }else if(decrease){
      handleDecreaseQuantity(id);
    }
    if (newValue < 1) return; // prevent going below 1
    setQuantity(newValue);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => updateQuantity(quantity - 1,false,true)}
        disabled={isLoading}
        className={`w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Minus size={12} className="text-gray-600 dark:text-gray-300" />
      </button>

      <span className="w-8 text-center font-semibold text-sm text-gray-900 dark:text-white">
        {quantity}
      </span>

      <button
        type="button"
        onClick={() => updateQuantity(quantity + 1,true,false)}
        disabled={isLoading}
        className={`w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        ) : (
          <Plus size={12} className="text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </div>
  );
};

export default QuantityController;
