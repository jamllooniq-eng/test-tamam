import React from 'react';

interface FunnelHeaderProps {
  onScrollToOrder?: () => void;
}

export const FunnelHeader: React.FC<FunnelHeaderProps> = () => {
  return (
    <header id="funnel-top-header" className="relative w-full bg-[#22A39E] text-white border-y-[3px] border-[#1b8581]">
      <div className="max-w-5xl mx-auto py-1.5 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 sm:gap-2.5 select-none">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="tracking-widest font-extrabold text-center whitespace-nowrap">
          توصيل سريع خلال يوم لكل العراق
        </span>
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
      </div>
    </header>
  );
};
