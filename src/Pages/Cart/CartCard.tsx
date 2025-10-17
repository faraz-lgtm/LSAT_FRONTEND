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
  name:string;
  itemSessions:number
}

const CartCard = ({ id,BigText, Desc, price , quantity, name, itemSessions }: CartCardProps) => {
  const dispatch = useDispatch();

  const handleDelete = (id:number) => {
    dispatch(removeFromCart(id));
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
      <div className="flex items-start space-x-4">
        {/* Product Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
            {BigText}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 sm:block hidden">
            {Desc}
          </p>
          
          {/* Price and Quantity */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 sm:block hidden">Quantity:</span>
              <QuantityController initial={quantity} id={id} />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                ${price}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                For ${itemSessions} sessions
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0">
          <button 
            className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            onClick={() => handleDelete(id)}
            title="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
