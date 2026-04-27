import { useEffect, useState, useRef } from "react";

const LEAF_COUNT = 25;

export const FallingLeaves = () => {
  const [scrollPos, setScrollPos] = useState(0);
  const leavesRef = useRef<Array<{ 
    id: number; 
    left: number; 
    delay: number; 
    speed: number; 
    rotation: number;
    size: number;
    opacity: number;
    type: number;
  }>>([]);

  useEffect(() => {
    leavesRef.current = Array.from({ length: LEAF_COUNT }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      speed: 0.3 + Math.random() * 1.2,
      rotation: Math.random() * 360,
      size: 10 + Math.random() * 20,
      opacity: 0.2 + Math.random() * 0.4,
      type: Math.floor(Math.random() * 3),
    }));

    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {leavesRef.current.map((leaf) => {
        const yOffset = (scrollPos * leaf.speed + leaf.id * 100) % (window.innerHeight + 200);
        const xSway = Math.sin(scrollPos / 80 + leaf.id) * 30;
        
        return (
          <div
            key={leaf.id}
            className="absolute text-sage transition-transform duration-500 ease-out"
            style={{
              left: `${leaf.left}%`,
              top: `${yOffset - 150}px`,
              opacity: leaf.opacity,
              transform: `translateX(${xSway}px) rotate(${leaf.rotation + scrollPos / 1.5}deg)`,
            }}
          >
            {leaf.type === 0 ? (
              <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
              </svg>
            ) : leaf.type === 1 ? (
              <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,8C8,8 4,16 4,16C4,16 8,12 17,12C17,12 19,12 21,10C21,10 19,8 17,8Z" />
              </svg>
            ) : (
              <svg width={leaf.size} height={leaf.size} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C12 2 12 12 2 12C2 12 12 12 12 22C12 22 12 12 22 12C22 12 12 12 12 2z" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};

