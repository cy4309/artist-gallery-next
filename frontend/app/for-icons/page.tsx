"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faHeart,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";

export default function TestPage() {
  return (
    <div className="w-full h-full flex">
      <div className="w-60 h-60 max-w-2xl border border-gray-800 flex flex-col justify-center items-center font-nunito gap-1 mx-auto">
        <FontAwesomeIcon
          icon={faCalendarDays}
          className="text-6xl text-primaryBlue"
        />
        <h2>View Activities</h2>
        <h2>查看活動</h2>
      </div>

      <div className="w-60 h-60 max-w-2xl border border-gray-800 flex flex-col justify-center items-center font-nunito gap-1 mx-auto">
        <FontAwesomeIcon icon={faHeart} className="text-6xl text-primaryBlue" />
        <h2>Saved</h2>
        <h2>查看收藏</h2>
      </div>

      <div className="w-60 h-60 max-w-2xl border border-gray-800 flex flex-col justify-center items-center font-nunito gap-1 mx-auto">
        <FontAwesomeIcon
          icon={faNewspaper}
          className="text-6xl text-primaryBlue"
        />
        <h2>Zine Column</h2>
        <h2>查看專欄</h2>
      </div>
    </div>
  );
}
