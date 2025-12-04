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
  itemSessions:number;
  index: number;
}

const CartCard = ({ id,BigText, Desc, price , quantity, name, index }: CartCardProps) => {
  const dispatch = useDispatch();

  const handleDelete = (id:number) => {
    dispatch(removeFromCart(id));
  };

  const isOdd = index % 2 === 0; // index 0, 2, 4... are odd items (1st, 3rd, 5th...)
  const backgroundColor = isOdd 
    ? 'rgba(50, 185, 106, 0.1)' // Light greenish from --customer-button-green (#32B96A)
    : 'rgba(13, 71, 161, 0.1)'; // Light blue from --customer-primary (#0D47A1)

  return (
    <div 
      className="group relative border rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-all duration-200"
      style={{ 
        borderColor: 'rgb(229, 231, 235)',
        backgroundColor: backgroundColor,
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.borderColor = 'var(--customer-primary)';
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.borderColor = 'rgb(229, 231, 235)';
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Product Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg text-white font-bold text-xs sm:text-sm shadow-md" style={{ background: 'var(--customer-primary-gradient-bottom)' }}>
            {BigText}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2 sm:mb-2.5 line-clamp-1">
            {Desc}
          </p>
          
          {/* Price and Quantity */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</span>
              <QuantityController initial={quantity} id={id} />
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-base font-bold text-gray-900 dark:text-white whitespace-nowrap">
                {price} + tax
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="flex-shrink-0">
          <button 
            className="p-1 sm:p-1.5 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
            onClick={() => handleDelete(id)}
            title="Remove item"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartCard;
