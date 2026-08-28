"use client";

import { interviews } from "@/data/interviews/interviews";
import { notFound, useParams } from "next/navigation";
// import { motion } from "framer-motion";
import { PROFILE_SECTION_MAP } from "@/data/interviews/interviewsProfileMap";
import BackButton from "@/components/BackButton";

function DefaultProfileFallback() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 text-gray-400">
      <p>More stories coming soon.</p>
    </section>
  );
}

export default function InterviewDetail() {
  const { slug } = useParams<{ slug: string }>();
  const person = interviews.find((p) => p.slug === slug);
  if (!person) notFound();

  const ProfileSection = PROFILE_SECTION_MAP[person.slug];

  return (
    <div className="w-full min-h-max bg-[url('/images/texture-1.jpg')] bg-repeat bg-top text-white">
      <BackButton className="m-4 text-white" />
      {/* Hero */}
      {/* <motion.div
        layoutId={`interview-${person.slug}`}
        className="w-full md:w-1/2 p-4 overflow-hidden mx-auto"
      >
        <img src={person.coverImage} className="w-full h-full object-cover" />
      </motion.div> */}

      {/* Content */}
      {/* <section className="max-w-3xl mx-auto px-6 space-y-2">
        <h1 className="text-4xl font-dela">{person.name}</h1>
        <p className="text-gray-500">{person.role}</p>
        <p className="text-gray-500">feat. {person.firm}</p>
      </section> */}

      {ProfileSection ? <ProfileSection /> : <DefaultProfileFallback />}
    </div>
  );
}
