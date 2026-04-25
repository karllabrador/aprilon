import Link from "next/link";
import AprilonLogo from "@/components/common/AprilonLogo";

type Crumb = { label: string; href?: string };

type ArchiveHeaderProps = {
  breadcrumbs?: Crumb[];
};

export default function ArchiveHeader({ breadcrumbs = [] }: ArchiveHeaderProps) {
  const crumbs: Crumb[] = [{ label: "Archive", href: "/archive" }, ...breadcrumbs];

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "linear-gradient(to bottom, #18191d, #1e1f23)",
        borderColor: "#2e2f38",
        boxShadow: "0 1px 0 rgba(90,160,160,0.06), 0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div className="container max-w-336 mx-auto max-[1344px]:px-6 py-3 flex items-center gap-6">
        <Link href="/" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <AprilonLogo width={72} className="text-[#ededed]" />
        </Link>

        <div className="w-px h-5 shrink-0" style={{ backgroundColor: "#3a3b44" }} />

        <nav className="flex items-center gap-2 text-sm min-w-0">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2 min-w-0">
              {i > 0 && <span className="text-gray-600 shrink-0">/</span>}
              {crumb.href && i < crumbs.length - 1 ? (
                <Link href={crumb.href} className="text-gray-400 hover:text-gray-200 transition-colors shrink-0">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-300 truncate">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
