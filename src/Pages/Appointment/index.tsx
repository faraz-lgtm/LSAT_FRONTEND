/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { DateTimePicker } from "@/components/ui/dateTimerPicker";
import { updateBookingDate, updateItemSlots } from "@/redux/cartSlice";
import { addInfo, type InformationState } from "@/redux/informationSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useGetProductsQuery } from "@/redux/apiSlices/Product/productSlice";
import { addToCartAsync } from "@/redux/cartSlice";
import type { ItemInput } from "@/types/api/data-contracts";
import { getOrganizationSlugFromUrl } from "../../utils/organization";

/**
 * Detect user's country code based on browser locale and timezone
 * @returns ISO 3166-1 alpha-2 country code (lowercase) or "us" as fallback
 */
const detectUserCountry = (): string => {
  if (typeof window === 'undefined') return 'us';
  
  try {
    // Method 1: Use timezone to infer country (MOST RELIABLE)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    if (timezone) {
      // Map timezone to country codes
      const timezoneToCountry: Record<string, string> = {
        // US Timezones
        'America/New_York': 'us',
        'America/Detroit': 'us',
        'America/Kentucky/Louisville': 'us',
        'America/Kentucky/Monticello': 'us',
        'America/Indiana/Indianapolis': 'us',
        'America/Indiana/Vincennes': 'us',
        'America/Indiana/Winamac': 'us',
        'America/Indiana/Marengo': 'us',
        'America/Indiana/Petersburg': 'us',
        'America/Indiana/Vevay': 'us',
        'America/Indiana/Tell_City': 'us',
        'America/Indiana/Knox': 'us',
        'America/Menominee': 'us',
        'America/North_Dakota/Center': 'us',
        'America/North_Dakota/New_Salem': 'us',
        'America/North_Dakota/Beulah': 'us',
        'America/Chicago': 'us',
        'America/Denver': 'us',
        'America/Boise': 'us',
        'America/Phoenix': 'us',
        'America/Los_Angeles': 'us',
        'America/Anchorage': 'us',
        'America/Juneau': 'us',
        'America/Sitka': 'us',
        'America/Metlakatla': 'us',
        'America/Yakutat': 'us',
        'America/Nome': 'us',
        'America/Adak': 'us',
        'America/Honolulu': 'us',
        // Canada Timezones
        'America/Toronto': 'ca',
        'America/Montreal': 'ca',
        'America/Vancouver': 'ca',
        'America/Winnipeg': 'ca',
        'America/Edmonton': 'ca',
        'America/Halifax': 'ca',
        'America/St_Johns': 'ca',
        'America/Whitehorse': 'ca',
        'America/Yellowknife': 'ca',
        'America/Inuvik': 'ca',
        'America/Dawson': 'ca',
        'America/Iqaluit': 'ca',
        'America/Blanc-Sablon': 'ca',
        'America/Glace_Bay': 'ca',
        'America/Goose_Bay': 'ca',
        'America/Moncton': 'ca',
        'America/Thunder_Bay': 'ca',
        // UK Timezones
        'Europe/London': 'gb',
        // Australia Timezones
        'Australia/Sydney': 'au',
        'Australia/Melbourne': 'au',
        'Australia/Brisbane': 'au',
        'Australia/Perth': 'au',
        'Australia/Adelaide': 'au',
        'Australia/Darwin': 'au',
        'Australia/Hobart': 'au',
        // New Zealand Timezones
        'Pacific/Auckland': 'nz',
        'Pacific/Chatham': 'nz',
        // Pakistan Timezones
        'Asia/Karachi': 'pk',
        'Asia/Islamabad': 'pk',
        // India Timezones
        'Asia/Kolkata': 'in',
        'Asia/Calcutta': 'in',
        // Other Asian countries
        'Asia/Dubai': 'ae',
        'Asia/Riyadh': 'sa',
        'Asia/Tokyo': 'jp',
        'Asia/Shanghai': 'cn',
        'Asia/Hong_Kong': 'hk',
        'Asia/Singapore': 'sg',
        'Asia/Bangkok': 'th',
        'Asia/Kuala_Lumpur': 'my',
        'Asia/Jakarta': 'id',
        'Asia/Manila': 'ph',
        'Asia/Ho_Chi_Minh': 'vn',
        // European Timezones
        'Europe/Paris': 'fr',
        'Europe/Berlin': 'de',
        'Europe/Madrid': 'es',
        'Europe/Rome': 'it',
        'Europe/Amsterdam': 'nl',
        'Europe/Brussels': 'be',
        'Europe/Vienna': 'at',
        'Europe/Lisbon': 'pt',
        'Europe/Athens': 'gr',
        'Europe/Helsinki': 'fi',
        'Europe/Dublin': 'ie',
        // Other
        'America/Mexico_City': 'mx',
        'America/Sao_Paulo': 'br',
      };
      
      // Check exact timezone match
      const countryFromTimezone = timezoneToCountry[timezone];
      if (countryFromTimezone) {
        return countryFromTimezone;
      }
      
      // Check by region and city patterns
      const [region, ...cityParts] = timezone.split('/');
      const city = cityParts.join('_').toLowerCase();
      
      if (region === 'America') {
        if (city.includes('toronto') || city.includes('montreal') || city.includes('vancouver') || 
            city.includes('winnipeg') || city.includes('edmonton') || city.includes('halifax')) {
          return 'ca';
        }
        if (city.includes('mexico')) {
          return 'mx';
        }
        if (city.includes('sao_paulo') || city.includes('rio') || city.includes('brasilia')) {
          return 'br';
        }
        // Default America to US
        return 'us';
      }
      
      if (region === 'Europe') {
        if (city.includes('london')) return 'gb';
        if (city.includes('paris')) return 'fr';
        if (city.includes('berlin')) return 'de';
        if (city.includes('madrid')) return 'es';
        if (city.includes('rome')) return 'it';
        if (city.includes('amsterdam')) return 'nl';
        if (city.includes('brussels')) return 'be';
        if (city.includes('vienna')) return 'at';
        if (city.includes('lisbon')) return 'pt';
        if (city.includes('athens')) return 'gr';
        if (city.includes('helsinki')) return 'fi';
        if (city.includes('dublin')) return 'ie';
      }
      
      if (region === 'Asia') {
        if (city.includes('karachi') || city.includes('islamabad') || city.includes('lahore')) {
          return 'pk';
        }
        if (city.includes('mumbai') || city.includes('delhi') || city.includes('kolkata') || city.includes('bangalore')) {
          return 'in';
        }
        if (city.includes('dubai')) return 'ae';
        if (city.includes('riyadh')) return 'sa';
        if (city.includes('tokyo')) return 'jp';
        if (city.includes('shanghai') || city.includes('beijing')) return 'cn';
        if (city.includes('hong_kong')) return 'hk';
        if (city.includes('singapore')) return 'sg';
        if (city.includes('bangkok')) return 'th';
        if (city.includes('kuala_lumpur')) return 'my';
        if (city.includes('jakarta')) return 'id';
        if (city.includes('manila')) return 'ph';
        if (city.includes('ho_chi_minh') || city.includes('hanoi')) return 'vn';
      }
      
      if (region === 'Australia') {
        return 'au';
      }
      
      if (region === 'Pacific') {
        if (city.includes('auckland') || city.includes('chatham')) {
          return 'nz';
        }
      }
    }
    
    // Method 2: Fallback to locale if timezone detection failed
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';
    const parts = locale.split('-');
    const countryCode = parts[1]?.toLowerCase();
    
    if (countryCode && countryCode.length === 2) {
      return countryCode;
    }
    
    // Fallback to US
    return 'us';
  } catch (error) {
    console.warn('Country detection failed:', error);
    return 'us';
  }
};

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isFreePurchase = location.pathname.includes('/free_purchase');
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const [getOrCreateCustomer, { isLoading: isCreatingCustomer }] = useGetOrCreateCustomerMutation();
  const { data: productsData, isSuccess: productsSuccess } = useGetProductsQuery();
  const [error, setError] = useState("");
  const [isValidatingSlots, setIsValidatingSlots] = useState(false);
  const [slotsRefreshed, setSlotsRefreshed] = useState(false);
  const [slotUpdateKey, setSlotUpdateKey] = useState(0);
  const { items: allItems } = useSelector((state: RootState) => state.cart);
  const { firstName, lastName, email, phone } = useSelector(
    (state: RootState) => state.info
  );
  const { organizationId, organizationSlug } = useSelector((state: RootState) => state.auth);
  const formatCurrency = useCurrencyFormatter();
  
  // Get organization slug from URL
  const currentSlug = getOrganizationSlugFromUrl(organizationSlug);

  const {currency: selectedCurrency} = useCurrency();
  const [phoneInp, setPhoneInp] = useState(phone || "");
  const defaultCountry = detectUserCountry();
  
  // Filter items to only package ID 8 for free purchase route
  // For paid purchases route, exclude free package (id === 8)
  const items = isFreePurchase 
    ? allItems.filter(item => item.id === 8)
    : allItems.filter(item => item.id !== 8);

  
  const handleBack = () => {
    if (selected === "information") {
      if (isFreePurchase) {
        const homePath = currentSlug ? `/${currentSlug}` : "/";
        navigate(homePath);
      } else {
        const cartPath = currentSlug ? `/${currentSlug}/cart` : "/cart";
        navigate(cartPath);
      }
    } else if (selected === "appointments") {
      setSelected("information");
    }
  };

  const handleNavigateBack = () => {
    if (isFreePurchase) {
      const homePath = currentSlug ? `/${currentSlug}` : "/";
      navigate(homePath);
    } else {
      const cartPath = currentSlug ? `/${currentSlug}/cart` : "/cart";
      navigate(cartPath);
    }
  };
  const handleError = (str: string) => {
    setError(str);
    setTimeout(() => setError(""), 3000); // auto hide after 3s
  };

  const dispatch = useDispatch<AppDispatch>();
  const [selected, setSelected] = useState<
    "appointments" | "information"
  >("information");

  const formRef = useRef<HTMLFormElement>(null);
  const hasValidatedOnLoad = useRef(false);
  const hasLoadedFreePackage = useRef(false);

  // Auto-load package ID 8 when accessing /free_purchase route
  useEffect(() => {
    if (isFreePurchase && productsSuccess && productsData && !hasLoadedFreePackage.current) {
      const freePackage = productsData.data.find(p => p.id === 8);
      if (freePackage && !allItems.some(item => item.id === 8)) {
        hasLoadedFreePackage.current = true;
        const itemInput: ItemInput = {
          id: freePackage.id,
          name: freePackage.name,
          price: freePackage.price,
          Duration: freePackage.Duration,
          Description: freePackage.Description,
          DateTime: [],
          quantity: 1,
          sessions: freePackage.sessions || 1,
        };
        dispatch(addToCartAsync(itemInput));
      }
    }
  }, [isFreePurchase, productsSuccess, productsData, allItems, dispatch]);

  // Reset validation flag when switching away from appointments panel
  useEffect(() => {
    if (selected !== "appointments") {
      hasValidatedOnLoad.current = false;
    }
  }, [selected]);

  // Validate and refresh expired slots only on initial page load when appointments panel is selected
  useEffect(() => {
    const validateAndRefreshSlots = async () => {
      if (items.length === 0) return;
      
      // Only validate once on initial panel selection, not on every date change
      if (hasValidatedOnLoad.current) return;
      
      setIsValidatingSlots(true);
      let hasRefreshedSlots = false;
      
      try {
        // Store initial items snapshot for validation
        const initialItems = [...items];
        
        for (const item of initialItems) {
          if (!item.DateTime || item.DateTime.length === 0) continue;
          
          console.log(`🔍 Validating slots for item ${item.id} (${item.name})`);
          
          // Validate slots for this item
          const validation = await validateCartItemSlots(item);
          
          if (!validation.isValid) {
            console.log(`⚠️ Invalid slots found for item ${item.id}, fetching fresh slots...`);
            
            // Get all already booked slots from other cart items
            const otherItems = initialItems.filter(i => i.id !== item.id);
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
        
        // Mark as validated so it won't run again
        hasValidatedOnLoad.current = true;
        
        if (hasRefreshedSlots) {
          setSlotsRefreshed(true);
          // Auto-hide the notification after 5 seconds
          setTimeout(() => setSlotsRefreshed(false), 5000);
        }
        
      } catch (error) {
        console.error("❌ Error validating/refreshing slots:", error);
        handleError("Failed to validate appointment slots. Please try again.");
        hasValidatedOnLoad.current = true; // Mark as validated even on error to prevent retry loops
      } finally {
        setIsValidatingSlots(false);
      }
    };
    
    if (selected === "appointments" && !hasValidatedOnLoad.current) {
      validateAndRefreshSlots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, dispatch]); // Removed 'items' from dependencies to prevent re-validation on date changes

  const footerFns: Record<
    "appointments" | "information",
    () => Promise<void> | void
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
            // Include organizationId in the request if available
            const customerData = organizationId 
              ? { ...values, organizationId } as any
              : values
            
            await getOrCreateCustomer(customerData).unwrap();
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
        
        // For free purchase route, redirect to confirmation page
        if (isFreePurchase) {
          window.location.href = "https://betterlsat.com/confirmation/";
        } else if (result?.data?.url) {
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
        title="Schedule Your Sessions"
        footerFn={footerFns["appointments"]}
        setSelected={setSelected}
        isLoading={isValidatingSlots || isCreatingOrder}
        loadingText={isValidatingSlots ? "Validating Slots..." : "Creating Order..."}
        onNavigateBack={handleNavigateBack}
        hideFooter={true}
      >
        <div className="flex flex-col w-full p-3">
          {/* Fixed header section */}
          <div className="flex-shrink-0 space-y-3 mb-4">
            {isValidatingSlots && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2.5 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-yellow-600"></div>
                  <p className="text-yellow-800 dark:text-yellow-200 text-[10px] sm:text-xs">
                    Validating appointment slots...
                  </p>
                </div>
              </div>
            )}
            <div className="p-4 sm:p-5 rounded-xl border-2 shadow-lg mb-4" style={{ background: 'var(--customer-primary-gradient)', borderColor: 'var(--customer-primary)' }}>
              <h3 className="font-bold text-white mb-2.5 text-base sm:text-lg">
                Prep Session Details
              </h3>
              <p className="font-semibold mb-2 text-sm sm:text-base" style={{ color: 'var(--customer-text-white)' }}>
                You have{" "}
                <span className="text-yellow-300 dark:text-yellow-200 font-extrabold text-base sm:text-lg">
                  {items.reduce(
                    (total, item) => total + (item.DateTime?.length || 0),
                    0
                  )}
                </span>{" "}
                appointment
                {items.reduce(
                  (total, item) => total + (item.DateTime?.length || 0),
                  0
                ) !== 1
                  ? "s"
                  : ""}{" "}
                to schedule
              </p>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--customer-text-white)' }}>
                We've pre-selected the best available times for you. 
                Tap any slot to adjust or reschedule
              </p>
            </div>

            {items.length === 0 && (
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

          {/* DateTimePickers area - natural flow with scroll */}
          <div className="space-y-3 pr-1">
            {items.length > 0 && items.map((item) => {
              if (!item.DateTime || item.DateTime.length === 0) return null;

              const slotsPerPackage = Math.ceil(
                item.DateTime.length / item.quantity
              );

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
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
                          className={`${packageIndex > 0 ? 'mt-3' : ''} p-2.5 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600`}
                        >
                          <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center text-[10px] sm:text-xs">
                            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-white text-[9px] sm:text-[10px] font-bold mr-1.5" style={{ backgroundColor: 'var(--customer-primary)' }}>
                              {packageIndex + 1}
                            </span>
                            {item.quantity > 1 ? `${item.name} - Package ${packageIndex + 1}` : item.name} ({packageSlots.length}{" "}
                            sessions)
                          </h6>
                          <div className="grid grid-cols-1 gap-2">
                            {packageSlots.map((dateTime, slotIndex) => {
                              const globalIndex = startIndex + slotIndex;
                              console.log("dateTime", dateTime);
                              return (
                                <div
                                  key={`${item.id}-${globalIndex}`}
                                  className="flex flex-row items-center gap-2"
                                >
                                  <span className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: 'var(--customer-primary-rgba-10)', color: 'var(--customer-primary)' }}>
                                    {slotIndex + 1}
                                  </span>
                                  <div className="flex-1 min-w-0">
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
              );
            })}
          </div>

          {/* Checkout button - sticky at bottom on all screens */}
          <div className="flex-shrink-0 pt-3 mt-3 flex justify-end sticky bottom-4 z-50 lg:fixed lg:bottom-6 lg:right-6 lg:pt-0 lg:mt-0">
            <button
              onClick={() => footerFns["appointments"]()}
              disabled={isValidatingSlots || isCreatingOrder}
              type="button"
              className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm min-w-[100px] sm:min-w-[120px] lg:shadow-xl lg:hover:shadow-2xl ${
                isValidatingSlots || isCreatingOrder
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'text-white'
              }`}
              style={!(isValidatingSlots || isCreatingOrder) ? { backgroundColor: 'var(--customer-button-orange)' } : undefined}
            >
              {isValidatingSlots || isCreatingOrder ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                  <span className="text-[10px] sm:text-xs">
                    {isValidatingSlots ? "Validating Slots..." : "Creating Order..."}
                  </span>
                </div>
              ) : (
                "Checkout"
              )}
            </button>
          </div>
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
        <div className="space-y-3 pb-20 sm:pb-2">
          <form className="space-y-3" ref={formRef}>
            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                name="firstName"
                defaultValue={firstName}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 focus:outline-none focus:ring-2 dark:bg-gray-700 text-gray-900 dark:text-gray-900 text-sm"
                style={{ '--tw-ring-color': 'var(--customer-primary)' } as React.CSSProperties}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--customer-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = ''; }}
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                required
                defaultValue={lastName}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 focus:outline-none focus:ring-2 dark:bg-gray-700 text-gray-900 dark:text-gray-900 text-sm"
                style={{ '--tw-ring-color': 'var(--customer-primary)' } as React.CSSProperties}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--customer-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = ''; }}
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                defaultValue={email}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 focus:outline-none focus:ring-2 dark:bg-gray-700 text-gray-900 dark:text-gray-900 text-sm"
                style={{ '--tw-ring-color': 'var(--customer-primary)' } as React.CSSProperties}
                onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px var(--customer-primary)'; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = ''; }}
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                Phone Number *
              </label>
              <PhoneInput
                country={defaultCountry}
                value={phoneInp}
                onChange={(val) => setPhoneInp("+" + val)}
                inputClass="!w-full !rounded-lg !border !border-gray-300 dark:!border-gray-600 px-2.5 py-1.5 focus:!outline-none focus:!ring-2 dark:!bg-gray-700 !text-gray-900 dark:!text-gray-900 !text-sm phone-input-focus"
                containerStyle={{ '--focus-ring-color': 'var(--customer-primary)' } as React.CSSProperties}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => footerFns["information"]()}
                disabled={isCreatingCustomer}
                type="button"
                className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm min-w-[100px] sm:min-w-[120px] fixed bottom-3 left-6 right-6 max-w-[calc(100%-3rem)] sm:max-w-none sm:static sm:bottom-auto sm:left-auto sm:right-auto z-50 ${
                  isCreatingCustomer 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'text-white'
                }`}
                style={!isCreatingCustomer ? { backgroundColor: 'var(--customer-button-orange)' } : undefined}
              >
                {isCreatingCustomer ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                    <span className="text-[10px] sm:text-xs">Creating Customer...</span>
                  </div>
                ) : (
                  "Continue"
                )}
              </button>
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
    <div className="min-h-screen customer-page-bg relative flex flex-col">
      {/* Main Content Section */}
      <div className="relative z-10 py-4 sm:py-6 pb-32 sm:pb-6 lg:pb-6">
        <div className="customer-container customer-content w-full">
          {/* Top Section - Fixed Height */}
          <div className="flex-shrink-0 space-y-2 mb-4">
          {/* Back Button */}
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md text-xs"
            >
              <ArrowLeft size={16} />
              <span className="font-medium">
                {selected === "information" ? "Back to Cart" : 
                 "Back to Information"}
              </span>
            </button>
          </div>

          {/* Global Progress Bar - Hidden for free purchase */}
          {!isFreePurchase && <GlobalProgressBar currentStep={currentStep} />}

          {/* Cart Total Display - Only show on information step */}
          {selected === "information" && (
            <div className="hidden sm:block w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Enter Your Details to Continue
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                  We'll use this information to confirm your sessions and send your schedule.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-lg sm:text-xl font-bold" style={{ color: 'var(--customer-primary)' }}>
                    {formatCurrency(total * 100)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total Amount
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Natural flow */}
        <div className="flex-1 w-full">
          <div className="flex flex-col">
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
            <div className="w-full">
              {panels[selected]}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
