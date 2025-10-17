import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select';
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
  packageId: number;
  selectedSlots: (Date | undefined)[];
  customerId?: number;
  customerData?: CustomerFormData;
}

export const OrderCreateForm: React.FC<OrderCreateFormProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<OrderFormData>({
    packageId: 0,
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
        packageId: 0,
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

  const handlePackageSelect = (packageId: string) => {
    const packageIdNum = parseInt(packageId);
    const slotsNeeded = getSlotsPerPackage(packageIdNum);
    
    setFormData(prev => ({
      ...prev,
      packageId: packageIdNum,
      selectedSlots: new Array(slotsNeeded).fill(undefined), // Initialize with undefined slots
    }));
  };

  const handleSlotChange = (slotIndex: number, date: Date) => {
    setFormData(prev => ({
      ...prev,
      selectedSlots: prev.selectedSlots.map((slot, index) => 
        index === slotIndex ? date : slot
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

  const handleSubmit = async () => {
    if (!formData.packageId || formData.selectedSlots.length === 0) {
      alert('Please select a package and at least one time slot');
      return;
    }

    // Check if all required slots are selected
    const slotsNeeded = getSlotsPerPackage(formData.packageId);
    const selectedSlotsCount = formData.selectedSlots.filter(slot => slot !== undefined).length;
    
    if (selectedSlotsCount !== slotsNeeded) {
      alert(`Please select all ${slotsNeeded} time slots. You have selected ${selectedSlotsCount} out of ${slotsNeeded}.`);
      return;
    }

    if (!formData.customerId && !formData.customerData) {
      alert('Please select a customer or fill in customer details');
      return;
    }

    setIsCreatingOrder(true);

    try {
      const selectedPackage = products.find(p => p.id === formData.packageId);
      if (!selectedPackage) {
        throw new Error('Selected package not found');
      }

      const orderData = {
        items: [{
          id: selectedPackage.id,
          price: selectedPackage.price,
          name: selectedPackage.name,
          save: selectedPackage.save,
          Duration: selectedPackage.Duration,
          Description: selectedPackage.Description,
          DateTime: formData.selectedSlots.filter(slot => slot !== undefined).map(slot => slot!.toISOString()),
          quantity: 1,
          assignedEmployeeId: -1,
          sessions: selectedPackage.sessions,
        }],
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
              Select package, time slots, customer, and optionally assign an employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step 1: Package Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Select Package
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={handlePackageSelect} value={formData.packageId > 0 ? formData.packageId.toString() : undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a package" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.filter(product => product.id !== 8).map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${product.price} - {product.Duration}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Step 2: Time Slots Selection */}
            {formData.packageId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Select Time Slots ({getSlotsPerPackage(formData.packageId)} required)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from({ length: getSlotsPerPackage(formData.packageId) }, (_, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium flex-shrink-0">
                          {index + 1}
                        </span>
                        <DateTimePicker
                          packageId={formData.packageId}
                          value={formData.selectedSlots[index]}
                          onChange={(date) => handleSlotChange(index, date)}
                        />
                      </div>
                    ))}
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
              disabled={isCreatingOrder || !formData.packageId || formData.selectedSlots.filter(slot => slot !== undefined).length !== getSlotsPerPackage(formData.packageId)}
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
