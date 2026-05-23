import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "PUSH" || navigationType === "REPLACE") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
    // Ako je POP (back/forward), browser sam vraća scroll poziciju
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;
