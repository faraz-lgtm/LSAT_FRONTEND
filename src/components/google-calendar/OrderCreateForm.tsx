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
import { Clock, User, Package } from 'lucide-react';
import { useGetProductsQuery } from '@/redux/apiSlices/Product/productSlice';
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice';
import { useCreateOrderMutation } from '@/redux/apiSlices/Order/orderSlice';
import { OrderSuccessModal } from '@/components/google-calendar/OrderSuccessModal';
import { DateTimePicker } from '@/components/ui/dateTimerPicker';
import PhoneInput from "react-phone-input-2";
import { useCurrency } from '@/context/currency-provider';
import { useCurrencyFormatter } from '@/utils/currency';

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
  selectedSlots: { packageId: number; slots: (Date | undefined)[] }[];
  customerId?: number;
  customerData?: CustomerFormData;
}

export const OrderCreateForm: React.FC<OrderCreateFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    packageIds: [],
    selectedSlots: [],
    customerId: undefined,
    customerData: undefined,
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
      sessionId: string;
    };
  } | null>(null);

  // Determine how many slots each package needs
  const getSlotsPerPackage = (packageId: number): number => {
    switch (packageId) {
      case 5: // 60-Minute Single Prep
        return 1;
      case 6: // 5X Prep Session Bundle
        return 5;
      case 7: // 10X Prep Session Bundle
        return 10;
      default:
        return 1;
    }
  };

  // API hooks
  const { data: usersData } = useGetUsersQuery();
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
      });
      setCustomerFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });
    }
  }, [isOpen]);

  const handlePackageToggle = (packageId: number, checked: boolean) => {
    const packageIdNum = packageId;
    const slotsNeeded = getSlotsPerPackage(packageIdNum);
    
    setFormData(prev => {
      let newPackageIds = [...prev.packageIds];
      let newSelectedSlots = [...prev.selectedSlots];
      
      if (checked) {
        // Add package
        if (!newPackageIds.includes(packageIdNum)) {
          newPackageIds.push(packageIdNum);
          newSelectedSlots.push({
            packageId: packageIdNum,
            slots: new Array(slotsNeeded).fill(undefined)
          });
        }
      } else {
        // Remove package
        newPackageIds = newPackageIds.filter(id => id !== packageIdNum);
        newSelectedSlots = newSelectedSlots.filter(slot => slot.packageId !== packageIdNum);
      }
      
      return {
        ...prev,
        packageIds: newPackageIds,
        selectedSlots: newSelectedSlots,
      };
    });
  };

  const handleSlotChange = (packageId: number, slotIndex: number, date: Date) => {
    setFormData(prev => ({
      ...prev,
      selectedSlots: prev.selectedSlots.map(slotData => 
        slotData.packageId === packageId 
          ? {
              ...slotData,
              slots: slotData.slots.map((slot, index) => 
                index === slotIndex ? date : slot
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

  // Helper function to get all selected slots across all packages
  const getAllSelectedSlots = (): Date[] => {
    return formData.selectedSlots
      .flatMap(slotData => slotData.slots)
      .filter(slot => slot !== undefined) as Date[];
  };

  // Helper function to check if all required slots are selected
  const isAllSlotsSelected = (): boolean => {
    for (const packageId of formData.packageIds) {
      const slotsNeeded = getSlotsPerPackage(packageId);
      const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
      const selectedSlotsCount = packageSlots?.slots.filter(slot => slot !== undefined).length || 0;
      
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

    // Check if all required slots are selected for each package
    for (const packageId of formData.packageIds) {
      const slotsNeeded = getSlotsPerPackage(packageId);
      const packageSlots = formData.selectedSlots.find(slot => slot.packageId === packageId);
      const selectedSlotsCount = packageSlots?.slots.filter(slot => slot !== undefined).length || 0;
      
      if (selectedSlotsCount !== slotsNeeded) {
        const packageName = products.find(p => p.id === packageId)?.name || 'Unknown Package';
        alert(`Please select all ${slotsNeeded} time slots for ${packageName}. You have selected ${selectedSlotsCount} out of ${slotsNeeded}.`);
        return;
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
          
          if (!selectedPackage || !packageSlots) {
            throw new Error(`Package ${packageId} not found`);
          }

          return {
            id: selectedPackage.id,
            price: selectedPackage.price,
            name: selectedPackage.name,
            save: selectedPackage.save,
            Duration: selectedPackage.Duration,
            Description: selectedPackage.Description,
            DateTime: packageSlots.slots.filter(slot => slot !== undefined).map(slot => slot!.toISOString()),
            quantity: 1,
            // assignedEmployeeIds: [-1],
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

            {/* Step 2: Time Slots Selection */}
            {formData.packageIds.length > 0 && (
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
                                  value={packageSlots?.slots[index]}
                                  onChange={(date) => handleSlotChange(packageId, index, date)}
                                  excludedSlots={getAllSelectedSlots().filter(slot => 
                                    // Exclude slots that are already selected in other packages
                                    !packageSlots?.slots.includes(slot)
                                  )}
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

            {/* Step 3: Customer Selection */}
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
