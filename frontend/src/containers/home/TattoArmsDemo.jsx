import { useMotionValue, motion, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ExpandAltOutlined } from "@ant-design/icons";
import a1 from "@/assets/images/tattoo-arms/1.png";
import a2 from "@/assets/images/tattoo-arms/2.png";
import a3 from "@/assets/images/tattoo-arms/3.png";
import a4 from "@/assets/images/tattoo-arms/4.png";
import a5 from "@/assets/images/tattoo-arms/5.png";
import a6 from "@/assets/images/tattoo-arms/6.png";
import a221 from "@/assets/images/tattoo-arms/2-2-1.png";
import a321 from "@/assets/images/tattoo-arms/3-2-1.png";
import a421 from "@/assets/images/tattoo-arms/4-2-1.png";
import a521 from "@/assets/images/tattoo-arms/5-2-1.png";
import a621 from "@/assets/images/tattoo-arms/6-2-1.png";
import useGSAP from "@/hooks/useGsap";

const afterImages = [`${a2}`, `${a3}`, `${a4}`, `${a5}`, `${a6}`];
const labelImages = [`${a221}`, `${a321}`, `${a421}`, `${a521}`, `${a621}`];

const TattooArmsDemo = () => {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  useGSAP();

  useEffect(() => {
    const containerWidth = containerRef.current?.offsetWidth || 0;
    x.set(containerWidth / 2);
  }, [currentIndex]);

  const clipX = useTransform(x, (value) => {
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const percent = (value / containerWidth) * 100;
    return `inset(0 0 0 ${percent}%)`;
  });

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-[400px] overflow-hidden animate-right"
        // transition-all duration-500
      >
        <img src={a1} className="absolute w-full h-full object-cover" />
        <motion.img
          src={afterImages[currentIndex]}
          className="absolute w-full h-full object-cover"
          style={{ clipPath: clipX }}
        />
        <motion.div
          drag="x"
          dragConstraints={containerRef}
          style={{ x }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          className={`w-1.5 absolute top-0 bottom-0 z-10 bg-primaryGray rounded-sm cursor-col-resize
            ${
              isDragging
                ? "shadow-xl w-2 bg-blue-300"
                : "hover:w-2 hover:bg-blue-200"
            }`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primaryGray text-white flex items-center justify-center rounded-full shadow-md">
            <span className="text-lg font-bold text-black">
              <ExpandAltOutlined className="rotate-45" />
            </span>
          </div>
        </motion.div>
      </div>

      <div className="flex gap-2 justify-center">
        {labelImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`px-3 py-1 rounded border ${
              i === currentIndex
                ? "bg-gray-200 scale-110 shadow-lg"
                : "hover:bg-gray-300 shadow-lg"
            }`}
          >
            <img
              src={img}
              alt={`Option ${i + 1}`}
              className="w-12 h-12 object-cover rounded"
            />
          </button>
        ))}
      </div>
    </>
  );
};

export default TattooArmsDemo;
