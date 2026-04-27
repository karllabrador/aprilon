import { notFound } from "next/navigation";
import ArchiveHeader from "@/components/archive/ArchiveHeader";
import PmGraph from "@/components/archive/PmGraph";
import { getPmGraph } from "@/lib/forum";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Member Direct Message Graph — Aprilon Forum Archive",
  description: "Explore an interactive graph of private message relationships between Aprilon community members, showing connections and message volumes across the forum archive from 2009 to 2016.",
  openGraph: {
    title: "Member Direct Message Graph — Aprilon Forum Archive",
    description: "Explore an interactive graph of private message relationships between Aprilon community members, showing connections and message volumes across the forum archive from 2009 to 2016.",
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
