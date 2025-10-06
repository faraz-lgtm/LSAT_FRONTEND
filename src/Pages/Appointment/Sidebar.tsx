import { Card, CardContent } from "@/components/ui/card";

type AppointmentSideBarProps = {
  selected: "appointments" | "information" | "payments";
};

export function AppointmentSideBar({ selected }: AppointmentSideBarProps) {
  const items = [
    { key: "appointments", label: "Appointments" },
    { key: "information", label: "Your Information" },
    { key: "payments", label: "Payments" },
  ] as const;


  return (
    <Card className="w-64 rounded-2xl shadow-md bg-blue-900 text-white h-[70vh]">
      <CardContent className="flex flex-col gap-4 py-6">
        <div className="font-bold text-lg">60–Minute Single Prep Session</div>
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const isActive = selected == item.key;
            return (
              <li
                key={item.key}
                className={`flex items-center gap-2 ${
                  isActive ? "text-blue-300" : "opacity-60"
                }`}
              >
                <input
                  type="radio"
                  id={item.key}
                  name="appointment-steps"
                  value={item.key}
                  checked={isActive}
                  disabled
                  // onChange={handleChange}
                  className="accent-blue-300"
                />
                <label
                  htmlFor={item.key}
                  // className={`cursor-pointer ${
                  //   isActive ? "text-blue-300" : "opacity-60"
                  // }`}
                >
                  {item.label}
                </label>
              </li>
            );
          })}
          {/* <li className="flex items-center gap-2 text-blue-300">
            ● Appointments
          </li>
          <li className="flex items-center gap-2 opacity-60">
            ○ Your Information
          </li>
          <li className="flex items-center gap-2 opacity-60">○ Payments</li> */}
        </ul>
        <div className="mt-auto text-sm">
          <p>Get in Touch</p>
          <p className="font-mono">+12898067343</p>
          <p>support@betterlsat.com</p>
        </div>
      </CardContent>
    </Card>
  );
}
