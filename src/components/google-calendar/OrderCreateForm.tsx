import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select';
import { Checkbox } from '@/components/dashboard/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, User, Package, Info, AlertTriangle } from 'lucide-react';
import { useGetProductsQuery } from '@/redux/apiSlices/Product/productSlice';
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice';
import { useCreateOrderMutation } from '@/redux/apiSlices/Order/orderSlice';
import { OrderSuccessModal } from '@/components/google-calendar/OrderSuccessModal';
import { DateTimePicker } from '@/components/ui/dateTimerPicker';
import PhoneInput from "react-phone-input-2";
import { useCurrency } from '@/context/currency-provider';
import { useCurrencyFormatter } from '@/utils/currency';
import { fetchSlotsForPackage } from '@/utils/slotFetcher';
import type { SlotInput } from '@/types/api/data-contracts';

interface OrderCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface OrderFormData {
  packageIds: number[];
  selectedSlots: { packageId: number; slots: (SlotInput | undefined)[] }[];
  customerId?: number;
  customerData?: CustomerFormData;
  skipSlotReservation: boolean;
  reservationExpiryMinutes: number;
}

// Reservation time options for configurable slot reservation
const RESERVATION_TIME_OPTIONS = [
  { value: 30, label: '30 minutes (default)' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
  { value: 1080, label: '18 hours' },
  { value: 1440, label: '24 hours' },
];

export const OrderCreateForm: React.FC<OrderCreateFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    packageIds: [],
    selectedSlots: [],
    customerId: undefined,
    customerData: undefined,
    skipSlotReservation: false,
    reservationExpiryMinutes: 30,
  });

  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get products from API
  const { data: productsData, isSuccess: productsSuccess } = useGetProductsQuery();
  const { currency } = useCurrency();
  const formatCurrency = useCurrencyFormatter();
  const products = productsSuccess && productsData ? productsData.data : [];

  // Utility function to convert ProductOutput to Product for cart compatibility
