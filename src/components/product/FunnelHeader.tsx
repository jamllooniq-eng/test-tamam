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

const ROTATE_INTERVAL_MS = 3000;
const FADE_DURATION_MS = 350;

export const FunnelHeader: React.FC<FunnelHeaderProps> = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Fade out, swap the message, then fade back in.
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
      <div className="max-w-5xl mx-auto py-1.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 sm:gap-2.5 select-none">
        <div
          className={`flex items-center justify-center gap-2 sm:gap-2.5 transition-opacity duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ActiveIcon className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <span className="tracking-tight font-extrabold text-center whitespace-nowrap">
            {MESSAGES[activeIndex].text}
          </span>
        </div>
      </div>

      {/* Small dots indicator showing which message is currently active */}
      <div className="flex items-center justify-center gap-1 pb-1">
        {MESSAGES.map((_, i) => (
          <span
            key={i}
            className={`w-1 h-1 rounded-full transition-colors duration-300 ${
              i === activeIndex ? 'bg-white' : 'bg-white/35'
            }`}
          />
        ))}
      </div>
    </header>
  );
};
