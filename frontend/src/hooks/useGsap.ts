import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useGSAP = (): void => {
  const animateElements = () => {
    const leftElements = gsap.utils.toArray<HTMLElement>(".animate-left");
    const rightElements = gsap.utils.toArray<HTMLElement>(".animate-right");

    leftElements.forEach((element) => {
      gsap.fromTo(
        element,
        { x: "-10%", opacity: 0 },
        {
          x: "0%",
          opacity: 1,
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            end: "bottom 40%",
            scrub: 0.5,
          },
        }
      );
    });

    rightElements.forEach((element) => {
      gsap.fromTo(
        element,
        { x: "10%", opacity: 0 },
        {
          x: "0%",
          opacity: 1,
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
            end: "bottom 40%",
            scrub: 0.5,
          },
        }
      );
    });
  };

  useEffect(() => {
    animateElements();

    const handleResize = () => {
      ScrollTrigger.refresh();
      animateElements();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
};

export default useGSAP;
