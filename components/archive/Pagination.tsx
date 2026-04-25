"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageParam?: string;
  params?: Record<string, string>;
  // Discourse-style sidebar (all optional — sidebar hidden when omitted)
  totalItems?: number;
  itemsPerPage?: number;
  rangeStart?: number;      // 1-based index of first item on current page
  rangeEnd?: number;        // 1-based index of last item on current page
  firstDate?: number;       // unix ts of very first item (for scrub interpolation)
  lastDate?: number;        // unix ts of very last item (for scrub interpolation)
  currentStartDate?: number;
  currentEndDate?: number;
  itemLabel?: string;
};

function pageUrl(page: number, pageParam: string, extra?: Record<string, string>): string {
  const p = new URLSearchParams();
  if (extra) for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  if (page > 1) p.set(pageParam, String(page));
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
}

function getPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}

function fmtShort(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function Pagination({
  currentPage,
  totalPages,
  pageParam = "page",
  params,
  totalItems,
  itemsPerPage,
  rangeStart,
  rangeEnd,
  firstDate,
  lastDate,
  currentStartDate,
  currentEndDate,
  itemLabel = "item",
}: PaginationProps) {
  const router = useRouter();
  const [vertHover, setVertHover] = useState<number | null>(null);   // 0–1 ratio
  const [horizHoverPage, setHorizHoverPage] = useState<number | null>(null);

  if (totalPages <= 1) return null;

  const pages = getPageRange(currentPage, totalPages);
  const thumbPct = ((currentPage - 0.5) / totalPages) * 100;

  // Vertical scrubber
  function handleVertClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const page = Math.max(1, Math.min(totalPages, Math.ceil(ratio * totalPages)));
    router.push(pageUrl(page, pageParam, params));
  }

  const hoverPage = vertHover !== null
    ? Math.max(1, Math.min(totalPages, Math.ceil(vertHover * totalPages)))
    : null;
  const hoverDate = vertHover !== null && firstDate != null && lastDate != null
    ? Math.round(firstDate + (lastDate - firstDate) * vertHover)
    : null;
  const hoverItemNum = vertHover !== null && totalItems != null
    ? Math.max(1, Math.min(totalItems, Math.round(vertHover * totalItems)))
    : null;

  // Horizontal scrubber
  function handleHorizClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const page = Math.max(1, Math.min(totalPages, Math.ceil(ratio * totalPages)));
    router.push(pageUrl(page, pageParam, params));
  }

  const linkBase = "px-2.5 py-1 rounded text-xs transition-colors";
  const activeLink = `${linkBase} text-[#ededed]`;
  const inactiveLink = `${linkBase} text-gray-500 hover:text-gray-300`;
  const arrowLink = `${linkBase} text-gray-500 hover:text-gray-300`;

  return (
    <>
      {/* ── Discourse-style right sidebar (xl+ only) ── */}
      {totalItems != null && (
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center gap-2 select-none">
          {/* Current range */}
          <div className="text-center leading-tight">
            {rangeStart != null && rangeEnd != null && (
              <div className="text-xs font-mono text-[#ededed]">
                {rangeStart}–{rangeEnd}
              </div>
            )}
            <div className="text-[10px] text-gray-600">
              of {totalItems.toLocaleString()} {itemLabel}s
            </div>
          </div>

          {/* Prev */}
          {currentPage > 1 ? (
            <Link
              href={pageUrl(currentPage - 1, pageParam, params)}
              className="text-gray-600 hover:text-gray-300 transition-colors leading-none"
              title={`Previous page`}
            >
              ▲
            </Link>
          ) : (
            <span className="text-gray-800 leading-none cursor-default">▲</span>
          )}

          {/* Vertical track */}
          <div
            className="relative cursor-pointer rounded-full"
            style={{ width: "6px", height: "220px", backgroundColor: "#141c1c" }}
            onClick={handleVertClick}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVertHover(Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)));
            }}
            onMouseLeave={() => setVertHover(null)}
          >
            {/* Filled */}
            <div
              className="absolute top-0 left-0 w-full rounded-full"
              style={{ height: `${thumbPct}%`, backgroundColor: "#2a3838" }}
            />
            {/* Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2"
              style={{
                top: `${thumbPct}%`,
                backgroundColor: "#4a6060",
                borderColor: "#5a7070",
              }}
            />
            {/* Hover indicator + tooltip */}
            {vertHover !== null && hoverPage !== currentPage && (
              <>
                {/* Ghost dot on track */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                  style={{ top: `${vertHover * 100}%`, backgroundColor: "#3a4e4e" }}
                />
                {/* Tooltip pill to the left */}
                <div
                  className="absolute right-5 pointer-events-none"
                  style={{ top: `${vertHover * 100}%`, transform: "translateY(-50%)" }}
                >
                  <div
                    className="px-2 py-1 rounded text-xs leading-snug whitespace-nowrap"
                    style={{ backgroundColor: "#1a2424", border: "1px solid #2a3838" }}
                  >
                    {hoverItemNum != null && (
                      <div className="text-[#ededed] font-mono text-[11px]">
                        {itemLabel} {hoverItemNum.toLocaleString()}
                      </div>
                    )}
                    {hoverDate != null ? (
                      <div className="text-gray-500 text-[10px]">{fmtShort(hoverDate)}</div>
                    ) : (
                      <div className="text-gray-500 text-[10px]">page {hoverPage}</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Next */}
          {currentPage < totalPages ? (
            <Link
              href={pageUrl(currentPage + 1, pageParam, params)}
              className="text-gray-600 hover:text-gray-300 transition-colors leading-none"
              title={`Next page`}
            >
              ▼
            </Link>
          ) : (
            <span className="text-gray-800 leading-none cursor-default">▼</span>
          )}

          {/* Current date range */}
          {currentStartDate != null && (
            <div className="text-[10px] text-gray-600 text-center leading-tight">
              {fmtShort(currentStartDate)}
              {currentEndDate != null &&
                currentEndDate !== currentStartDate &&
                fmtShort(currentEndDate) !== fmtShort(currentStartDate) && (
                  <>
                    <br />
                    {fmtShort(currentEndDate)}
                  </>
                )}
            </div>
          )}
        </div>
      )}

      {/* ── Bottom page controls ── */}
      <div className="space-y-3 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 flex-wrap">
            {currentPage > 1 ? (
              <Link href={pageUrl(currentPage - 1, pageParam, params)} className={arrowLink}>← Prev</Link>
            ) : (
              <span className={`${linkBase} text-gray-700 cursor-default`}>← Prev</span>
            )}

            {pages.map((p, i) =>
              p === null ? (
                <span key={`ellipsis-${i}`} className="px-1 text-gray-700 text-xs select-none">…</span>
              ) : (
                <Link
                  key={p}
                  href={pageUrl(p, pageParam, params)}
                  className={p === currentPage ? activeLink : inactiveLink}
                  style={p === currentPage ? { backgroundColor: "#1a2424" } : undefined}
                >
                  {p}
                </Link>
              )
            )}

            {currentPage < totalPages ? (
              <Link href={pageUrl(currentPage + 1, pageParam, params)} className={arrowLink}>Next →</Link>
            ) : (
              <span className={`${linkBase} text-gray-700 cursor-default`}>Next →</span>
            )}
          </div>

          <span className="text-xs text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        {/* Horizontal scrubber track */}
        <div
          className="relative h-1 rounded-full cursor-pointer"
          style={{ backgroundColor: "#141c1c" }}
          onClick={handleHorizClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setHorizHoverPage(Math.max(1, Math.min(totalPages, Math.ceil(ratio * totalPages))));
          }}
          onMouseLeave={() => setHorizHoverPage(null)}
          title={horizHoverPage != null ? `Jump to page ${horizHoverPage}` : undefined}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ width: `${thumbPct}%`, backgroundColor: "#2a3838" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border"
            style={{
              left: `${thumbPct}%`,
              backgroundColor: "#4a6060",
              borderColor: "#5a7070",
            }}
          />
          {horizHoverPage != null && horizHoverPage !== currentPage && (
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
              style={{
                left: `${((horizHoverPage - 0.5) / totalPages) * 100}%`,
                backgroundColor: "#3a4e4e",
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
