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
const DOUBLE_CLICK_SCALE = 2.5;
const SWIPE_THRESHOLD = 50;
const AXIS_LOCK_THRESHOLD = 8;

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

type GestureMode = 'idle' | 'pan' | 'pinch' | 'swipe';

/**
 * Fullscreen image viewer: pinch-to-zoom, drag-to-pan while zoomed, and swipe
 * left/right between images while at 1x. Opened by tapping the main product
 * image (mobile & desktop). Index changes happen synchronously with the
 * pointer-up event (no timers) so there's no risk of the slide getting stuck
 * mid-drag.
 */
export const ProductImageLightbox = ({ images, name, initialIndex, onClose }: Props) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState<Point>({ x: 0, y: 0 });
  const [dragX, setDragX] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);

  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef({
    mode: 'idle' as GestureMode,
    startScale: 1,
    startDistance: 0,
    startTranslate: { x: 0, y: 0 } as Point,
    startCenter: { x: 0, y: 0 } as Point,
  });
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const translateRef = useRef(translate);
  translateRef.current = translate;
  const dragXRef = useRef(dragX);
  dragXRef.current = dragX;

  const isZoomed = scale > 1.02;
  const canNavigate = images.length > 1;

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
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.mode = 'pinch';
      gesture.current.startDistance = distance(a, b);
      gesture.current.startScale = scaleRef.current;
      gesture.current.startTranslate = translateRef.current;
      setDragX(0);
      return;
    }

    gesture.current.mode = scaleRef.current > 1.02 ? 'pan' : 'idle';
    gesture.current.startTranslate = translateRef.current;
    gesture.current.startCenter = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (gesture.current.mode === 'pinch') {
      if (pointers.current.size < 2) return;
      const [a, b] = [...pointers.current.values()];
      const nextDistance = distance(a, b);
      const ratio = gesture.current.startDistance ? nextDistance / gesture.current.startDistance : 1;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, gesture.current.startScale * ratio));
      setScale(nextScale);
      setTranslate(clampTranslate(gesture.current.startTranslate, nextScale));
      return;
    }

    const dx = e.clientX - gesture.current.startCenter.x;
    const dy = e.clientY - gesture.current.startCenter.y;

    if (gesture.current.mode === 'pan') {
      setTranslate(
        clampTranslate(
          { x: gesture.current.startTranslate.x + dx, y: gesture.current.startTranslate.y + dy },
          scaleRef.current,
        ),
      );
      return;
    }

    if (gesture.current.mode === 'idle' || gesture.current.mode === 'swipe') {
      if (!canNavigate) return;
      if (gesture.current.mode === 'idle') {
        if (Math.abs(dx) < AXIS_LOCK_THRESHOLD && Math.abs(dy) < AXIS_LOCK_THRESHOLD) return;
        if (Math.abs(dy) > Math.abs(dx)) return; // vertical intent — not a swipe
        gesture.current.mode = 'swipe';
      }
      if (gesture.current.mode === 'swipe') setDragX(dx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);

    if (gesture.current.mode === 'swipe') {
      // Read the last drag distance from the ref (always up to date, unlike
      // a state closure) and reset dragX + change the index in the same
      // synchronous handler — React batches both into a single render, so
      // the new image appears immediately at rest with no leftover offset.
      const finalDragX = dragXRef.current;
      setDragX(0);
      if (Math.abs(finalDragX) > SWIPE_THRESHOLD) {
        if (finalDragX < 0) goNext();
        else goPrev();
      }
    }

    if (gesture.current.mode === 'pinch' && pointers.current.size < 2) {
      gesture.current.mode = pointers.current.size === 1 ? 'pan' : 'idle';
      if (scaleRef.current < MIN_SCALE + 0.02) resetZoom();
    } else if (pointers.current.size === 0) {
      gesture.current.mode = 'idle';
      if (scaleRef.current < MIN_SCALE + 0.02) resetZoom();
    }
  };

  const counter = useMemo(() => `${index + 1} / ${images.length}`, [index, images.length]);

  const imageTransform =
    dragX !== 0
      ? `translate(${dragX}px, 0) scale(${scale})`
      : `translate(${translate.x}px, ${translate.y}px) scale(${scale})`;

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
          else setScale(DOUBLE_CLICK_SCALE);
        }}
      >
        <img
          src={images[index]}
          alt={`${name} — uvećana slika ${index + 1}`}
          className="product-lightbox-image"
          style={{
            transform: imageTransform,
            transition: dragX === 0 ? 'transform 150ms ease-out' : 'none',
          }}
          draggable={false}
        />
      </div>

      {canNavigate && !isZoomed && (
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
        <p className="product-lightbox-hint">
          {canNavigate ? 'Prevucite za sledeću sliku · raširite prste za zum' : 'Raširite prste za zum'}
        </p>
      )}
    </div>
  );
};
