/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { DateTimePicker } from "@/components/ui/dateTimerPicker";
import { updateBookingDate, updateItemSlots } from "@/redux/cartSlice";
import { addInfo, type InformationState } from "@/redux/informationSlice";
import type { RootState } from "@/redux/store";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCreateOrderMutation } from "@/redux/apiSlices/Order/orderSlice";
import { useGetOrCreateCustomerMutation } from "@/redux/apiSlices/User/userSlice";
import { Terminal, ArrowLeft } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import RightPanel from "./AppointmentRightSidebar";
import GlobalProgressBar from "../../components/GlobalProgressBar";
import { validateCartItemSlots } from "@/utils/slotValidator";
import { fetchSlotsForPackage } from "@/utils/slotFetcher";
import { useCurrencyFormatter } from "@/utils/currency";
import { useCurrency } from "@/context/currency-provider";

const Appointment = () => {
  const navigate = useNavigate();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [getOrCreateCustomer, { isLoading: isCreatingCustomer }] = useGetOrCreateCustomerMutation();
  const [error, setError] = useState("");
  const [isValidatingSlots, setIsValidatingSlots] = useState(false);
  const [slotsRefreshed, setSlotsRefreshed] = useState(false);
  const [slotUpdateKey, setSlotUpdateKey] = useState(0);
  const { items } = useSelector((state: RootState) => state.cart);
  const { firstName, lastName, email, phone } = useSelector(
    (state: RootState) => state.info
  );
  const formatCurrency = useCurrencyFormatter();

  const {currency: selectedCurrency} = useCurrency();
  const [phoneInp, setPhoneInp] = useState(phone || "");

  
  const handleBack = () => {
    if (selected === "information") {
      navigate("/cart");
    } else if (selected === "appointments") {
      setSelected("information");
    }
  };

  const handleNavigateBack = () => {
    navigate("/cart");
  };
  const handleError = (str: string) => {
    setError(str);
    setTimeout(() => setError(""), 3000); // auto hide after 3s
  };

  const dispatch = useDispatch();
  const [selected, setSelected] = useState<
    "appointments" | "information"
  >("information");

  const formRef = useRef<HTMLFormElement>(null);

  // Validate and refresh expired slots when appointments panel is selected
  useEffect(() => {
    const validateAndRefreshSlots = async () => {
      if (items.length === 0) return;
      
      setIsValidatingSlots(true);
      let hasRefreshedSlots = false;
      
      try {
        for (const item of items) {
          if (!item.DateTime || item.DateTime.length === 0) continue;
          
          console.log(`🔍 Validating slots for item ${item.id} (${item.name})`);
          
          // Validate slots for this item
          const validation = await validateCartItemSlots(item);
          
          if (!validation.isValid) {
            console.log(`⚠️ Invalid slots found for item ${item.id}, fetching fresh slots...`);
            
            // Get all already booked slots from other cart items
            const otherItems = items.filter(i => i.id !== item.id);
            const bookedSlots = otherItems.flatMap((cartItem) => 
              cartItem.DateTime || []
            ).filter((slot: string) => slot && slot.trim() !== '');
            
            // Fetch fresh slots for this item
            const requiredSlots = item.sessions || 1;
            const freshSlots = await fetchSlotsForPackage(
              item.id, 
              requiredSlots, 
              new Date().toISOString(), 
              bookedSlots
            );
            
            // Update cart with fresh slots
            dispatch(updateItemSlots({ 
              itemId: item.id, 
              newSlots: freshSlots 
            }));
            
            hasRefreshedSlots = true;
            setSlotUpdateKey(prev => prev + 1); // Force re-render of DateTimePicker components
            console.log(`✅ Refreshed ${freshSlots.length} slots for item ${item.id}`);
          } else {
            console.log(`✅ All slots valid for item ${item.id}`);
          }
        }
        
        if (hasRefreshedSlots) {
          setSlotsRefreshed(true);
          // Auto-hide the notification after 5 seconds
          setTimeout(() => setSlotsRefreshed(false), 5000);
        }
        
      } catch (error) {
        console.error("❌ Error validating/refreshing slots:", error);
        handleError("Failed to validate appointment slots. Please try again.");
      } finally {
        setIsValidatingSlots(false);
      }
    };
    
    if (selected === "appointments") {
      validateAndRefreshSlots();
    }
  }, [selected, items, dispatch]);

  const footerFns: Record<
    "appointments" | "information",
    Function
  > = {
    information: async () => {
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

        if (isComplete(values) || isComplete({ firstName, lastName, email, phone })) {
          try {
            await getOrCreateCustomer(values).unwrap();
            dispatch(addInfo(values));
            setSelected("appointments");
          } catch (error) {
            console.error("Failed to create/get customer:", error);
            handleError("Failed to save customer information. Please try again.");
          }
        } else {
          console.error("Missing field detected");
          handleError("Missing Fields! Please complete the form!");
        }
      }
    },
    appointments: async () => {
      // Prevent multiple order creation attempts
      if (isCreatingOrder) {
        return;
      }

      // add validation to check if all the slots are selected
      const allSlotsSelected = items.every(
        (item) =>
          item.DateTime &&
          item.DateTime.length > 0 &&
          item.DateTime.every((dateTime) => dateTime !== undefined)
      );

      if (!allSlotsSelected) {
        const totalSlots = items.reduce(
          (sum, item) => sum + (item.DateTime?.length || 0),
          0
        );
        const selectedSlots = items.reduce(
          (sum, item) =>
            sum +
            (item.DateTime?.filter((dateTime) => dateTime !== undefined)
              .length || 0),
          0
        );
        handleError(
          `Please select all ${totalSlots} time slots. You have selected ${selectedSlots} out of ${totalSlots}.`
        );
        return;
      }
      
      // Create order directly after appointments are selected
      try {
        const result = await createOrder({
          items: items,
          user: { firstName, lastName, email, phone },
          currency: selectedCurrency,
        }).unwrap(); // unwrap() lets us use try/catch
        console.log("✅ Order created:", result);
        if (result?.data?.url) {
          window.location.href = result.data.url;
        }
      } catch (err) {
        console.error("❌ Failed to create order:", err);
        handleError("Failed to create order. Please try again.");
      }
    },
  };

  const panels: Record<
    "appointments" | "information",
    React.ReactNode
  > = {
    appointments: (
      <RightPanel
        title="Appointments"
        footerFn={footerFns["appointments"]}
        setSelected={setSelected}
        isLoading={isValidatingSlots || isCreatingOrder}
        loadingText={isValidatingSlots ? "Validating Slots..." : "Creating Order..."}
        onNavigateBack={handleNavigateBack}
      >
        <div className="space-y-6">
          {isValidatingSlots && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  Validating appointment slots...
                </p>
              </div>
            </div>
          )}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Prep Session Details
            </h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              You have{" "}
              {items.reduce(
                (total, item) => total + (item.DateTime?.length || 0),
                0
              )}{" "}
              appointment
              {items.reduce(
                (total, item) => total + (item.DateTime?.length || 0),
                0
              ) !== 1
                ? "s"
                : ""}{" "}
              to schedule
            </p>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              We already chose the best time slots for you. You can change them if you want.
            </p>
          </div>

          {items.length > 0 ? (
            items.map((item) => {
              console.log(
                `Item ${item.id} (${item.name}): quantity=${item.quantity}, DateTime length=${item.DateTime?.length}`
              );

              // Check if DateTime exists and has items
              if (!item.DateTime || item.DateTime.length === 0) {
                return (
                  <div
                    key={item.id}
                    className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <p className="text-yellow-800 dark:text-yellow-200">
                      No DateTime slots configured for {item.name}
                    </p>
                  </div>
                );
              }

              // Calculate slots per package
              const slotsPerPackage = Math.ceil(
                item.DateTime.length / item.quantity
              );

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {item.name.split(/[\s-]/)[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {formatCurrency(item.price * 100)} per session
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity} packages
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      Select Time Slots ({item.DateTime?.length || 0} total
                      sessions):
                      {slotsRefreshed && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✨ Updated
                        </span>
                      )}
                    </h5>

                    {/* Group DateTime fields by package */}
                    {Array.from(
                      { length: item.quantity },
                      (_, packageIndex) => {
                        const startIndex = packageIndex * slotsPerPackage;
                        const endIndex = Math.min(
                          startIndex + slotsPerPackage,
                          item.DateTime?.length || 0
                        );
                        const packageSlots =
                          item.DateTime?.slice(startIndex, endIndex) || [];

                        return (
                          <div
                            key={packageIndex}
                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                              <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2">
                                {packageIndex + 1}
                              </span>
                              Package {packageIndex + 1} ({packageSlots.length}{" "}
                              sessions)
                            </h6>
                            <div className="grid grid-cols-1 gap-4">
                              {packageSlots.map((dateTime, slotIndex) => {
                                const globalIndex = startIndex + slotIndex;
                                console.log("dateTime", dateTime);
                                return (
                                  <div
                                    key={`${item.id}-${globalIndex}`}
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                                  >
                                    <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs sm:text-sm font-medium flex-shrink-0">
                                      {slotIndex + 1}
                                    </span>
                                    <div className="flex-1">
                                      <DateTimePicker
                                        key={`${item.id}-${globalIndex}-${slotUpdateKey}`}
                                        packageId={item.id}
                                        value={
                                          dateTime
                                            ? new Date(dateTime)
                                            : undefined
                                        }
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
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                No appointments available
              </p>
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
        isLoading={isCreatingCustomer}
        onNavigateBack={handleNavigateBack}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Contact Information
            </h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm">
              Please provide your contact details to complete your booking
            </p>
          </div>

          <form className="space-y-4 sm:space-y-6" ref={formRef}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  name="firstName"
                  defaultValue={firstName}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
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
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Phone Number *
              </label>
              <PhoneInput
                country={"us"}
                value={phoneInp}
                onChange={(val) => setPhoneInp("+" + val)}
                inputClass="!w-full !rounded-lg !border !border-gray-300 dark:!border-gray-600 px-3 sm:px-4 py-2 sm:py-3 focus:!outline-none focus:!ring-2 focus:!ring-blue-500 dark:!bg-gray-700 dark:!text-white !text-sm sm:!text-base"
              />
            </div>
          </form>
        </div>
      </RightPanel>
    ),
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Determine current step based on selected state
  const getCurrentStep = (): 1 | 2 | 3 | 4 => {
    if (selected === "information") return 3;
    if (selected === "appointments") return 4;
    return 3; // Default to step 3
  };

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-blue-800 dark:to-purple-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse delay-2000"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-15 animate-pulse delay-1500"></div>
      </div>
      {/* Back Button */}
      <div className="relative z-10 max-w-7xl mx-auto mb-4 sm:mb-6 p-4 sm:p-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">
            {selected === "information" ? "Back to Cart" : 
             "Back to Information"}
          </span>
        </button>
      </div>

      {/* Global Progress Bar */}
      <div className="relative z-10 max-w-7xl mx-auto mb-6 px-4 sm:px-6">
        <GlobalProgressBar currentStep={currentStep} />
      </div>

      {/* Cart Total Display */}
      <div className="relative z-10 max-w-7xl mx-auto mb-6 sm:mb-8 hidden sm:block px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Book Your Appointment
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
                Complete your LSAT prep session booking
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(total * 100)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Total Amount
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:gap-6">
          {error && (
            <div className="fixed top-16 right-4 z-50 w-80 animate-in slide-in-from-top-5">
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Incomplete Form!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
          {slotsRefreshed && (
            <div className="fixed top-16 right-4 z-50 w-80 animate-in slide-in-from-top-5">
              <Alert className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Slots Updated!</AlertTitle>
                <AlertDescription>
                  Some appointment slots were no longer available and have been automatically refreshed with new times.
                </AlertDescription>
              </Alert>
            </div>
          )}
          {panels[selected]}
        </div>
      </div>
    </div>
  );
};

export default Appointment;
