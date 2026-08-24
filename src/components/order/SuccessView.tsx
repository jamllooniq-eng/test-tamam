import React from 'react';
import { RolemallProduct } from '../../types';
import { CheckCircle2, Truck, AlertTriangle } from 'lucide-react';

interface SuccessViewProps {
  orderId?: string;
  orderDetails: {
    product: RolemallProduct;
    quantity: number;
    name: string;
    phone: string;
    governorate: string;
    address: string;
    totalPrice: number;
  };
  onContinueShopping?: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  orderDetails,
}) => {
  return (
    <div id="order-success-container" className="py-10 px-4 sm:px-6 max-w-xl mx-auto">
      <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 sm:p-8 shadow-xl shadow-gray-200/50 text-center space-y-5 sm:space-y-6">
        {/* Checkmark Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#22A39E]/10 text-[#22A39E] ring-8 ring-[#22A39E]/10 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        {/* Success Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#22A39E] tracking-tight">
            تم الحجز بنجاح
          </h2>
        </div>

        {/* WhatsApp Confirmation Notice - Centered & Balanced without icon */}
        <div className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-4 text-center shadow-2xs">
          <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed max-w-md mx-auto">
            سيتم التواصل معك قريباً لتأكيد الطلب، الرجاء الرد على رسالة الواتساب بكلمة{' '}
            <span className="bg-emerald-200/90 text-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-400/80 font-black inline-block shadow-2xs">
              تم
            </span>
          </p>
        </div>

        {/* Order Details Breakdown */}
        <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 sm:p-5 text-right space-y-2.5 sm:space-y-3 text-xs sm:text-sm text-gray-700 min-w-0">
          <div className="flex justify-between items-start py-1 border-b border-gray-200/60 gap-3 min-w-0">
            <span className="text-gray-500 font-medium shrink-0">المنتج:</span>
            <span className="font-extrabold text-gray-900 break-words text-left min-w-0">{orderDetails.product.title}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60 gap-3 min-w-0">
            <span className="text-gray-500 font-medium shrink-0">الكمية:</span>
            <span className="font-extrabold text-gray-900 shrink-0">{orderDetails.quantity}</span>
          </div>
          <div className="flex justify-between items-start py-1 border-b border-gray-200/60 gap-3 min-w-0">
            <span className="text-gray-500 font-medium shrink-0">المستلم:</span>
            <span className="font-extrabold text-gray-900 break-words text-left min-w-0">{orderDetails.name}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-gray-200/60 gap-3 min-w-0">
            <span className="text-gray-500 font-medium shrink-0">رقم الهاتف:</span>
            <span className="font-mono font-bold text-gray-900 shrink-0" dir="ltr">{orderDetails.phone}</span>
          </div>
          <div className="flex justify-between items-start py-1 border-b border-gray-200/60 gap-3 min-w-0">
            <span className="text-gray-500 font-medium shrink-0">عنوان التوصيل:</span>
            <span className="font-extrabold text-gray-900 break-words text-left min-w-0">{orderDetails.governorate} - {orderDetails.address}</span>
          </div>

          {/* Total Row: Price on Right, Free Delivery on Left */}
          <div className="flex justify-between items-center pt-2 text-xs sm:text-sm font-black gap-2 min-w-0">
            {/* Right side in RTL: Price */}
            <div className="flex items-baseline gap-1 text-gray-900 shrink-0">
              <span className="text-[#22A39E] text-base sm:text-lg font-black">
                {orderDetails.totalPrice.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-bold text-gray-700">د.ع</span>
            </div>

            {/* Left side in RTL: Free Delivery text */}
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#22A39E] shrink-0">
              <Truck className="w-4 h-4 text-[#22A39E]" />
              <span>توصيل مجاني</span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-2xs">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <span>يرجى فحص المنتج قبل الاستلام للتأكد من سلامته</span>
        </div>
      </div>
    </div>
  );
};

