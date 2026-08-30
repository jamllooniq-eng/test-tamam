import React, { useEffect, useState } from 'react';
import { Truck, Gift, Banknote, LucideIcon } from 'lucide-react';

interface FunnelHeaderProps {
  onScrollToOrder?: () => void;
}

interface HeaderMessage {
  icon: LucideIcon;
  text: string;
}

const MESSAGES: HeaderMessage[] = [
  { icon: Truck, text: 'توصيل سريع خلال يوم واحد' },
  { icon: Gift, text: 'توصيل مجاني لكل العراق' },
  { icon: Banknote, text: 'الدفع عند الاستلام' },
];

const ROTATE_INTERVAL_MS = 2000;
const FADE_DURATION_MS = 350;

export const FunnelHeader: React.FC<FunnelHeaderProps> = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Fade + slide out, swap the message, then fade + slide back in.
      setIsVisible(false);
      const swapTimeoutId = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % MESSAGES.length);
        setIsVisible(true);
      }, FADE_DURATION_MS);

      return () => clearTimeout(swapTimeoutId);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  const ActiveIcon = MESSAGES[activeIndex].icon;

  return (
    <header id="funnel-top-header" className="relative w-full bg-[#22A39E] text-white border-y-[3px] border-[#1b8581] overflow-hidden">
      <div className="max-w-5xl mx-auto py-2.5 px-3 sm:px-4 flex items-center justify-center select-none">
        <div
          className={`flex items-center justify-center gap-2.5 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1.5'
          }`}
        >
          <ActiveIcon className="w-[18px] h-[18px] text-white shrink-0" aria-hidden="true" />
          <span className="tracking-tight font-extrabold text-center whitespace-nowrap text-base">
            {MESSAGES[activeIndex].text}
          </span>
          <ActiveIcon className="w-[18px] h-[18px] text-white shrink-0" aria-hidden="true" />
        </div>
      </div>
    </header>
  );
};
