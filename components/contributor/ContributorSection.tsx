import { contributors } from "@/lib/contributors";
import { getContributorsWithSteam } from "@/lib/steam";
import ContributorCard from "./ContributorCard";

export default async function ContributorSection() {
  const data = await getContributorsWithSteam(contributors);

  return (
    <section className="py-16 px-6">
      <div className="container max-w-336 mx-auto">
        <h2 className="text-3xl font-bold text-[#ededed] mb-2">Contributors</h2>
        <p className="text-base text-gray-400 mb-8">
          These are the people who kept Aprilon running — through leadership,
          administration, and development — over the course of its lifetime.
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
