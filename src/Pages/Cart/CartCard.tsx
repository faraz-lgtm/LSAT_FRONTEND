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
    <div className="flex items-center justify-between border rounded-2xl bg-white shadow-sm p-4 mb-3">
      {/* Left big circle text */}
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-lg">
          {BigText}
        </div>

        {/* Description and price */}
        <div>
          <p className="font-medium text-gray-800">{Desc}</p>
          <p className="text-gray-500">{price}</p>

          {/* Quantity section */}
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-600">Quantity:</span>
            <QuantityController initial={quantity} id={id} />
          </div>
        </div>
      </div>

      {/* Right side: delete + price */}
      <div className="flex flex-col items-end space-y-2">
        <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(id)}>
          <Trash2 size={18} />
        </button>
        <p className="font-semibold text-gray-800">${price}</p>
      </div>
    </div>
  );
};

export default CartCard;
