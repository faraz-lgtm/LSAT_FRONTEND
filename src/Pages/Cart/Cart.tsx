import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import CartCard from "./CartCard";
import OrderSummary from "./OrderSummary";
// import { DateTimePicker } from "./ui/dateTimerPicker";

const Cart = () => {
  const { items } = useSelector((state: RootState) => state.cart);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <div>
          <h2 className="text-xl font-bold mb-4">Your Shopping Cart</h2>
          <span className="text-lg mb-4">{items.length}</span>{" "}
          <span className="text-lg mb-4">Items in your Cart</span>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-4"> ${total}</h2>
          <h2 className="text-lg font-bold mb-4">Cart Total</h2>
        </div>
      </div>
      <hr />
      {items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="flex w-full max-w-6xl mx-auto gap-8 py-8">
          <div className="flex-1">
            <ul className="space-y-4">
              {items.map((item) => (
                <CartCard
                  id={item.id}
                  BigText={item.name.split(/[\s-]/)[0]}
                  Desc={item.Description}
                  price={item.price.toString()}
                  quantity={item.quantity}
                />
              ))}
            </ul>
          </div>
          <div className="w-[20vw] ">
            <OrderSummary
              totalPrice={items.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
              )}
            />
          </div>
        </div>
      )}
      {/* <p className="mt-4 font-semibold">Total: ${total.toFixed(2)}</p>
      <div className="flex gap-2">
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white"
          onClick={() => dispatch(clearCart())}
        >
          Clear Cart
        </button>

        <Link
          to={`/Appointment`}
          className="mt-2 px-4 py-2 bg-blue-500 text-white"
        >
          Make Appointment
        </Link>
      </div> */}
    </div>
  );
};

export default Cart;
