"use client";

import { useState, useMemo } from "react";
import { interviews } from "@/data/interviews/interviews";
import InterviewFilter, {
  FilterTag,
} from "@/containers/interviews/InterviewFilter";
import InterviewGrid from "@/containers/interviews/InterviewGrid";
import Hero from "@/containers/interviews/Hero";
import { useLocale } from "@/locales/contexts/LocaleContext";

export default function InterviewsPage() {
  const { t } = useLocale();
  const [activeTag, setActiveTag] = useState<FilterTag>("all");

  const filteredInterviews = useMemo(() => {
    if (activeTag === "all") {
      return interviews;
    }

    return interviews.filter((person) => person.tags.includes(activeTag));
  }, [activeTag]);

  return (
    <div className="px-4 w-full space-y-24 bg-[url('/images/texture-1.jpg')] text-white">
      <Hero />
      <InterviewFilter active={activeTag} onChange={setActiveTag} />
      <InterviewGrid people={filteredInterviews} />
      <h5 className="text-center py-40 text-gray-400">
        {t.interviews.continue}
      </h5>
    </div>
  );
}

// 以下舊版能work----------------------------------------------------------------------------------------------------------
// "use client";

// import Hero from "@/containers/interviews/Hero";
// import ProfileSectionWenChia from "@/containers/interviews/ProfileSectionWenChia";
// // import Quote from "@/containers/interviews/Quote";
// import ProfileSectionBoan from "@/containers/interviews/ProfileSectionBoan";
// import ProfileSectionLemon from "@/containers/interviews/ProfileSectionLemon";
// import ProfileSectionLuke from "@/containers/interviews/ProfileSectionLuke";
// import { useLocale } from "@/locales/contexts/LocaleContext";

// export default function Interviews() {
//   const { t } = useLocale();
//   return (
//     <>
//       <div className="w-full h-full my-12 bg-[url('/images/texture-1.jpg')]">
//         {/* <section>
//           <img src={boanFocus} alt="" className="border" />
//           <h2>Boan</h2>
//         </section>
//         <section>
//           <img src={wenChiaFocus} alt="" className="border" />
//           <h2>Wen Chia</h2>
//         </section> */}
//         {/* <div className="bg-gradient-to-b from-white to-gray-500 text-gray-800 font-sans"> */}
//         <Hero />
//         <ProfileSectionWenChia />
//         {/* <Quote /> */}
//         <ProfileSectionBoan />
//         <ProfileSectionLemon />
//         <ProfileSectionLuke />
//         <h5 className="my-12 text-center text-gray-400">
//           {t.interviews.continue}
//         </h5>
//       </div>
//     </>
//   );
// }
