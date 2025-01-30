"use client";
// import { useRouter } from "next/navigation";
// import { useEffect } from "react";
export default function Home() {
  // const router = useRouter();

  // useEffect(() => {
  //   const isAuthenticated = localStorage.getItem("auth-token");

  //   if (!isAuthenticated) {
  //     router.push("/login");
  //   }
  // }, [router]);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1> Welcome to Kerocure hospital management system</h1>
    </div>
  );
}
