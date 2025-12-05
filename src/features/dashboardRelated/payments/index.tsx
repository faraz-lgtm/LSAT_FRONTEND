import { useState } from 'react';
import { ConfigDrawer } from "@/components/dashboard/config-drawer";
import { Header } from "@/components/dashboard/layout/header";
import { Main } from "@/components/dashboard/layout/main";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Search } from "@/components/dashboard/search";
import { ThemeSwitch } from "@/components/dashboard/theme-switch";
import { PaymentLinkForm } from "./components/payment-link-form";
import { PaymentLinkSuccessModal } from "./components/payment-link-success-modal";

export function Payments() {
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{
    sessionId: string;
    checkoutUrl: string;
  } | null>(null);

  const handleSuccess = (result: { sessionId: string; checkoutUrl: string }) => {
    setPaymentResult(result);
    setSuccessModalOpen(true);
  };

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="max-w-xl mx-auto">
          {/* Container Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600 rounded-t-lg">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Generate Payment Link</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a direct payment link for customers.
              </p>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6">
              <PaymentLinkForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </Main>

      {paymentResult && (
        <PaymentLinkSuccessModal
          isOpen={successModalOpen}
          onClose={() => {
            setSuccessModalOpen(false);
            setPaymentResult(null);
          }}
          paymentResult={paymentResult}
        />
      )}
    </>
  );
}

