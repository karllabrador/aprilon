import { notFound } from "next/navigation";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import PmGraph from "@/components/archive/PmGraph";
import { getPmGraph } from "@/lib/forum";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Direct Message Graph — Aprilon Archive",
  description: "Visualise private message relationships between Aprilon community members.",
  openGraph: {
    title: "Direct Message Graph — Aprilon Archive",
    description: "Visualise private message relationships between Aprilon community members.",
  },
};

export default function GraphPage() {
  const data = getPmGraph();
  if (!data) notFound();

  return (
    <>
      <ArchiveHeader breadcrumbs={[{ label: "Direct Message Graph" }]} />
      <main className="container max-w-336 mx-auto max-[1344px]:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#ededed]">Direct Message Graph</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data.nodes.length.toLocaleString()} users &nbsp;·&nbsp;{" "}
            {data.links.length.toLocaleString()}{" "}relationships &nbsp;·&nbsp; arrows show message direction
          </p>
        </div>
        <PmGraph data={data} />
      </main>
    </>
  );
}
