import React from 'react';
import { Zap } from 'lucide-react';

interface FunnelHeaderProps {
  onScrollToOrder?: () => void;
}

export const FunnelHeader: React.FC<FunnelHeaderProps> = () => {
  return (
    <header id="funnel-top-header" className="relative w-full bg-[#22A39E] text-white border-y-[3px] border-[#1b8581]">
      <div className="max-w-5xl mx-auto py-1.5 px-3 sm:px-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2 sm:gap-3 select-none">
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" fill="currentColor" />
        <span className="tracking-tight font-extrabold text-center whitespace-nowrap">
          توصيل سريع ومجاني خلال يوم لكل العراق
        </span>
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" fill="currentColor" />
      </div>
    </header>
  );
};
