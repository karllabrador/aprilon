import Footer from "@/components/common/Footer";

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#27282c", color: "#ededed" }}>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
