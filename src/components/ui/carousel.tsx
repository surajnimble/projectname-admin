'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, type ComponentProps, type HTMLAttributes, type RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CarouselContextValue = { viewportRef: RefObject<HTMLDivElement | null>; scroll: (direction: -1 | 1) => void; itemWidth?: string; orientation: 'horizontal' | 'vertical' };
const CarouselContext = createContext<CarouselContextValue | null>(null);

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  showArrows?: boolean;
  itemWidth?: string;
}

export function Carousel({ children, className, orientation = 'horizontal', showArrows = true, itemWidth, ...props }: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const scroll = useCallback((direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const distance = orientation === 'horizontal' ? viewport.clientWidth * 0.8 : viewport.clientHeight * 0.8;
    viewport.scrollBy({ [orientation === 'horizontal' ? 'left' : 'top']: direction * Math.max(distance, 160), behavior: 'smooth' });
  }, [orientation]);

  return (
    <CarouselContext.Provider value={{ viewportRef, scroll, itemWidth, orientation }}>
      <div className={cn('group/carousel relative min-w-0', className)} data-slot="carousel" aria-roledescription="carousel" {...props}>
        <div ref={viewportRef} className={cn('scrollbar-none snap-x snap-mandatory overflow-auto scroll-smooth', orientation === 'horizontal' ? 'flex flex-row' : 'flex max-h-carousel-vertical flex-col')}>
          <div className={cn('flex min-w-0', orientation === 'horizontal' ? 'w-full flex-row gap-3' : 'flex-col gap-3')} style={itemWidth ? { ['--carousel-item-width' as string]: itemWidth } : undefined}>
            {children}
          </div>
        </div>
        {showArrows && (
          <>
            <Button type="button" variant="outline" size="icon-sm" ripple={false} aria-label="Previous slide" onClick={() => scroll(-1)} className="absolute top-1/2 left-2 z-10 -translate-y-1/2 rounded-full bg-background/95 shadow-md">
              {orientation === 'horizontal' ? <ChevronLeft className="size-4" /> : <ChevronLeft className="size-4 rotate-90" />}
            </Button>
            <Button type="button" variant="outline" size="icon-sm" ripple={false} aria-label="Next slide" onClick={() => scroll(1)} className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded-full bg-background/95 shadow-md">
              {orientation === 'horizontal' ? <ChevronRight className="size-4" /> : <ChevronRight className="size-4 rotate-90" />}
            </Button>
          </>
        )}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('CarouselContent must be used inside Carousel.');
  return <div className={cn('contents', className)} {...props} />;
}

export function CarouselItem({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('CarouselItem must be used inside Carousel.');
  return <div role="group" aria-roledescription="slide" className={cn('min-w-0 shrink-0 snap-start basis-full sm:basis-1/2 lg:basis-1/3', context.orientation === 'vertical' && 'basis-auto', className)} style={context.itemWidth ? { flexBasis: context.itemWidth } : undefined} {...props} />;
}

export function CarouselPrevious({ className, ...props }: ComponentProps<typeof Button>) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('CarouselPrevious must be used inside Carousel.');
  return <Button type="button" variant="outline" size="icon-sm" aria-label="Previous slide" onClick={() => context.scroll(-1)} className={className} {...props}><ChevronLeft className="size-4" /></Button>;
}

export function CarouselNext({ className, ...props }: ComponentProps<typeof Button>) {
  const context = useContext(CarouselContext);
  if (!context) throw new Error('CarouselNext must be used inside Carousel.');
  return <Button type="button" variant="outline" size="icon-sm" aria-label="Next slide" onClick={() => context.scroll(1)} className={className} {...props}><ChevronRight className="size-4" /></Button>;
}
