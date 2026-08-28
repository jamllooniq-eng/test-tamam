import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  const allImages = Array.from(new Set([mainImage, ...images].filter(Boolean)));
  const total = allImages.length;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [loadedFlags, setLoadedFlags] = useState<boolean[]>(() => new Array(total).fill(false));

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const lockedAxis = useRef<'horizontal' | 'vertical' | null>(null);
  const startYRef = useRef<number>(0);

  // Measure container width for translateX math and keep it updated on resize
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const proxiedUrls = allImages.map((img) =>
    getOptimizedImageUrl(img, { width: 800, quality: 80, fit: 'contain' })
  );

  const markLoaded = (idx: number) => {
    setLoadedFlags((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const clamped = Math.max(0, Math.min(total - 1, targetIndex));
      setSelectedIndex(clamped);
    },
    [total]
  );

  // Touch Handlers — live drag-follow, then snap to nearest on release.
  // NOTE: dragging finger to the RIGHT (positive diffX) advances to the NEXT
  // image, matching this project's original established swipe convention.
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lockedAxis.current = null;
    startX.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    setIsDraggingState(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const diffX = x - startX.current;
    const diffY = y - startYRef.current;

    if (lockedAxis.current === null && (Math.abs(diffX) > 8 || Math.abs(diffY) > 8)) {
      lockedAxis.current = Math.abs(diffX) > Math.abs(diffY) * 1.2 ? 'horizontal' : 'vertical';
    }

    if (lockedAxis.current === 'horizontal') {
      if (e.cancelable) e.preventDefault();
      // Resist dragging past the first/last image
      let offset = diffX;
      if (selectedIndex === 0 && offset < 0) offset = offset / 2.5;
      if (selectedIndex === total - 1 && offset > 0) offset = offset / 2.5;
      setDragOffsetPx(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingState(false);

    if (lockedAxis.current === 'horizontal' && containerWidth > 0) {
      const threshold = containerWidth * 0.18;
      // Dragged right (positive) -> next. Dragged left (negative) -> previous.
      if (dragOffsetPx > threshold) {
        goToIndex(selectedIndex + 1);
      } else if (dragOffsetPx < -threshold) {
        goToIndex(selectedIndex - 1);
      }
    }
    setDragOffsetPx(0);
    lockedAxis.current = null;
  };

  // Mouse Drag Handlers for Desktop — same convention
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lockedAxis.current = 'horizontal';
    startX.current = e.clientX;
    setIsDraggingState(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const diffX = e.clientX - startX.current;
    let offset = diffX;
    if (selectedIndex === 0 && offset < 0) offset = offset / 2.5;
    if (selectedIndex === total - 1 && offset > 0) offset = offset / 2.5;
    setDragOffsetPx(offset);
  };

  const finishMouseDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsDraggingState(false);
    if (containerWidth > 0) {
      const threshold = containerWidth * 0.18;
      if (dragOffsetPx > threshold) {
        goToIndex(selectedIndex + 1);
      } else if (dragOffsetPx < -threshold) {
        goToIndex(selectedIndex - 1);
      }
    }
    setDragOffsetPx(0);
  };

  // Track math is forced to a plain, unambiguous LTR pixel coordinate system via
  // the inline `direction: ltr` below, regardless of the page's own RTL direction.
  // This guarantees item[i] always sits at exactly i*100% along the strip, so the
  // transform formula below is always correct no matter the page's text direction.
  // Dragging right (positive offset) reveals the NEXT image (per this project's
  // established swipe convention), so we subtract the offset here.
  const trackTransform = `translateX(calc(${selectedIndex * -100}% - ${dragOffsetPx}px))`;

  return (
    <div id="product-gallery" className="w-full max-w-[480px] mx-auto select-none">
      {/* 1. Square 1:1 Image Box — real sliding track, all images side by side */}
      <div
        ref={containerRef}
        className="relative w-full aspect-square bg-gray-100 rounded-[18px] border border-[#E5E5E5] shadow-xs overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y', direction: 'ltr' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={finishMouseDrag}
        onMouseLeave={finishMouseDrag}
      >
        {allImages.length > 0 ? (
          <div
            className="flex h-full"
            style={{
              width: `${total * 100}%`,
              direction: 'ltr',
              transform: trackTransform,
              transition: isDraggingState ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {allImages.map((img, idx) => (
              <div key={img + idx} className="relative h-full shrink-0" style={{ width: `${100 / total}%` }}>
                {!loadedFlags[idx] && (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-0 pointer-events-none">
                    <ShoppingBag className="w-10 h-10 text-gray-300 animate-pulse" />
                  </div>
                )}
                <img
                  ref={(node) => {
                    if (node && node.complete && node.naturalWidth > 0) {
                      markLoaded(idx);
                    }
                  }}
                  src={proxiedUrls[idx]}
                  alt={`${title} - صورة ${idx + 1}`}
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  loading="eager"
                  referrerPolicy="no-referrer"
                  decoding="async"
                  draggable={false}
                  className={`relative z-1 w-full h-full object-cover object-center transition-opacity duration-150 ${
                    loadedFlags[idx] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => markLoaded(idx)}
                  onError={(e) => {
                    markLoaded(idx);
                    const target = e.currentTarget;
                    if (img && target.src !== img) {
                      target.src = img;
                    }
                  }}
                />
              </div>
            ))}
          </div>
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
            style={{ direction: 'ltr' }}
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
