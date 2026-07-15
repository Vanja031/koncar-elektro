'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Point = { x: number; y: number };

type Props = {
  images: string[];
  name: string;
  initialIndex: number;
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_THRESHOLD = 50;
const DOUBLE_TAP_WINDOW_MS = 300;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Fullscreen image viewer: pinch-to-zoom, double-tap-to-zoom, drag-to-pan while
 * zoomed, and swipe left/right between images while at 1x. Opened by tapping the
 * main product image (mobile & desktop).
 */
export const ProductImageLightbox = ({ images, name, initialIndex, onClose }: Props) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 });
  const frameRef = useRef<HTMLDivElement>(null);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef({
    mode: 'idle' as 'idle' | 'pan' | 'pinch',
    startScale: 1,
    startDistance: 0,
    startTranslate: { x: 0, y: 0 } as Point,
    startCenter: { x: 0, y: 0 } as Point,
    lastTapAt: 0,
    moved: false,
  });

  const isZoomed = scale > 1.02;

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [index, resetZoom]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const clampTranslate = useCallback((point: Point, nextScale: number): Point => {
    const el = frameRef.current;
    if (!el) return point;
    const rect = el.getBoundingClientRect();
    const maxX = (rect.width * (nextScale - 1)) / 2;
    const maxY = (rect.height * (nextScale - 1)) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, point.x)),
      y: Math.min(maxY, Math.max(-maxY, point.y)),
    };
  }, []);

  const goPrev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);
  const goNext = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current.moved = false;

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.mode = 'pinch';
      gesture.current.startDistance = distance(a, b);
      gesture.current.startScale = scale;
      gesture.current.startTranslate = translate;
      return;
    }

    const now = Date.now();
    const isDoubleTap = now - gesture.current.lastTapAt < DOUBLE_TAP_WINDOW_MS;
    gesture.current.lastTapAt = now;

    if (isDoubleTap) {
      gesture.current.mode = 'idle';
      if (isZoomed) {
        resetZoom();
      } else {
        setScale(DOUBLE_TAP_SCALE);
      }
      return;
    }

    gesture.current.mode = isZoomed ? 'pan' : 'idle';
    gesture.current.startTranslate = translate;
    gesture.current.startCenter = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current.moved = true;

    if (gesture.current.mode === 'pinch' && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const nextDistance = distance(a, b);
      const ratio = gesture.current.startDistance ? nextDistance / gesture.current.startDistance : 1;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, gesture.current.startScale * ratio));
      setScale(nextScale);
      setTranslate(clampTranslate(gesture.current.startTranslate, nextScale));
      return;
    }

    if (gesture.current.mode === 'pan') {
      const dx = e.clientX - gesture.current.startCenter.x;
      const dy = e.clientY - gesture.current.startCenter.y;
      setTranslate(
        clampTranslate(
          { x: gesture.current.startTranslate.x + dx, y: gesture.current.startTranslate.y + dy },
          scale,
        ),
      );
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = pointers.current.get(e.pointerId);
    pointers.current.delete(e.pointerId);

    const wasSwipe =
      gesture.current.mode === 'idle' &&
      !isZoomed &&
      start &&
      Math.abs(e.clientX - start.x) > SWIPE_THRESHOLD &&
      Math.abs(e.clientX - start.x) > Math.abs(e.clientY - start.y);

    if (wasSwipe && start) {
      if (e.clientX - start.x < 0) goNext();
      else goPrev();
    }

    if (pointers.current.size < 2 && gesture.current.mode === 'pinch') {
      gesture.current.mode = pointers.current.size === 1 ? 'pan' : 'idle';
      if (scale < MIN_SCALE + 0.02) resetZoom();
    }

    if (pointers.current.size === 0) {
      gesture.current.mode = 'idle';
      if (scale < MIN_SCALE + 0.02) resetZoom();
    }
  };

  const counter = useMemo(() => `${index + 1} / ${images.length}`, [index, images.length]);

  return (
    <div className="product-lightbox" role="dialog" aria-modal="true" aria-label={`Uvećan prikaz — ${name}`}>
      <div className="product-lightbox-topbar">
        {images.length > 1 && <span className="product-lightbox-counter">{counter}</span>}
        <button type="button" onClick={onClose} className="product-lightbox-close" aria-label="Zatvori uvećan prikaz">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={frameRef}
        className="product-lightbox-frame"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={(e) => {
          e.preventDefault();
          if (isZoomed) resetZoom();
          else setScale(DOUBLE_TAP_SCALE);
        }}
      >
        <img
          src={images[index]}
          alt={`${name} — uvećana slika ${index + 1}`}
          className="product-lightbox-image"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transition: gesture.current.mode === 'idle' ? 'transform 150ms ease-out' : 'none',
          }}
          draggable={false}
        />
      </div>

      {images.length > 1 && !isZoomed && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="product-lightbox-arrow product-lightbox-arrow--left"
            aria-label="Prethodna slika"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="product-lightbox-arrow product-lightbox-arrow--right"
            aria-label="Sledeća slika"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {!isZoomed && (
        <p className="product-lightbox-hint">Prevucite dva prsta ili dupli tap za zumiranje</p>
      )}
    </div>
  );
};
