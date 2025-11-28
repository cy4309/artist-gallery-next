"use client";

// import BaseButton from "@/components/BaseButton";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex justify-center items-center">
      {/* <BaseButton onClick={handleLogin} className="text-white bg-blue-600">
        Sign in with Google
      </BaseButton> */}
      <button
        onClick={() => (window.location.href = "/api/auth/login")}
        className="px-4 py-2 bg-red-600 text-white rounded"
      >
        Login with Google
      </button>
    </div>
  );
}
