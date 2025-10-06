import { decreaseQuantity, increaseQuantity } from "@/redux/cartSlice";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

interface QuantityControllerProps {
  initial?: number;
  id:number;
}

const QuantityController: React.FC<QuantityControllerProps> = ({ initial = 1 ,id}) => {

  const dispatch = useDispatch();


  const handleIncreaseQuantity = (id:number) => {
    dispatch(increaseQuantity(id));
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
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={() => updateQuantity(quantity - 1,false,true)}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
      >
        <Minus size={16} />
      </button>

      <span className="w-8 text-center font-medium">{quantity}</span>

      <button
        type="button"
        onClick={() => updateQuantity(quantity + 1,true,false)}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};

export default QuantityController;
