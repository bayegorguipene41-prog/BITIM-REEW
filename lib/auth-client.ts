"use client";

import { useSession, signOut } from "next-auth/react";

export function useClientAuth() {
  const { data, status } = useSession();
  return {
    status,
    logged: status === "authenticated",
    session: data?.user ?? null,
    signOut: () => signOut({ callbackUrl: undefined }),
  };
}
