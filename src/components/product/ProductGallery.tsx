import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ShoppingBag } from 'lucide-react';
import { getOptimizedImageUrl } from '../../lib/image';

interface ProductGalleryProps {
  images?: string[];
  mainImage: string;
  title: string;
}

const PRELOAD_RANGE = 1;

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images = [],
  mainImage,
  title,
}) => {
  // =========================================================
  // Images
  // =========================================================

  const allImages = useMemo(
    () => Array.from(new Set([mainImage, ...images].filter(Boolean))),
    [mainImage, images]
  );

  const total = allImages.length;

  // =========================================================
  // Embla
  // =========================================================

  const [emblaRef, emblaApi] = useEmblaCarousel({
    direction: 'rtl',
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    skipSnaps: false,
    dragFree: false,
    duration: 22,
    dragThreshold: 8,
  });

  // =========================================================
  // State
  // =========================================================

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [loaded, setLoaded] = useState<boolean[]>(
    () => new Array(total).fill(false)
  );

  /*
   * Activated means:
   * the real image is allowed to start downloading.
   *
   * Once activated, it remains activated.
   */
  const [activated, setActivated] = useState<Set<number>>(
    () =>
      new Set(
        Array.from({ length: total }, (_, index) => index).filter(
          (index) => index <= PRELOAD_RANGE
        )
      )
  );

  // =========================================================
  // URLs
  // =========================================================

  const optimizedUrls = useMemo(
    () =>
      allImages.map((image) =>
        getOptimizedImageUrl(image, {
          width: 800,
          quality: 72,
          fit: 'contain',
        })
      ),
    [allImages]
  );

  const previewUrls = useMemo(
    () =>
      allImages.map((image) =>
        getOptimizedImageUrl(image, {
          width: 24,
          quality: 25,
          fit: 'contain',
        })
      ),
    [allImages]
  );

  // =========================================================
  // Loaded state
  // =========================================================

  const markLoaded = useCallback((index: number) => {
    setLoaded((previous) => {
      if (previous[index]) return previous;

      const next = [...previous];
      next[index] = true;

      return next;
    });
  }, []);

  // =========================================================
  // Activate images around current index
  // =========================================================

  const activateAround = useCallback(
    (index: number) => {
      if (!total) return;

      setActivated((previous) => {
        let changed = false;
        const next = new Set(previous);

        for (
          let offset = -PRELOAD_RANGE;
          offset <= PRELOAD_RANGE;
          offset++
        ) {
          const target = index + offset;

          if (
            target >= 0 &&
            target < total &&
            !next.has(target)
          ) {
            next.add(target);
            changed = true;
          }
        }

        return changed ? next : previous;
      });
    },
    [total]
  );

  // =========================================================
  // Embla events
  // =========================================================

  useEffect(() => {
    if (!emblaApi || total <= 0) return;

    const handleSelect = () => {
      const index = emblaApi.selectedScrollSnap();

      setSelectedIndex((previous) =>
        previous === index ? previous : index
      );

      activateAround(index);
    };

    /*
     * Important:
     *
     * When the user starts dragging, we make sure that the
     * current slide's neighbors are already activated.
     */
    const handlePointerDown = () => {
      const index = emblaApi.selectedScrollSnap();
      activateAround(index);
    };

    emblaApi.on('select', handleSelect);
    emblaApi.on('pointerDown', handlePointerDown);

    handleSelect();

    return () => {
      emblaApi.off('select', handleSelect);
      emblaApi.off('pointerDown', handlePointerDown);
    };
  }, [emblaApi, total, activateAround]);

  // =========================================================
  // Navigation
  // =========================================================

  const goToIndex = useCallback(
    (index: number) => {
      if (!emblaApi) return;

      // Start preparing the destination immediately.
      activateAround(index);

      emblaApi.scrollTo(index);
    },
    [emblaApi, activateAround]
  );

  // =========================================================
  // Empty gallery
  // =========================================================

  if (total === 0) {
    return (
      <div
        id="product-gallery"
        className="w-full max-w-[480px] mx-auto select-none"
      >
        <div className="relative w-full aspect-square overflow-hidden rounded-[18px] border border-[#E5E5E5] bg-gray-100 shadow-xs">
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-gray-400">
            <ShoppingBag className="mb-2 h-16 w-16 opacity-30" />

            <span className="text-xs font-semibold">
              صورة المنتج غير متوفرة
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="product-gallery"
      className="mx-auto w-full max-w-[480px] select-none"
    >
      {/* =====================================================
          Gallery
      ===================================================== */}

      <div className="relative aspect-square w-full overflow-hidden rounded-[18px] border border-[#E5E5E5] bg-gray-100 shadow-xs">

        <div
          ref={emblaRef}
          className="h-full overflow-hidden"
          style={{
            touchAction: 'pan-y',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div className="flex h-full">

            {allImages.map((image, index) => {
              const isActivated = activated.has(index);
              const isLoaded = loaded[index];

              /*
               * Only show the blur preview for:
               *
               * current
               * previous
               * next
               *
               * This prevents unnecessary preview requests.
               */
              const showPreview =
                Math.abs(index - selectedIndex) <= PRELOAD_RANGE;

              return (
                <div
                  key={`${image}-${index}`}
                  className="relative h-full min-w-0 shrink-0 grow-0 basis-full overflow-hidden"
                >
                  {/* =================================================
                      Blur preview
                  ================================================= */}

                  {!isLoaded &&
                    showPreview &&
                    previewUrls[index] && (
                      <img
                        src={previewUrls[index]}
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        decoding="async"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={
                          index === 0 ? 'high' : 'low'
                        }
                        className="absolute inset-0 h-full w-full scale-110 object-cover object-center"
                        style={{
                          filter: 'blur(14px)',
                        }}
                      />
                    )}

                  {/* =================================================
                      Real image
                  ================================================= */}

                  {isActivated && (
                    <img
                      src={optimizedUrls[index]}
                      alt={`${title} - صورة ${index + 1}`}
                      draggable={false}
                      decoding="async"
                      loading="eager"
                      fetchPriority={
                        index === 0 ? 'high' : 'auto'
                      }
                      referrerPolicy="no-referrer"
                      width={800}
                      height={800}
                      className={[
                        'relative z-[1] h-full w-full object-cover object-center',
                        'transition-opacity duration-150 ease-out',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                      ].join(' ')}
                      onLoad={() => markLoaded(index)}
                      onError={(event) => {
                        const target = event.currentTarget;

                        /*
                         * Fallback to the original image
                         * if the optimized URL fails.
                         */
                        if (
                          image &&
                          target.src !== image
                        ) {
                          target.src = image;
                        } else {
                          markLoaded(index);
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            Dots
        ===================================================== */}

        {total > 1 && (
          <div
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-1.5"
            role="tablist"
            aria-label="صور المنتج"
          >
            {allImages.map((_, index) => {
              const active = selectedIndex === index;

              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`عرض الصورة ${index + 1} من ${total}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    goToIndex(index);
                  }}
                  className={[
                    'cursor-pointer rounded-full border-none p-0 outline-none',
                    'shadow-sm transition-all duration-200',
                    'focus-visible:ring-2 focus-visible:ring-white/80',
                    active
                      ? 'h-2 w-6 bg-white shadow-md ring-1 ring-black/20'
                      : 'h-2 w-2 bg-white/70 ring-1 ring-black/10 hover:bg-white',
                  ].join(' ')}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
