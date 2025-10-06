import { DateTimePicker } from "@/components/ui/dateTimerPicker";
import { updateBookingDate } from "@/redux/cartSlice";
import { addInfo, type InformationState } from "@/redux/informationSlice";
import type { RootState } from "@/redux/rootReducer";
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
      const allSlotsSelected = items.every((item) => item.DateTime?.every((dateTime) => dateTime !== undefined));
      if (!allSlotsSelected) {
        handleError("Please select all the slots");
        return;
      }
      else
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
        if (result?.payment_url) {
          window.location.href = result.payment_url;
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
        <p className="text-gray-700">Prep Session</p>
        <p className="text-gray-700">
          Number of Appointments required:{items.length}
        </p>
        <p className="text-gray-700">Appointments:</p>
        {items.length > 0 ? (
          items.map((item) => {
            // Check if DateTime exists and has items
            if (!item.DateTime || item.DateTime.length === 0) {
              return (
                <p key={item.id} className="text-yellow-600">
                  No DateTime for item {item.id}
                </p>
              );
            }

            return (
              <div key={item.id} className="mb-6">
                <p className="mb-2 font-medium text-gray-700">{item.name}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {item.DateTime.map((dateTime, index) => (
                    <>
                      <div className="flex gap-3 align-middle">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
                          {index + 1}
                        </span>
                        <DateTimePicker
                          packageId={item.id}
                          key={`${item.id}-${index}`}
                          value={
                            dateTime ? new Date(dateTime) : dateTime
                          }
                          onChange={(date) =>
                            dispatch(
                              updateBookingDate({
                                id: item.id,
                                index: index,
                                bookingDate: date.toISOString(),
                              })
                            )
                          }
                        />
                      </div>
                    </>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No appointments available</p>
        )}
      </RightPanel>
    ),
    information: (
      <RightPanel
        title="Your Information"
        footerFn={footerFns["information"]}
        setSelected={setSelected}
      >
        <form className="space-y-4" ref={formRef}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              required
              name="firstName"
              defaultValue={firstName}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              defaultValue={lastName}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={email}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            {/* <input
              type="tel"
              required
              name="phone"
              defaultValue={phone}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            /> */}

            <PhoneInput
              country={"pk"} // default to Pakistan
              value={phone}
              onChange={(val) => setPhoneInp("+" + val)}
              inputClass="!w-full !rounded-lg !border !border-gray-300 px-3 py-2 focus:!outline-none focus:!ring-2 focus:!ring-blue-500"
            />
          </div>

          {/* <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save
          </button> */}
        </form>
      </RightPanel>
    ),

    payments: (
      <RightPanel
        title="Payments"
        footerFn={footerFns["payments"]}
        setSelected={setSelected}
      >
        <p>{items.reduce((acc, item) => acc + item.price, 0)} CAD $</p>
        <p>Note: For USA Students, Prices will be converted at checkout </p>
      </RightPanel>
    ),
  };

  return (
    <>
      <div className="flex">
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

        {/* <DateTimePicker
          value={items?.[0]?.DateTime?.[0] ?? new Date()}
          onChange={(date) =>
            dispatch(
              updateBookingDate({
                id: items?.[0]?.id,
                bookingDate: date.toISOString(),
              })
            )
          }
        /> */}
      </div>
    </>
  );
};
