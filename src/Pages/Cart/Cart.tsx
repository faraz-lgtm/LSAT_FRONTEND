import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import CartCard from "./CartCard";
import OrderSummary from "./OrderSummary";

const Cart = () => {
  const { items } = useSelector((state: RootState) => state.cart);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Your Shopping Cart</h2>
          <span className="text-lg text-gray-600 dark:text-gray-300">{items.length} Items in your Cart</span>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">${total}</h2>
          <h2 className="text-lg text-gray-600 dark:text-gray-300">Cart Total</h2>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 dark:text-gray-400">Your cart is empty</p>
        </div>
      ) : (
        <div className="flex w-full max-w-6xl mx-auto gap-8">
          <div className="flex-1">
            <div className="space-y-4">
              {items.map((item) => (
                <CartCard
                  key={item.id}
                  id={item.id}
                  BigText={item.name.split(/[\s-]/)[0]}
                  Desc={item.Description}
                  price={item.price.toString()}
                  quantity={item.quantity}
                />
              ))}
            </div>
          </div>
          <div className="w-80">
            <OrderSummary
              totalPrice={items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
