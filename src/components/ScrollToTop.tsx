import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "./ui/button";

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 z-50 h-12 w-12 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/50 bg-primary/90 backdrop-blur-md border border-white/10"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}
    </>
  );
};
