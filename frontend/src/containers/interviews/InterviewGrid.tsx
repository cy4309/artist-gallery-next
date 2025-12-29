import InterviewCard from "./InterviewCard";
import { InterviewPerson } from "@/types/interview";

export default function InterviewGrid({
  people,
}: {
  people: InterviewPerson[];
}) {
  return (
    <div className="max-w-5xl grid grid-cols-2 md:grid-cols-3 gap-6 mx-auto">
      {people.map((person) => (
        <InterviewCard key={person.slug} person={person} />
      ))}
    </div>
  );
}
