"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type SearchBarProps = {
  initialQuery?: string;
  placeholder?: string;
};

export default function SearchBar({
  initialQuery = "",
  placeholder = "Search…",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);

  function navigate(q: string) {
    router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
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
        className="flex items-center gap-2 px-3 py-1.5 rounded border text-sm"
        style={{ backgroundColor: "#0c1010", borderColor: "#1e2424" }}
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
