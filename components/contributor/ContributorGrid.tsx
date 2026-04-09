import { contributors } from "@/lib/contributors";
import { getContributorsWithSteam } from "@/lib/steam";
import ContributorCard from "./ContributorCard";

export default async function ContributorGrid() {
  const data = await getContributorsWithSteam(contributors);

  return (
    <section className="py-16 px-6">
      <div className="container max-w-336 mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-[#ededed]">Contributors</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-2xl">
          Throughout its lifetime, these people have contributed to the Aprilon
          community in form of leadership, administration and development.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((contributor) => (
            <ContributorCard
              key={contributor.steamId}
              contributor={contributor}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
