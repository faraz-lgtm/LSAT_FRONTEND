import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/dashboard/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, DollarSign, LinkIcon, Check } from 'lucide-react';
import { useGetUsersQuery } from '@/redux/apiSlices/User/userSlice';
import { useCreatePaymentLinkMutation, type CustomerInfoDto } from '@/redux/apiSlices/Payments/paymentsSlice';
import { useCurrency } from '@/context/currency-provider';
import PhoneInput from "react-phone-input-2";
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/dashboard/ui/dropdown-menu';

// Currency data for the selector - same as header's CurrencySwitch
const POPULAR_CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CNY', 'INR', 'CHF', 'NZD'];

// Full currency names mapping - same as header
const currencyNames: Record<string, string> = {
  CAD: 'Canadian Dollar',
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  CNY: 'Chinese Yuan',
  INR: 'Indian Rupee',
  CHF: 'Swiss Franc',
  NZD: 'New Zealand Dollar',
  AED: 'UAE Dirham',
  AFN: 'Afghan Afghani',
  ALL: 'Albanian Lek',
  AMD: 'Armenian Dram',
  ANG: 'Netherlands Antillean Guilder',
  AOA: 'Angolan Kwanza',
  ARS: 'Argentine Peso',
  AWG: 'Aruban Florin',
  AZN: 'Azerbaijani Manat',
  BAM: 'Bosnia-Herzegovina Mark',
  BBD: 'Barbadian Dollar',
  BDT: 'Bangladeshi Taka',
  BGN: 'Bulgarian Lev',
  BHD: 'Bahraini Dinar',
  BIF: 'Burundian Franc',
  BMD: 'Bermudan Dollar',
  BND: 'Brunei Dollar',
  BOB: 'Bolivian Boliviano',
  BRL: 'Brazilian Real',
  BSD: 'Bahamian Dollar',
  BTN: 'Bhutanese Ngultrum',
  BWP: 'Botswanan Pula',
  BYN: 'Belarusian Ruble',
  BZD: 'Belize Dollar',
  CDF: 'Congolese Franc',
  CLP: 'Chilean Peso',
  CNH: 'Chinese Yuan Offshore',
  COP: 'Colombian Peso',
  CRC: 'Costa Rican Colón',
  CUP: 'Cuban Peso',
  CVE: 'Cape Verdean Escudo',
  CZK: 'Czech Koruna',
  DJF: 'Djiboutian Franc',
  DKK: 'Danish Krone',
  DOP: 'Dominican Peso',
  DZD: 'Algerian Dinar',
  EGP: 'Egyptian Pound',
  ERN: 'Eritrean Nakfa',
  ETB: 'Ethiopian Birr',
  FJD: 'Fijian Dollar',
  FKP: 'Falkland Islands Pound',
  FOK: 'Faroese Króna',
  GEL: 'Georgian Lari',
  GGP: 'Guernsey Pound',
  GHS: 'Ghanaian Cedi',
  GIP: 'Gibraltar Pound',
  GMD: 'Gambian Dalasi',
  GNF: 'Guinean Franc',
  GTQ: 'Guatemalan Quetzal',
  GYD: 'Guyanaese Dollar',
  HKD: 'Hong Kong Dollar',
  HNL: 'Honduran Lempira',
  HRK: 'Croatian Kuna',
  HTG: 'Haitian Gourde',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli New Shekel',
  IMP: 'Manx Pound',
  IQD: 'Iraqi Dinar',
  IRR: 'Iranian Rial',
  ISK: 'Icelandic Króna',
  JEP: 'Jersey Pound',
  JMD: 'Jamaican Dollar',
  JOD: 'Jordanian Dinar',
  KES: 'Kenyan Shilling',
  KGS: 'Kyrgystani Som',
  KHR: 'Cambodian Riel',
  KID: 'Kiribati Dollar',
  KMF: 'Comorian Franc',
  KRW: 'South Korean Won',
  KWD: 'Kuwaiti Dinar',
  KYD: 'Cayman Islands Dollar',
  KZT: 'Kazakhstani Tenge',
  LAK: 'Laotian Kip',
  LBP: 'Lebanese Pound',
  LKR: 'Sri Lankan Rupee',
  LRD: 'Liberian Dollar',
  LSL: 'Lesotho Loti',
  LYD: 'Libyan Dinar',
  MAD: 'Moroccan Dirham',
  MDL: 'Moldovan Leu',
  MGA: 'Malagasy Ariary',
  MKD: 'Macedonian Denar',
  MMK: 'Myanma Kyat',
  MNT: 'Mongolian Tugrik',
  MOP: 'Macanese Pataca',
  MRU: 'Mauritanian Ouguiya',
  MUR: 'Mauritian Rupee',
  MVR: 'Maldivian Rufiyaa',
  MWK: 'Malawian Kwacha',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  MZN: 'Mozambican Metical',
  NAD: 'Namibian Dollar',
  NGN: 'Nigerian Naira',
  NIO: 'Nicaraguan Córdoba',
  NOK: 'Norwegian Krone',
  NPR: 'Nepalese Rupee',
  OMR: 'Omani Rial',
  PAB: 'Panamanian Balboa',
  PEN: 'Peruvian Nuevo Sol',
  PGK: 'Papua New Guinean Kina',
  PHP: 'Philippine Peso',
  PKR: 'Pakistani Rupee',
  PLN: 'Polish Zloty',
  PYG: 'Paraguayan Guarani',
  QAR: 'Qatari Rial',
  RON: 'Romanian Leu',
  RSD: 'Serbian Dinar',
  RUB: 'Russian Ruble',
  RWF: 'Rwandan Franc',
  SAR: 'Saudi Riyal',
  SBD: 'Solomon Islands Dollar',
  SCR: 'Seychellois Rupee',
  SDG: 'Sudanese Pound',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  SHP: 'Saint Helena Pound',
  SLE: 'Sierra Leonean Leone',
  SLL: 'Sierra Leonean Leone',
  SOS: 'Somali Shilling',
  SRD: 'Surinamese Dollar',
  SSP: 'South Sudanese Pound',
  STN: 'São Tomé and Príncipe Dobra',
  SYP: 'Syrian Pound',
  SZL: 'Swazi Lilangeni',
  THB: 'Thai Baht',
  TJS: 'Tajikistani Somoni',
  TMT: 'Turkmenistani Manat',
  TND: 'Tunisian Dinar',
  TOP: 'Tongan Paʻanga',
  TRY: 'Turkish Lira',
  TTD: 'Trinidad and Tobago Dollar',
  TVD: 'Tuvaluan Dollar',
  TWD: 'New Taiwan Dollar',
  TZS: 'Tanzanian Shilling',
  UAH: 'Ukrainian Hryvnia',
  UGX: 'Ugandan Shilling',
  UYU: 'Uruguayan Peso',
  UZS: 'Uzbekistan Som',
  VES: 'Venezuelan Bolívar',
  VND: 'Vietnamese Dong',
  VUV: 'Vanuatu Vatu',
  WST: 'Samoan Tala',
  XAF: 'Central African CFA Franc',
  XCD: 'East Caribbean Dollar',
  XCG: 'East Caribbean Dollar',
  XDR: 'Special Drawing Rights',
  XOF: 'West African CFA Franc',
  XPF: 'CFP Franc',
  YER: 'Yemeni Rial',
  ZAR: 'South African Rand',
  ZMW: 'Zambian Kwacha',
  ZWL: 'Zimbabwean Dollar',
  CLF: 'Chilean Unit of Account (UF)',
};

