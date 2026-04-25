export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1010", color: "#ededed" }}>
      {children}
    </div>
  );
}
