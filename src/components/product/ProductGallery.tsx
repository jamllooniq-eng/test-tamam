import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/image';

interface ProductGalleryProps {
  images?: string[];
  mainImage: string;
  title: string;
}

// Check synchronously whether a given image URL is already fully cached by the browser
function isImageCached(src: string): boolean {
  if (typeof window === 'undefined' || !src) return false;
  const img = new window.Image();
  img.src = src;
  return img.complete && img.naturalWidth > 0;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  mainImage,
  title,
}) => {
  // Deduplicate and filter non-empty images
  const allImages = Array.from(new Set([mainImage, ...images].filter(Boolean)));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const imgElRef = useRef<HTMLImageElement | null>(null);

  // Swipe tracking for mobile touch & desktop drag
  const startX = useRef<number>(0);
  const startY = useRef<number>(0);
  const currentX = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  const total = allImages.length;
  const activeImage = allImages[selectedIndex] || mainImage || '';
  const proxiedActiveImage = activeImage
    ? getOptimizedImageUrl(activeImage, { width: 800, quality: 80, fit: 'contain' })
    : '';

  // Catch-up check: whenever the active image src changes (including the very first
  // render, which may be SSR-hydrated and could have already finished loading before
  // React attached its onLoad listener), verify if the browser already has it fully
  // loaded and clear the loading state immediately instead of waiting for an onLoad
  // event that may never fire in that race condition.
  useEffect(() => {
    if (imgElRef.current && imgElRef.current.complete && imgElRef.current.naturalWidth > 0) {
      setImageLoading(false);
    }
  }, [proxiedActiveImage]);

  // Silent background preload of adjacent images (next and previous) to eliminate flash of loading
  useEffect(() => {
    if (typeof window === 'undefined' || total <= 1) return;

    const nextIndex = selectedIndex < total - 1 ? selectedIndex + 1 : -1;
    const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : -1;

    const indicesToPreload = [nextIndex, prevIndex].filter((i) => i >= 0);
    indicesToPreload.forEach((idx) => {
      if (idx !== selectedIndex && allImages[idx]) {
        const preloadImg = new Image();
        preloadImg.src = getOptimizedImageUrl(allImages[idx], {
          width: 800,
          quality: 80,
          fit: 'contain',
        });
      }
    });
  }, [selectedIndex, total, allImages]);

  // Navigate to a target index, skipping the loading flash entirely if the image
  // is already cached (as adjacent images normally are, thanks to preloading above).
  const goToIndex = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= total || targetIndex === selectedIndex) return;
      const targetSrc = getOptimizedImageUrl(allImages[targetIndex], {
        width: 800,
        quality: 80,
        fit: 'contain',
      });
      if (!isImageCached(targetSrc)) {
        setImageLoading(true);
      }
      setSelectedIndex(targetIndex);
    },
    [allImages, selectedIndex, total]
  );

  // Navigate functions - Strictly sequential from first (0) to last (total - 1)
  const handlePrev = useCallback(() => {
    goToIndex(selectedIndex - 1);
  }, [goToIndex, selectedIndex]);

  const handleNext = useCallback(() => {
    goToIndex(selectedIndex + 1);
  }, [goToIndex, selectedIndex]);

  // Process horizontal swipe gesture
  const processSwipe = (deltaX: number, deltaY: number) => {
    if (total <= 1) return;
    // Check if horizontal swipe exceeds 30px and is predominantly horizontal
    if (Math.abs(deltaX) > 30 && Math.abs(deltaX) > Math.abs(deltaY) * 1.1) {
      if (deltaX > 0) {
        // Swiped from Left to Right -> Advance to next image
        handleNext();
      } else {
        // Swiped from Right to Left -> Go back to previous image
        handlePrev();
      }
    }
  };

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = e.touches[0].clientX;
    currentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    currentY.current = e.touches[0].clientY;

    const diffX = Math.abs(currentX.current - startX.current);
    const diffY = Math.abs(currentY.current - startY.current);

    // If movement is clearly horizontal, prevent browser default back/forward gesture
    if (diffX > 10 && diffX > diffY * 1.2) {
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;
    processSwipe(deltaX, deltaY);
  };

  // Mouse Drag Handlers for Desktop swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = e.clientX;
    currentY.current = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    currentX.current = e.clientX;
    currentY.current = e.clientY;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;
    processSwipe(deltaX, deltaY);
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      const deltaX = currentX.current - startX.current;
      const deltaY = currentY.current - startY.current;
      processSwipe(deltaX, deltaY);
    }
  };

  return (
    <div id="product-gallery" className="w-full max-w-[480px] mx-auto select-none">
      {/* 1. Square 1:1 Image Box */}
      <div
        className="relative w-full aspect-square bg-gray-100 rounded-[18px] border border-[#E5E5E5] shadow-xs overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Skeleton loading indicator behind the image */}
        {imageLoading && proxiedActiveImage && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-0 pointer-events-none">
            <ShoppingBag className="w-10 h-10 text-gray-300 animate-pulse" />
          </div>
        )}

        {/* Product Image Stage - single stable element, src swaps in place instead of remounting */}
        {proxiedActiveImage ? (
          <img
            ref={(node) => {
              imgElRef.current = node;
              // Catch-up check on the very first mount too (handles SSR-hydrated
              // first image that may have already finished loading before this
              // ref/listener attached).
              if (node && node.complete && node.naturalWidth > 0) {
                setImageLoading(false);
              }
            }}
            src={proxiedActiveImage}
            alt={`${title} - صورة ${selectedIndex + 1}`}
            fetchPriority="high"
            loading="eager"
            referrerPolicy="no-referrer"
            decoding="async"
            draggable={false}
            className={`relative z-1 w-full h-full object-cover object-center transition-opacity duration-200 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setImageLoading(false)}
            onError={(e) => {
              setImageLoading(false);
              const target = e.currentTarget;
              if (activeImage && target.src !== activeImage) {
                target.src = activeImage;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <ShoppingBag className="w-16 h-16 mb-2 opacity-30" />
            <span className="text-xs font-semibold">صورة المنتج غير متوفرة</span>
          </div>
        )}

        {/* Clear & Prominent White Dots Indicator */}
        {total > 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-10 pointer-events-auto"
            role="tablist"
            aria-label="صور المنتج"
          >
            {allImages.map((_, idx) => {
              const isActive = selectedIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`عرض الصورة ${idx + 1} من ${total}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToIndex(idx);
                  }}
                  className={`transition-all duration-300 cursor-pointer rounded-full p-0 border-none outline-none shadow-sm ${
                    isActive
                      ? 'w-6 h-2 bg-white ring-1 ring-black/20 shadow-md'
                      : 'w-2 h-2 bg-white/70 hover:bg-white ring-1 ring-black/10'
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
