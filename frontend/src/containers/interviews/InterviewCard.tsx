"use client";

import { InterviewPerson } from "@/types/interview";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function InterviewCard({ person }: { person: InterviewPerson }) {
  const router = useRouter();

  return (
    <motion.div
      layoutId={`interview-${person.slug}`}
      onClick={() => router.push(`/interviews/${person.slug}`)}
      className="cursor-pointer overflow-hidden rounded-xl group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }} // ⭐ 手機用
    >
      <div className="aspect-[3/4] overflow-hidden">
        <img
          src={person.coverImage}
          alt={person.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
      </div>

      <div className="p-3 space-y-1 flex flex-col justify-center items-center">
        <h3 className="font-semibold">{person.name}</h3>
        <p className="text-sm">{person.role}</p>

        {/* 👇 可點擊提示 */}
        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
          查看人物故事
          <span aria-hidden>
            <ArrowRightOutlined />
          </span>
        </p>
      </div>
    </motion.div>
  );
}
