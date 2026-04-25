import Link from "next/link";

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
        backgroundColor: "#0f1414",
        borderColor: "#1e2424",
      }}
    >
      <div className="container max-w-336 mx-auto max-[1344px]:px-6 py-3 flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
          Home
        </Link>
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-gray-600">/</span>
            {crumb.href && i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="text-gray-400 hover:text-gray-200 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-300">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>
    </header>
  );
}
