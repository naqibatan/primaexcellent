import { useState, useEffect, useRef } from "react";
export const useDomDirection = () => {
  const [direction, setDirection] = useState();
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    setDirection(window.getComputedStyle(ref.current).direction);
  }, []);
  return { direction, directionRef: ref };
};
//# sourceMappingURL=useDomDirection.js.map
