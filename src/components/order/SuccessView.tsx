import React from 'react';
import { RolemallProduct } from '../../types';
import {
  CheckCircle2,
  Truck,
  AlertTriangle,
  ShoppingBag,
  PackageCheck,
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/image';

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
  onContinueShopping,
}) => {
  const { product, quantity, totalPrice } = orderDetails;

  const imageUrl = product.image
    ? getOptimizedImageUrl(product.image, { width: 300, quality: 85, fit: 'contain' })
    : '';

  return (
    <div id="order-success-container" className="py-8 sm:py-12 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Main Success Container */}
      <div className="bg-white border border-gray-200/90 rounded-3xl p-5 sm:p-8 shadow-xl shadow-gray-200/40 space-y-6">
        
        {/* 1. Success Hero Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/10 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.2]" />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-xs">
              <PackageCheck className="w-4 h-4" />
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
              تم استلام طلبك بنجاح!
            </h1>
          </div>
        </div>

        {/* 2. WhatsApp Confirmation Alert Banner */}
        <div className="bg-emerald-50/90 border border-emerald-300/80 rounded-2xl p-4 text-center">
          <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed max-w-lg mx-auto">
            سيتم التواصل معك قريباً لتأكيد تفاصيل الشحن، يرجى الرد على رسالتنا بكلمة{' '}
            <span className="bg-emerald-600 text-white px-3 py-0.5 rounded-md font-black italic tracking-wide inline-block mx-1">
              تم
            </span>
          </p>
        </div>

        {/* 3. Product Card with High-Res Image & Price */}
        <div className="bg-gray-50/90 border border-gray-200 rounded-2xl p-4 sm:p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-[#22A39E]" />
            <span>المنتج المطلوب</span>
          </div>

          <div className="flex items-center gap-4 min-w-0">
            {/* Product Image Thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border border-gray-200/90 p-1.5 shrink-0 overflow-hidden flex items-center justify-center shadow-2xs">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (product.image && target.src !== product.image) {
                      target.src = product.image;
                    }
                  }}
                />
              ) : (
                <div className="text-[11px] font-bold text-[#22A39E] flex flex-col items-center">
                  <ShoppingBag className="w-6 h-6 mb-1 opacity-40" />
                  <span>تمام شوب</span>
                </div>
              )}
            </div>

            {/* Product Details Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 break-words leading-snug mb-2">
                {product.title}
              </h3>
              
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                <span className="bg-white border border-gray-200 px-2.5 py-1 rounded-md font-bold text-gray-800">
                  الكمية: {quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Free Delivery Summary inside Product Card */}
          <div className="mt-4 pt-3.5 border-t border-gray-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#22A39E]">
              <Truck className="w-4 h-4 text-[#22A39E]" />
              <span>توصيل مجاني</span>
            </div>

            <div className="flex items-baseline gap-1 text-gray-900">
              <span className="text-[#22A39E] text-xl sm:text-2xl font-black">
                {totalPrice.toLocaleString('en-US')}
              </span>
              <span className="text-xs font-bold text-gray-700">د.ع</span>
            </div>
          </div>
        </div>

        {/* 4. Warning Banner (Restored to exact previous text & layout) */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-2xs">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0" />
          <span>يرجى فحص المنتج قبل الاستلام للتأكد من سلامته</span>
        </div>

      </div>
    </div>
  );
};


