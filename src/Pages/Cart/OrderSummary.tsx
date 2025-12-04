import { useCurrencyFormatter } from "../../utils/currency";

interface OrderSummaryProps{
    totalPrice:number
    totalDiscount?:number
}

const OrderSummary = ({totalPrice, totalDiscount = 0}:OrderSummaryProps) => {
  const formatCurrency = useCurrencyFormatter();

  return (
    <div className="text-white rounded-xl p-3 sm:p-4 shadow-xl flex flex-col min-h-[400px] lg:min-h-[500px]" style={{ background: 'var(--customer-primary-gradient-bottom)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5 flex-shrink-0">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded flex items-center justify-center">
          <span className="text-xs sm:text-sm">📋</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold" style={{ color: 'white' }}>Order Summary</h3>
      </div>
      
      {/* Pricing Breakdown - Top Section */}
      <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6 flex-shrink-0">
        <div className="flex justify-between items-center py-1 sm:py-1.5 border-b" style={{ borderColor: 'var(--customer-border-white-20)' }}>
          <span className="text-xs sm:text-sm" style={{ color: 'var(--customer-text-white-90)' }}>Subtotal</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'white' }}>{formatCurrency((totalPrice + totalDiscount) * 100)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between items-center py-1 sm:py-1.5 border-b" style={{ borderColor: 'var(--customer-border-white-20)' }}>
            <span className="text-xs sm:text-sm" style={{ color: 'var(--customer-text-white-90)' }}>Discount</span>
            <span className="font-semibold text-sm sm:text-base text-green-300">-{formatCurrency(totalDiscount * 100)}</span>
          </div>
        )}
      </div>

      {/* Spacer - Pushes content to bottom */}
      <div className="flex-1"></div>

      {/* Bottom Section - Total, Trust Indicators, and Button */}
      <div className="space-y-3 sm:space-y-4 flex-shrink-0 pt-4 border-t" style={{ borderColor: 'var(--customer-border-white-20)' }}>
        {/* Total - Prominent */}
        <div className="flex justify-between items-center py-2 sm:py-2.5 bg-white/10 rounded-lg px-3 sm:px-4">
          <span className="text-sm sm:text-base font-bold" style={{ color: 'white' }}>Total</span>
          <span className="text-lg sm:text-xl font-bold" style={{ color: 'white' }}>{formatCurrency(totalPrice * 100)}</span>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-800 text-[10px] sm:text-xs">✓</span>
            </div>
            <span style={{ color: 'var(--customer-text-white-90)' }}>🔒 Secure checkout</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-800 text-[10px] sm:text-xs">✓</span>
            </div>
            <span style={{ color: 'var(--customer-text-white-90)' }}>⭐ Trusted by 1,500+ students</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-800 text-[10px] sm:text-xs">✓</span>
            </div>
            <span style={{ color: 'var(--customer-text-white-90)' }}>💬 Average rating 4.9/5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
