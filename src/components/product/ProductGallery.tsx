import React, { useState, useEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ShoppingBag } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/image';

interface ProductGalleryProps {
  images?: string[];
  mainImage: string;
  title: string;
}

// How many slides on each side of the current one get their full-quality image
// requested eagerly. Everything further away stays as a blur placeholder only
// until the user swipes close enough to it.
const EAGER_NEIGHBOR_RANGE = 1;

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  mainImage,
  title,
}) => {
  // Deduplicate and filter non-empty images
  const allImages = Array.from(new Set([mainImage, ...images].filter(Boolean)));
  const total = allImages.length;

  // Embla is configured with direction: 'rtl' to match the site's Arabic layout,
  // so swiping/dragging feels natural and matches the project's established
  // convention (drag toward the start of reading direction moves forward).
  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: 'rtl',
    loop: false,
    align: 'start',
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loadedFlags, setLoadedFlags] = useState<boolean[]>(() => new Array(total).fill(false));

  // Manual activation set: once an index has EVER been within the eager range
  // (past or present), it stays "activated" permanently — its real <img> src
  // gets set and starts downloading. This does NOT rely on the browser's native
  // loading="lazy" viewport heuristic at all, because that heuristic is unreliable
  // inside a transform-based carousel where every slide already sits within an
  // already-visible, non-scrolling container (native lazy-load expects real page
  // scrolling to detect proximity, which never happens here).
  const [activatedIndices, setActivatedIndices] = useState<Set<number>>(
    () => new Set(Array.from({ length: total }, (_, i) => i).filter((i) => Math.abs(i) <= EAGER_NEIGHBOR_RANGE))
  );

  const proxiedUrls = allImages.map((img) =>
    getOptimizedImageUrl(img, { width: 800, quality: 72, fit: 'contain' })
  );

  // Tiny, heavily-compressed blurred preview of each image — downloads almost
  // instantly (well under 1KB) and fills the frame immediately while the full
  // quality image above loads in behind it, instead of a blank/skeleton box.
  const blurPreviewUrls = allImages.map((img) =>
    getOptimizedImageUrl(img, { width: 24, quality: 30, fit: 'contain' })
  );

  const markLoaded = (idx: number) => {
    setLoadedFlags((prev) => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  // Sync React state with Embla's internal selected slide index, and expand the
  // activated set to cover the new neighborhood every time the user navigates.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const idx = emblaApi.selectedScrollSnap();
      setSelectedIndex(idx);
      setActivatedIndices((prev) => {
        const next = new Set(prev);
        for (let d = -EAGER_NEIGHBOR_RANGE; d <= EAGER_NEIGHBOR_RANGE; d++) {
          const i = idx + d;
          if (i >= 0 && i < total) next.add(i);
        }
        return next;
      });
    };
    emblaApi.on('select', onSelect);
    // Also react to pointer-down (drag start) so a fast flick that lands beyond
    // the currently-activated range still starts loading the destination image
    // the moment the drag begins, not only after it snaps into place.
    emblaApi.on('pointerDown', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onSelect);
    };
  }, [emblaApi, total]);

  const goToIndex = useCallback(
    (idx: number) => {
      emblaApi?.scrollTo(idx);
    },
    [emblaApi]
  );

  return (
    <div id="product-gallery" className="w-full max-w-[480px] mx-auto select-none">
      {/* 1. Square 1:1 Image Box — real Embla-powered sliding track */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-[18px] border border-[#E5E5E5] shadow-xs overflow-hidden">
        {allImages.length > 0 ? (
          <div className="overflow-hidden h-full" ref={emblaRef} style={{ touchAction: 'pan-y' }}>
            <div className="flex h-full">
              {allImages.map((img, idx) => {
                const activated = activatedIndices.has(idx);
                return (
                  <div key={img + idx} className="relative h-full shrink-0 grow-0 basis-full overflow-hidden">
                    {/* Tiny blurred placeholder — loads almost instantly, shown until the full image is ready.
                        This itself is cheap enough that we always fetch it eagerly for every slide, so the
                        user never sees a completely blank frame even before reaching a far-away slide. */}
                    {!loadedFlags[idx] && blurPreviewUrls[idx] && (
                      <img
                        src={blurPreviewUrls[idx]}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        loading="eager"
                        fetchPriority={idx === 0 ? 'high' : 'auto'}
                        className="absolute inset-0 z-0 w-full h-full object-cover object-center scale-110"
                        style={{ filter: 'blur(14px)' }}
                      />
                    )}

                    {/* The full-quality image's src is only rendered once this slide has been
                        "activated" (current, a near neighbor, or previously visited) — this is
                        a manual, explicit trigger instead of relying on native loading="lazy",
                        which does not reliably detect proximity inside a transform-based,
                        already-visible carousel like this one. */}
                    {activated && (
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
                        className={`relative z-1 w-full h-full object-cover object-center transition-opacity duration-200 ${
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
                    )}
                  </div>
                );
              })}
            </div>
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
