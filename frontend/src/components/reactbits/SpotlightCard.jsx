import { useRef, useCallback } from "react";
import "./SpotlightCard.css";

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(100, 130, 255, 0.08)",
}) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  // Throttle mousemove to requestAnimationFrame for 60fps
  const handleMouseMove = useCallback((e) => {
    if (rafRef.current) return; // skip if a frame is pending
    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current;
      if (!card) { rafRef.current = null; return; }
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      card.style.setProperty("--spotlight-color", spotlightColor);
      rafRef.current = null;
    });
  }, [spotlightColor]);

  return (
    <div
      ref={cardRef}
      className={`card-spotlight ${className}`}
      onMouseMove={handleMouseMove}
    >
      {children}
    </div>
  );
}
