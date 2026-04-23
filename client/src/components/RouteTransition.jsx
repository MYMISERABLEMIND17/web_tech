import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";

function prefersReducedMotion() {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
}

export default function RouteTransition({ children }) {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 10, filter: "blur(8px)" },
      { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out" }
    );
  }, [location.pathname]);

  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

