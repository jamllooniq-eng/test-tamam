import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ShoppingBag } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/image';

interface ProductGalleryProps {
  images?: string[];
  mainImage: string;
  title: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  mainImage,
  title,
}) => {
  // Deduplicate and filter non-empty images
  const allImages = useMemo(
    () => Array.from(new Set([mainImage, ...images].filter(Boolean))),
    [mainImage, images]
  );

  const total = allImages.length;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const hasMoved = useRef(false);

  // Optimized image URLs are calculated once per image list
  const optimizedImages = useMemo(
    () =>
      allImages.map((image) =>
        getOptimizedImageUrl(image, {
          width: 800,
          quality: 80,
          fit: 'contain',
        })
      ),
    [allImages]
  );

  // Keep selected index valid if the product images change
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(total - 1, 0)));
    setDragOffset(0);
  }, [total]);

  // Preload adjacent images
  useEffect(() => {
    if (typeof window === 'undefined' || total <= 1) return;

    const indexes = [
      selectedIndex - 1,
      selectedIndex + 1,
    ].filter((index) => index >= 0 && index < total);

    indexes.forEach((index) => {
      const src = optimizedImages[index];
      if (!src) return;

      const img = new Image();
      img.decoding = 'async';
      img.src = src;
    });
  }, [selectedIndex, total, optimizedImages]);

  const goToIndex = useCallback(
    (index: number) => {
      if (total <= 0) return;

      const nextIndex = Math.max(0, Math.min(index, total - 1));

      setSelectedIndex(nextIndex);
      setDragOffset(0);
    },
    [total]
  );

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => Math.max(0, prev - 1));
    setDragOffset(0);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => Math.min(total - 1, prev + 1));
    setDragOffset(0);
  }, [total]);

  const finishDrag = useCallback(() => {
    if (!isDragging) return;

    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;

    setIsDragging(false);

    const horizontalSwipe =
      Math.abs(deltaX) > 30 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.1;

    if (!horizontalSwipe) {
      setDragOffset(0);
      return;
    }

    /*
     * Keep the same direction as the previous implementation:
     * Left -> Right = next image
     * Right -> Left = previous image
     */
    if (deltaX > 0) {
      handleNext();
    } else {
      handlePrev();
    }
  }, [handleNext, handlePrev, isDragging]);

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (total <= 1) return;

    const touch = e.touches[0];

    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = touch.clientX;
    currentY.current = touch.clientY;

    hasMoved.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || total <= 1) return;

    const touch = e.touches[0];

    currentX.current = touch.clientX;
    currentY.current = touch.clientY;

    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;

    if (
      Math.abs(deltaX) > 8 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.1
    ) {
      hasMoved.current = true;

      if (e.cancelable) {
        e.preventDefault();
      }

      // Slight resistance at the edges
      let offset = deltaX;

      if (
        (selectedIndex === 0 && deltaX < 0) ||
        (selectedIndex === total - 1 && deltaX > 0)
      ) {
        offset = deltaX * 0.25;
      }

      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    finishDrag();
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  // Mouse / desktop drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (total <= 1) return;

    e.preventDefault();

    startX.current = e.clientX;
    startY.current = e.clientY;
    currentX.current = e.clientX;
    currentY.current = e.clientY;

    hasMoved.current = false;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || total <= 1) return;

    currentX.current = e.clientX;
    currentY.current = e.clientY;

    const deltaX = currentX.current - startX.current;
    const deltaY = currentY.current - startY.current;

    if (
      Math.abs(deltaX) > 5 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.1
    ) {
      hasMoved.current = true;

      let offset = deltaX;

      if (
        (selectedIndex === 0 && deltaX < 0) ||
        (selectedIndex === total - 1 && deltaX > 0)
      ) {
        offset = deltaX * 0.25;
      }

      setDragOffset(offset);
    }
  };

  const handleMouseUp = () => {
    finishDrag();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      finishDrag();
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    originalImage: string
  ) => {
    const target = e.currentTarget;

    if (target.src !== originalImage) {
      target.src = originalImage;
    }
  };

  if (!total) {
    return (
      <div
        id="product-gallery"
        className="w-full max-w-[480px] mx-auto select-none"
      >
        <div className="relative w-full aspect-square bg-gray-50 rounded-[18px] border border-[#E5E5E5] overflow-hidden flex flex-col items-center justify-center text-gray-400">
          <ShoppingBag className="w-16 h-16 mb-2 opacity-30" />
          <span className="text-xs font-semibold">
            صورة المنتج غير متوفرة
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="product-gallery"
      className="w-full max-w-[480px] mx-auto select-none"
    >
      {/* Main Gallery */}
      <div
        className="relative w-full aspect-square bg-gray-100 rounded-[18px] border border-[#E5E5E5] shadow-xs overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sliding Track */}
        <div
          className="absolute inset-0 flex h-full will-change-transform"
          style={{
            transform: `translate3d(calc(-${selectedIndex * 100}% + ${dragOffset}px), 0, 0)`,
            transition: isDragging
              ? 'none'
              : 'transform 380ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {optimizedImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-full w-full shrink-0"
            >
              <img
                src={src}
                alt={`${title} - صورة ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === selectedIndex ? 'high' : 'auto'}
                referrerPolicy="no-referrer"
                decoding="async"
                draggable={false}
                className="block w-full h-full object-cover object-center pointer-events-none"
                onError={(e) => handleImageError(e, allImages[index])}
              />
            </div>
          ))}
        </div>

        {/* Image Dots */}
        {total > 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 z-10"
            role="tablist"
            aria-label="صور المنتج"
          >
            {allImages.map((_, index) => {
              const isActive = selectedIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`عرض الصورة ${index + 1} من ${total}`}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (index !== selectedIndex) {
                      goToIndex(index);
                    }
                  }}
                  className={`transition-all duration-200 cursor-pointer rounded-full p-0 border-none outline-none ${
                    isActive
                      ? 'w-6 h-2 bg-white ring-1 ring-black/20 shadow-md'
                      : 'w-2 h-2 bg-white/70 hover:bg-white ring-1 ring-black/10 shadow-sm'
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
