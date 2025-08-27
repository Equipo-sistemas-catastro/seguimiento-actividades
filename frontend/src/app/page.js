"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => {
    const t = getToken();
    router.replace(t ? "/home" : "/login");
  }, [router]);
  return null;
}
