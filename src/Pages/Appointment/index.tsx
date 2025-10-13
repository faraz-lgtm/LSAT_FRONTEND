import { DateTimePicker } from "@/components/ui/dateTimerPicker";
import { updateBookingDate } from "@/redux/cartSlice";
import { addInfo, type InformationState } from "@/redux/informationSlice";
import type { RootState } from "@/redux/store";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCreateOrderMutation } from "@/redux/apiSlices/Order/orderSlice";
import { Terminal } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import RightPanel from "./AppointmentRightSidebar";
import { AppointmentSideBar } from "./Sidebar";

export default () => {
  // const navigate = useNavigate();
  const [createOrder] = useCreateOrderMutation();
  const [error, setError] = useState("");
  const [phoneInp, setPhoneInp] = useState("");
  const { items } = useSelector((state: RootState) => state.cart);
  const { firstName, lastName, email, phone } = useSelector(
    (state: RootState) => state.info
  );
  const handleError = (str: string) => {
    setError(str);
    setTimeout(() => setError(""), 3000); // auto hide after 3s
  };

  const dispatch = useDispatch();
  const [selected, setSelected] = useState<
    "appointments" | "information" | "payments"
  >("appointments");

  const formRef = useRef<HTMLFormElement>(null);

  const footerFns: Record<
    "appointments" | "information" | "payments",
    Function
  > = {
    appointments: () => {
      // add validation to check if all the slots are selected
      const allSlotsSelected = items.every((item) => 
        item.DateTime && 
        item.DateTime.length > 0 && 
        item.DateTime.every((dateTime) => dateTime !== undefined)
      );
      
      if (!allSlotsSelected) {
        const totalSlots = items.reduce((sum, item) => sum + (item.DateTime?.length || 0), 0);
        const selectedSlots = items.reduce((sum, item) => 
          sum + (item.DateTime?.filter(dateTime => dateTime !== undefined).length || 0), 0
        );
        handleError(`Please select all ${totalSlots} time slots. You have selected ${selectedSlots} out of ${totalSlots}.`);
        return;
      }
      setSelected("information");
    },
    information: () => {
      if (formRef.current) {
        const data = new FormData(formRef.current);
        const values: InformationState = {
          firstName: (data.get("firstName") as string) || "",
          lastName: (data.get("lastName") as string) || "",
          email: (data.get("email") as string) || "",
          phone: phoneInp || "",
        };
        const isComplete = (info: InformationState) =>
          !!(info.firstName && info.lastName && info.email && info.phone);

        if (
          isComplete(values) ||
          isComplete({ firstName, lastName, email, phone })
        ) {
          dispatch(addInfo(values)); // <-- save in redux
          setSelected("payments");
        } else {
          console.error("Missing field detected");
          handleError("Missing Fields! Please complete the form!");
        }
      }
    },
    payments: async () => {
      //make the API Call
      try {
        const result = await createOrder({
          items: items,
          user: { firstName, lastName, email, phone },
        }).unwrap(); // unwrap() lets us use try/catch
        console.log("✅ Order created:", result);
        if (result?.url) {
          window.location.href = result.url;
        }
      } catch (err) {
        console.error("❌ Failed to create order:", err);
      }
    },
  };

  const panels: Record<
    "appointments" | "information" | "payments",
    React.ReactNode
  > = {
    appointments: (
      <RightPanel
        title="Appointments"
        footerFn={footerFns["appointments"]}
        setSelected={setSelected}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Prep Session Details</h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              You have {items.reduce((total, item) => total + (item.DateTime?.length || 0), 0)} appointment{items.reduce((total, item) => total + (item.DateTime?.length || 0), 0) !== 1 ? 's' : ''} to schedule
            </p>
          </div>

          {items.length > 0 ? (
            items.map((item) => {
              console.log(`Item ${item.id} (${item.name}): quantity=${item.quantity}, DateTime length=${item.DateTime?.length}`);
              
              // Check if DateTime exists and has items
              if (!item.DateTime || item.DateTime.length === 0) {
                return (
                  <div key={item.id} className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      No DateTime slots configured for {item.name}
                    </p>
                  </div>
                );
              }

              // Calculate slots per package
              const slotsPerPackage = Math.ceil(item.DateTime.length / item.quantity);
              
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {item.name.split(/[\s-]/)[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">${item.price} per session</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Quantity: {item.quantity} packages</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      Select Time Slots ({item.DateTime?.length || 0} total sessions):
                    </h5>
                    
                    {/* Group DateTime fields by package */}
                    {Array.from({ length: item.quantity }, (_, packageIndex) => {
                      const startIndex = packageIndex * slotsPerPackage;
                      const endIndex = Math.min(startIndex + slotsPerPackage, item.DateTime?.length || 0);
                      const packageSlots = item.DateTime?.slice(startIndex, endIndex) || [];
                      
                      return (
                        <div key={packageIndex} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                              {packageIndex + 1}
                            </span>
                            Package {packageIndex + 1} ({packageSlots.length} sessions)
                          </h6>
                          <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
                            {packageSlots.map((dateTime, slotIndex) => {
                              const globalIndex = startIndex + slotIndex;
                              return (
                                <div key={`${item.id}-${globalIndex}`} className="flex items-center gap-4">
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium flex-shrink-0">
                                    {slotIndex + 1}
                                  </span>
                                  <DateTimePicker
                                    packageId={item.id}
                                    value={dateTime ? new Date(dateTime) : dateTime}
                                    onChange={(date) =>
                                      dispatch(
                                        updateBookingDate({
                                          id: item.id,
                                          index: globalIndex,
                                          bookingDate: date.toISOString(),
                                        })
                                      )
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">No appointments available</p>
            </div>
          )}
        </div>
      </RightPanel>
    ),
    information: (
      <RightPanel
        title="Your Information"
        footerFn={footerFns["information"]}
        setSelected={setSelected}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Contact Information</h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              Please provide your contact details to complete your booking
            </p>
          </div>

          <form className="space-y-6" ref={formRef}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  name="firstName"
                  defaultValue={firstName}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  defaultValue={lastName}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue={email}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Phone Number *
              </label>
              <PhoneInput
                country={"pk"}
                value={phone}
                onChange={(val) => setPhoneInp("+" + val)}
                inputClass="!w-full !rounded-lg !border !border-gray-300 dark:!border-gray-600 px-4 py-3 focus:!outline-none focus:!ring-2 focus:!ring-blue-500 dark:!bg-gray-700 dark:!text-white"
              />
            </div>
          </form>
        </div>
      </RightPanel>
    ),

    payments: (
      <RightPanel
        title="Payments"
        footerFn={footerFns["payments"]}
        setSelected={setSelected}
      >
        <div className="space-y-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Payment Summary</h3>
            <p className="text-green-700 dark:text-green-200 text-sm">
              Review your order details before proceeding to payment
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Order Details</h4>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${items.reduce((acc, item) => acc + item.price * item.quantity, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Payment Information</h4>
                <p className="text-blue-700 dark:text-blue-200 text-sm">
                  For USA Students, prices will be converted at checkout based on current exchange rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </RightPanel>
    ),
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Cart Total Display */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Your Appointment</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Complete your LSAT prep session booking</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">${total}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-6">
          <AppointmentSideBar selected={selected} />
          {error && (
            <div className="fixed top-16 right-4 z-50 w-80 animate-in slide-in-from-top-5">
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Incomplete Form!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {panels[selected]}
        </div>
      </div>
    </div>
  );
};