interface PaymentLinkFormProps {
  onSuccess: (result: { sessionId: string; checkoutUrl: string }) => void;
}

interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export const PaymentLinkForm: React.FC<PaymentLinkFormProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('CAD');
  const [description, setDescription] = useState<string>('');
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [customerTab, setCustomerTab] = useState<string>('existing');
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const { availableCurrencies } = useCurrency();
  const { data: usersData } = useGetUsersQuery({});
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();

  // Filter users by customer role
  const customers = usersData?.data?.filter(user => user.roles.includes('CUST')) || [];

  // Use ALL available currencies - fallback to all known currencies if API doesn't return any
  // (Dashboard skips currency API, so we need fallback)
  const allKnownCurrencies = Object.keys(currencyNames);
  const currenciesToShow = availableCurrencies.length > 0 ? availableCurrencies : allKnownCurrencies;
  
  // Popular currencies first, then others sorted alphabetically
  const popularCurrencies = currenciesToShow.filter(code => POPULAR_CURRENCIES.includes(code));
  const otherCurrencies = currenciesToShow.filter(code => !POPULAR_CURRENCIES.includes(code)).sort();

  const handleCustomerSelect = (value: string) => {
    setCustomerId(parseInt(value));
  };

  const handleCustomerFormChange = (field: keyof CustomerFormData, value: string) => {
    setCustomerFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setCustomerId(undefined); // Clear selected customer when typing in form
  };

  const getCustomerInfo = (): CustomerInfoDto | null => {
    if (customerTab === 'existing' && customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        const nameParts = customer.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        // If no last name, use first name as last name to satisfy validation
        const lastName = nameParts.slice(1).join(' ') || firstName || '-';
        return {
          id: customer.id,
          firstName,
          lastName,
          email: customer.email,
          phone: customer.phone,
        };
      }
    } else if (customerTab === 'new') {
      if (customerFormData.firstName && customerFormData.lastName && 
          customerFormData.email && customerFormData.phone) {
        return {
          firstName: customerFormData.firstName,
          lastName: customerFormData.lastName,
          email: customerFormData.email,
          phone: customerFormData.phone,
        };
      }
    }
    return null;
  };

  const isFormValid = () => {
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) return false;
    if (!currency) return false;
    
    const customerInfo = getCustomerInfo();
    return customerInfo !== null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const customerInfo = getCustomerInfo();
    if (!customerInfo) {
      alert('Please select a customer or fill in customer details');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const result = await createPaymentLink({
        currency,
        amount: amountNum,
        customerInfo,
        description: description || undefined,
      }).unwrap();

      // Reset form completely
      setAmount('');
      setCurrency('CAD');
      setDescription('');
      setCustomerId(undefined);
      setCustomerTab('existing');
      setCustomerFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      });

      onSuccess(result.data);
    } catch (error) {
      console.error('Error creating payment link:', error);
      alert('Failed to create payment link. Please try again.');
    }
  };

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Amount and Currency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Enter the amount and currency for the payment link.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='outline'
                      className='w-full justify-between h-10 px-3 font-normal'
                    >
                      <span>
                        {currency} - {currencyNames[currency] || currency}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='max-h-[400px] overflow-y-auto w-[280px]'>
                    {/* Popular currencies */}
                    {popularCurrencies.map((code) => (
                      <DropdownMenuItem key={code} onClick={() => setCurrency(code)}>
                        {code} - {currencyNames[code] || code}
                        <Check
                          size={14}
                          className={cn('ms-auto', currency !== code && 'hidden')}
                        />
                      </DropdownMenuItem>
                    ))}
                    {/* Other currencies - ALL of them */}
                    {otherCurrencies.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        {otherCurrencies.map((code) => (
                          <DropdownMenuItem key={code} onClick={() => setCurrency(code)}>
                            {code} - {currencyNames[code] || code}
                            <Check
                              size={14}
                              className={cn('ms-auto', currency !== code && 'hidden')}
                            />
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Consultation Fee, Session Payment"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </CardTitle>
            <CardDescription>
              Select an existing customer or enter new customer details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="existing">Existing Customer</TabsTrigger>
                <TabsTrigger value="new">New Customer</TabsTrigger>
              </TabsList>
              
              <TabsContent value="existing" className="space-y-4 pt-4">
                <Select 
                  onValueChange={handleCustomerSelect} 
                  value={customerId?.toString()}
                >
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
              
              <TabsContent value="new" className="space-y-4 pt-4">
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
                    country={"ca"}
                    value={customerFormData.phone.replace('+', '')}
                    onChange={(val) => handleCustomerFormChange('phone', "+" + val)}
                    inputClass="!w-full !rounded-lg !border !border-gray-300 dark:!border-gray-600 px-4 py-3 focus:!outline-none focus:!ring-2 focus:!ring-blue-500 dark:!bg-gray-700 dark:!text-white"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || !isFormValid()}
          size="lg"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          {isLoading ? 'Generating Link...' : 'Generate Payment Link'}
        </Button>
      </div>
    </form>
    </div>
  );
};

