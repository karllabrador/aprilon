"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageParam?: string;
  params?: Record<string, string>;
  scrollTargetId?: string;
  // Discourse-style sidebar (all optional — sidebar hidden when omitted)
  totalItems?: number;
  rangeStart?: number; // 1-based index of first item on current page
  rangeEnd?: number; // 1-based index of last item on current page
  firstDate?: number; // unix ts of very first item (for scrub interpolation)
  lastDate?: number; // unix ts of very last item (for scrub interpolation)
  currentStartDate?: number;
  currentEndDate?: number;
  itemLabel?: string;
};

function pageUrl(
  page: number,
  pageParam: string,
  extra?: Record<string, string>,
): string {
  const p = new URLSearchParams();
  if (extra) for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  if (page > 1) p.set(pageParam, String(page));
  const qs = p.toString();
  return qs ? `?${qs}` : "?";
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
  scrollTargetId,
  totalItems,
  rangeStart,
  rangeEnd,
  firstDate,
  lastDate,
  currentStartDate,
  currentEndDate,
  itemLabel = "item",
}: PaginationProps) {
  const router = useRouter();
  const [vertHover, setVertHover] = useState<number | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    if (!scrollTargetId) return;
    document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [currentPage, scrollTargetId]);

  if (totalPages <= 1) return null;

  const thumbPct = ((currentPage - 0.5) / totalPages) * 100;

  // Vertical scrubber
  function handleVertClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientY - rect.top) / rect.height),
    );
    const page = Math.max(
      1,
      Math.min(totalPages, Math.ceil(ratio * totalPages)),
    );
    router.push(pageUrl(page, pageParam, params), { scroll: false });
  }

  const hoverPage =
    vertHover !== null
      ? Math.max(1, Math.min(totalPages, Math.ceil(vertHover * totalPages)))
      : null;
  const hoverDate =
    vertHover !== null && firstDate != null && lastDate != null
      ? Math.round(firstDate + (lastDate - firstDate) * vertHover)
      : null;
  const hoverItemNum =
    vertHover !== null && totalItems != null
      ? Math.max(1, Math.min(totalItems, Math.round(vertHover * totalItems)))
      : null;

  return (
    <>
      {totalItems != null && (
        <div className="fixed right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 select-none">
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
              scroll={false}
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
            style={{
              width: "6px",
              height: "220px",
              backgroundColor: "#1e2028",
            }}
            onClick={handleVertClick}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setVertHover(
                Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
              );
            }}
            onMouseLeave={() => setVertHover(null)}
          >
            {/* Filled */}
            <div
              className="absolute top-0 left-0 w-full rounded-full"
              style={{ height: `${thumbPct}%`, backgroundColor: "#2e4a90" }}
            />
            {/* Thumb */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2"
              style={{
                top: `${thumbPct}%`,
                backgroundColor: "#4872c0",
                borderColor: "#6090d0",
              }}
            />
            {/* Hover indicator + tooltip */}
            {vertHover !== null && hoverPage !== currentPage && (
              <>
                {/* Ghost dot on track */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
                  style={{
                    top: `${vertHover * 100}%`,
                    backgroundColor: "#3858a8",
                  }}
                />
                {/* Tooltip pill to the left of the track */}
                <div
                  className="absolute right-full mr-3 pointer-events-none"
                  style={{
                    top: `${vertHover * 100}%`,
                    transform: "translateY(-50%)",
                  }}
                >
                  <div
                    className="px-2 py-1 rounded text-xs leading-snug whitespace-nowrap"
                    style={{
                      backgroundColor: "#252630",
                      border: "1px solid #3a3b44",
                    }}
                  >
                    {hoverItemNum != null && (
                      <div className="text-[#ededed] font-mono text-[11px]">
                        {itemLabel} {hoverItemNum.toLocaleString()}
                      </div>
                    )}
                    {hoverDate != null ? (
                      <div className="text-gray-500 text-[10px]">
                        {fmtShort(hoverDate)}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-[10px]">
                        page {hoverPage}
                      </div>
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
              scroll={false}
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

      {/* ── Bottom page buttons (right-aligned) ── */}
      <div className="flex items-center justify-end gap-0.5 flex-wrap mt-4">
        {currentPage > 1 ? (
          <Link
            href={pageUrl(currentPage - 1, pageParam, params)}
            scroll={false}
            className="px-2.5 py-1 rounded text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Prev
          </Link>
        ) : (
          <span className="px-2.5 py-1 rounded text-xs text-gray-700 cursor-default">
            ← Prev
          </span>
        )}

        {getPageRange(currentPage, totalPages).map((p, i) =>
          p === null ? (
            <span
              key={`ellipsis-${i}`}
              className="px-1 text-gray-700 text-xs select-none"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageUrl(p, pageParam, params)}
              scroll={false}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${p === currentPage ? "text-[#ededed]" : "text-gray-500 hover:text-gray-300"}`}
              style={
                p === currentPage ? { backgroundColor: "#353640" } : undefined
              }
            >
              {p}
            </Link>
          ),
        )}

        {currentPage < totalPages ? (
          <Link
            href={pageUrl(currentPage + 1, pageParam, params)}
            scroll={false}
            className="px-2.5 py-1 rounded text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Next →
          </Link>
        ) : (
          <span className="px-2.5 py-1 rounded text-xs text-gray-700 cursor-default">
            Next →
          </span>
        )}
      </div>
    </>
  );
}

function getPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3)
    return [1, null, total - 4, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}
