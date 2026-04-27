"use client";

import { useEffect } from "react";

export default function PostHighlighter() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#post-")) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    el.classList.add("post-flash");
    el.addEventListener("animationend", () => el.classList.remove("post-flash"), { once: true });
  }, []);
  return null;
}
