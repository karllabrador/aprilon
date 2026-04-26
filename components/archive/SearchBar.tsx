"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type SearchBarProps = {
  initialQuery?: string;
  placeholder?: string;
  extraParams?: Record<string, string>;
};

export default function SearchBar({
  initialQuery = "",
  placeholder = "Search…",
  extraParams,
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);

  function navigate(q: string) {
    const params = new URLSearchParams();
    if (extraParams) {
      for (const [k, v] of Object.entries(extraParams)) params.set(k, v);
    }
    if (q) params.set("q", q);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    navigate(value.trim());
  }

  function handleClear() {
    setValue("");
    navigate("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center">
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors focus-within:border-[#283880]"
        style={{ backgroundColor: "#18191b", borderColor: "#2a2b2e" }}
      >
        <svg
          className="shrink-0 text-gray-600"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="bg-transparent outline-none text-gray-300 placeholder-gray-600 w-40"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-600 hover:text-gray-400 transition-colors leading-none"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
