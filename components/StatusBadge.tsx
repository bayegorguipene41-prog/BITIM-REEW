"use client";

import { statusLabel } from "@/lib/procedure-status";
import type { VerificationStatus } from "@/lib/types";

const STATUS_STYLES: Record<VerificationStatus, string> = {
  verified: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-blue-100 text-blue-800 border-blue-200",
  needs_review: "bg-amber-100 text-amber-800 border-amber-200",
  unavailable: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function StatusBadge({
  status,
  lang,
  className = "",
}: {
  status: VerificationStatus | undefined;
  lang: string;
  className?: string;
}) {
  if (!status) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
        STATUS_STYLES[status]
      } ${className}`}
    >
      {statusLabel(status, lang)}
    </span>
  );
}
