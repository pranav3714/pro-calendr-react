import { useEffect, useRef } from "react";
import type { UseSyncScrollParams } from "../interfaces/timeline-hook-params";

export function useSyncScroll({ sourceRef, targetRef }: UseSyncScrollParams): void {
  const rafIdRef = useRef<number>(0);

  useEffect(() => {
    const source = sourceRef.current;
    const target = targetRef.current;

    if (!source || !target) {
      return;
    }

    function handleScroll(): void {
      cancelAnimationFrame(rafIdRef.current);

      rafIdRef.current = requestAnimationFrame(() => {
        if (!source || !target) {
          return;
        }
        target.scrollTop = source.scrollTop;
      });
    }

    source.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      source.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [sourceRef, targetRef]);
}
