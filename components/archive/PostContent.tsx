"use client";

import { useRouter } from "next/navigation";

type Props = {
  html: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function PostContent({ html, className, style }: Props) {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const anchor = (e.target as HTMLElement).closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href");
    if (!href?.startsWith("/archive/")) return;
    e.preventDefault();
    router.push(href);
  }

  return (
    <div
      className={className}
      style={style}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
