import BackButton from "@/components/BackButton";

export default function NotFound() {
  return (
    <>
      <div className="w-full h-[70vh] flex flex-col justify-center items-center text-center p-6 font-dela">
        <h1 className="text-4xl font-dela mb-4">404 – Page Not Found</h1>
        <p className="text-lg mb-6">
          The page you are looking for does not exist.
        </p>

        <BackButton className="mt-6" />
      </div>
    </>
  );
}
