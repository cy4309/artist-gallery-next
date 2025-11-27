import { motion } from "framer-motion";
// import boanFocus from "@/assets/images/focus-boan.jpg";
// import wenChiaFocus from "@/assets/images/focus-wen-chia.jpg";
// import wenChiaFocusRbg from "@/assets/images/focus-wen-chia-removebg.png";
import BaseButton from "@/components/BaseButton";
// import { Card } from "antd";

export default function ProfileSectionWenChia() {
  const iframeAutoMutedPlay = `?autoplay=1&mute=1`;

  return (
    <>
      <motion.div className="w-full max-w-[480px] mx-auto">
        <motion.img
          src="/images/hero/hero-1024-1024-96dpi/wen-chia.png"
          alt="Wen Chia portrait"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
      </motion.div>

      <section className="px-6 py-12 w-full max-w-3xl mx-auto space-y-6 bg-white/10 backdrop-blur-md leading-relaxed flex flex-col items-center justify-center rounded-lg shadow-lg border-4 border-primary dark:border-primaryGray">
        {/* <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Rem molestiae
        tempore explicabo quae veniam quasi, quisquam dolorem laboriosam quis,
        vel placeat itaque inventore, expedita atque. Ipsam natus nulla itaque
        voluptas?
      </motion.p> */}

        {/* <motion.img
        src={wenChiaFocusRbgGpt}
        alt="Wen Chia portrait"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      /> */}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="flex flex-col items-center text-center"
        >
          <span className="text-4xl sm:text-6xl font-dela leading-relaxed">
            Wen Chia
          </span>
          <span className="font-dela leading-relaxed">Former Bassist.</span>
          <span className="font-dela leading-relaxed">
            Invincible Tapir 無敵貘
          </span>
          <BaseButton
            label="visit the website."
            className="my-4 w-full"
            onClick={() =>
              window.open(
                "https://www.youtube.com/watch?v=EEkoPJh-CaY&ab_channel=%E5%AE%85%E7%94%B7"
              )
            }
          ></BaseButton>
        </motion.p>
        <iframe
          src={`https://www.youtube.com/embed/EEkoPJh-CaY${iframeAutoMutedPlay}`}
          title="Wen Chia - Invincible Tapir 無敵貘"
          // allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          // allowFullScreen
          className="w-full h-[40vh]"
        ></iframe>
      </section>
    </>
  );
}