//   const convertProductOutputToProduct = (productOutput: any) => {
//     return {
//       id: productOutput.id,
//       name: productOutput.name,
//       price: productOutput.price,
//       save: productOutput.save || 0,
//       Duration: productOutput.Duration,
//       Description: productOutput.Description,
//       badge: productOutput.badge,
//       DateTime: [],
//       quantity: 1,
//       assignedEmployeeId: 1,
//     };
//   };
  const [orderResult, setOrderResult] = useState<{
    data: {
      url: string;
      sessionId?: string;
      rescheduleUrl?: string;
      isRescheduleFlow?: boolean;
    };
  } | null>(null);

  // Determine how many slots each package needs
  const getSlotsPerPackage = (packageId: number): number => {
    const product = products.find(p => p.id === packageId);
    return product?.sessions || 1;
  };

  // API hooks
  const { data: usersData } = useGetUsersQuery({});
  const [createOrder] = useCreateOrderMutation();

  // Filter users by roles
  const customers = usersData?.data?.filter(user => user.roles.includes('CUST')) || [];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        packageIds: [],
        selectedSlots: [],
        customerId: undefined,
        customerData: undefined,
        skipSlotReservation: false,
        reservationExpiryMinutes: 30,
      });
      setCustomerFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
    }
  }, [isOpen]);

  const handlePackageToggle = async (packageId: number, checked: boolean) => {
    const packageIdNum = packageId;
    const slotsNeeded = getSlotsPerPackage(packageIdNum);
    
    if (checked) {
      // Add package and auto-populate slots
      try {
        // Get all already selected slots from other packages to exclude
        const allSelectedSlots = formData.selectedSlots
          .flatMap(slotData => slotData.slots)
          .filter(slot => slot !== undefined && slot.dateTime)
          .map(slot => slot!.dateTime);
        
        // Fetch available slots for this package
        const fetchedSlots = await fetchSlotsForPackage(
          packageIdNum,
          slotsNeeded,
          new Date().toISOString(),
          allSelectedSlots
        );
        
        // fetchedSlots is already SlotInput[], so use it directly
        setFormData(prev => {
          // Double-check package hasn't been added in the meantime
          if (prev.packageIds.includes(packageIdNum)) {
            return prev;
          }
          
          return {
            ...prev,
            packageIds: [...prev.packageIds, packageIdNum],
            selectedSlots: [
              ...prev.selectedSlots,
              {
                packageId: packageIdNum,
                slots: fetchedSlots
              }
            ],
          };
        });
      } catch (error) {
        console.error('Error fetching slots for package:', error);
        // If fetching fails, still add the package but with undefined slots
        setFormData(prev => {
          if (prev.packageIds.includes(packageIdNum)) {
            return prev;
          }
          
          return {
            ...prev,
            packageIds: [...prev.packageIds, packageIdNum],
            selectedSlots: [
              ...prev.selectedSlots,
              {
                packageId: packageIdNum,
                slots: new Array(slotsNeeded).fill(undefined)
              }
            ],
          };
        });
      }
    } else {
      // Remove package
      setFormData(prev => ({
        ...prev,
        packageIds: prev.packageIds.filter(id => id !== packageIdNum),
        selectedSlots: prev.selectedSlots.filter(slot => slot.packageId !== packageIdNum),
      }));
    }
  };

  const handleSlotChange = (packageId: number, slotIndex: number, slotInput: SlotInput) => {
    setFormData(prev => ({
      ...prev,
      selectedSlots: prev.selectedSlots.map(slotData => 
        slotData.packageId === packageId 
          ? {
              ...slotData,
              slots: slotData.slots.map((slot, index) => 
                index === slotIndex ? slotInput : slot
              )
            }
          : slotData
      ),
    }));
  };

  const handleCustomerSelect = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      customerId: parseInt(customerId),
      customerData: undefined, // Clear customer data when selecting existing customer
    }));
  };

  const handleCustomerFormChange = (field: keyof CustomerFormData, value: string) => {
    setCustomerFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setFormData(prev => ({
      ...prev,
      customerId: undefined, // Clear customer ID when using form data
      customerData: { ...customerFormData, [field]: value },
    }));
  };

  // Helper function to get all selected slots across all packages as Date objects
  const getAllSelectedSlots = (): Date[] => {
    return formData.selectedSlots
      .flatMap(slotData => slotData.slots)
      .filter(slot => slot !== undefined && slot.dateTime)
      .map(slot => {
        const date = new Date(slot!.dateTime);
        return isNaN(date.getTime()) ? null : date;
      })
      .filter((date): date is Date => date !== null);
  };

  // Helper function to get excluded slots for a specific package and slot index
  // This excludes all selected slots except the one currently being edited
  const getExcludedSlots = (packageId: number, slotIndex: number): Date[] => {
    const allSelectedSlots = getAllSelectedSlots();
    const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
    const currentSlot = packageSlots?.slots[slotIndex];
    
    // Return all selected slots except the current one being edited
    return allSelectedSlots.filter(slot => {
      // Don't exclude the slot being edited itself
      if (currentSlot && currentSlot.dateTime) {
        const currentSlotDate = new Date(currentSlot.dateTime);
        if (!isNaN(currentSlotDate.getTime()) && slot.getTime() === currentSlotDate.getTime()) {
          return false;
        }
      }
      return true;
    });
  };

  // Helper function to check if all required slots are selected (or if skip reservation is enabled)
  const isAllSlotsSelected = (): boolean => {
    // If skipping slot reservation, no need to check slots
    if (formData.skipSlotReservation) {
      return true;
    }
    
    for (const packageId of formData.packageIds) {
      const slotsNeeded = getSlotsPerPackage(packageId);
      const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
      const selectedSlotsCount = packageSlots?.slots.filter(slot => slot !== undefined && slot.dateTime && slot.dateTime.trim() !== '').length || 0;
      
      if (selectedSlotsCount !== slotsNeeded) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (formData.packageIds.length === 0) {
      alert('Please select at least one package');
      return;
    }

    // Check if all required slots are selected for each package (only when not skipping reservation)
    if (!formData.skipSlotReservation) {
      for (const packageId of formData.packageIds) {
        const slotsNeeded = getSlotsPerPackage(packageId);
        const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
        const selectedSlotsCount = packageSlots?.slots.filter(slot => slot !== undefined && slot.dateTime && slot.dateTime.trim() !== '').length || 0;
        
        if (selectedSlotsCount !== slotsNeeded) {
          const packageName = products.find(p => p.id === packageId)?.name || 'Unknown Package';
          alert(`Please select all ${slotsNeeded} time slots for ${packageName}. You have selected ${selectedSlotsCount} out of ${slotsNeeded}.`);
          return;
        }
      }
    }

    if (!formData.customerId && !formData.customerData) {
      alert('Please select a customer or fill in customer details');
      return;
    }

    setIsCreatingOrder(true);

    try {
      const orderData = {
        currency: currency,
        items: formData.packageIds.map(packageId => {
          const selectedPackage = products.find(p => p.id === packageId);
          const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
          
          if (!selectedPackage) {
            throw new Error(`Package ${packageId} not found`);
          }

          return {
            id: selectedPackage.id,
            price: selectedPackage.price,
            name: selectedPackage.name,
            save: selectedPackage.save,
            Duration: selectedPackage.Duration,
            Description: selectedPackage.Description,
            DateTime: formData.skipSlotReservation 
              ? [] 
              : (packageSlots?.slots.filter(slot => slot !== undefined && slot.dateTime) as SlotInput[] || []),
            quantity: 1,
            sessions: selectedPackage.sessions,
          };
        }),
        user: formData.customerId 
          ? (() => {
              const customer = customers.find(c => c.id === formData.customerId);
              if (!customer) {
                throw new Error('Selected customer not found');
              }
              return {
                firstName: customer.name.split(' ')[0] || '',
                lastName: customer.name.split(' ').slice(1).join(' ') || '',
                email: customer.email,
                phone: customer.phone
              };
            })()
          : formData.customerData!,
        // Add slot reservation options
        skipSlotReservation: formData.skipSlotReservation,
        reservationExpiryMinutes: formData.skipSlotReservation ? undefined : formData.reservationExpiryMinutes,
      };

      const result = await createOrder(orderData).unwrap();
      setOrderResult(result);
      setShowSuccessModal(true);
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create Order
            </DialogTitle>
            <DialogDescription>
              Select one or more packages, time slots for each package, customer, and optionally assign an employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Select Packages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.filter(product => product.id !== 8).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <Checkbox
                        id={`package-${product.id}`}
                        checked={formData.packageIds.includes(product.id)}
                        onCheckedChange={(checked) => handlePackageToggle(product.id, checked as boolean)}
                      />
                      <label
                        htmlFor={`package-${product.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(product.price * 100)} - {product.Duration} minutes
                          </span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Slot Reservation Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Slot Reservation Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Skip Slot Reservation Checkbox */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <Checkbox
                    id="skip-slot-reservation"
                    checked={formData.skipSlotReservation}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, skipSlotReservation: checked as boolean }))
                    }
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="skip-slot-reservation"
                      className="font-medium cursor-pointer flex items-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Skip Slot Reservation
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      When enabled, slots won't be reserved upfront. Customer will receive a reschedule link 
                      to book their appointments and then proceed to checkout.
                    </p>
                  </div>
                </div>

                {/* Reservation Time Configuration */}
                {!formData.skipSlotReservation && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="reservation-time">Reservation Duration</Label>
                      <div className="group relative">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border z-50">
                          How long the slot will be reserved for the customer to complete payment. 
                          After this time, the slot becomes available to other customers.
                        </div>
                      </div>
                    </div>
                    <Select 
                      value={formData.reservationExpiryMinutes.toString()} 
                      onValueChange={(value) => 
                        setFormData(prev => ({ ...prev, reservationExpiryMinutes: parseInt(value) }))
                      }
                    >
                      <SelectTrigger id="reservation-time">
                        <SelectValue placeholder="Select reservation duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESERVATION_TIME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Use longer durations (12-24 hours) if the customer needs more time to complete payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Time Slots Selection - Only show when NOT skipping slot reservation */}
            {formData.packageIds.length > 0 && !formData.skipSlotReservation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Select Time Slots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {formData.packageIds.map((packageId) => {
                      const packageData = products.find(p => p.id === packageId);
                      const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
                      const slotsNeeded = getSlotsPerPackage(packageId);
                      
                      return (
                        <div key={packageId} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <h4 className="font-medium">{packageData?.name}</h4>
                            <span className="text-sm text-muted-foreground">
                              ({slotsNeeded} slots required)
                            </span>
                          </div>
                          <div className="space-y-3 ml-6">
                            {Array.from({ length: slotsNeeded }, (_, index) => (
                              <div key={index} className="flex items-center gap-4">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium flex-shrink-0">
                                  {index + 1}
                                </span>
                                <DateTimePicker
                                  packageId={packageId}
                                  value={
                                    packageSlots?.slots[index] && packageSlots.slots[index]?.dateTime
                                      ? (() => {
                                          const parsedDate = new Date(packageSlots.slots[index]!.dateTime);
                                          return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
                                        })()
                                      : undefined
                                  }
                                  onChange={(slotInput) => handleSlotChange(packageId, index, slotInput)}
                                  excludedSlots={getExcludedSlots(packageId, index)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="existing" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="existing">Existing Customer</TabsTrigger>
                    <TabsTrigger value="new">New Customer</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="existing" className="space-y-4">
                    <Select onValueChange={handleCustomerSelect} value={formData.customerId?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select existing customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} ({customer.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TabsContent>
                  
                  <TabsContent value="new" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={customerFormData.firstName}
                          onChange={(e) => handleCustomerFormChange('firstName', e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={customerFormData.lastName}
                          onChange={(e) => handleCustomerFormChange('lastName', e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerFormData.email}
                        onChange={(e) => handleCustomerFormChange('email', e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <PhoneInput
                        country={"pk"}
                        value={customerFormData.phone.replace('+', '')}
                        onChange={(val) => handleCustomerFormChange('phone', "+" + val)}
                        inputClass="!w-full !rounded-lg !border !border-gray-300 dark:!border-gray-600 px-4 py-3 focus:!outline-none focus:!ring-2 focus:!ring-blue-500 dark:!bg-gray-700 dark:!text-white"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isCreatingOrder || formData.packageIds.length === 0 || !isAllSlotsSelected()}
            >
              {isCreatingOrder ? 'Creating Order...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      {showSuccessModal && orderResult && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          orderResult={orderResult}
        />
      )}
    </>
  );
};
