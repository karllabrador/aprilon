import statsData from "@/config/stats.json";
import type { Statistics } from "@/types";
import StatisticsCard from "./StatisticsCard";

const iconMap: Record<string, string> = {
  "Garry's Mod": "/images/garrysmod-128x128.png",
  "Team Fortress 2": "/images/teamfortress-128x128.png",
  Minecraft: "/images/minecraft-128x128.png",
  Forums: "/images/forum-128x128.png",
};

const stats = statsData as Statistics;

export default function StatisticsGrid() {
  return (
    <section className="py-16 px-6">
      <div className="container max-w-336 mx-auto">
        <h2 className="text-3xl font-bold text-[#ededed] mb-2">Stats</h2>
        <p className="text-base text-gray-400 mb-8 max-w-2xl">
          Over the years, we&apos;ve recorded thousands of players visiting our
          game servers. These figures are based on our latest copies of data
          gathered from multiple sources, including HLStatsXCE for Team Fortress
          2, and our own in-house developed management tools for Garry&apos;s
          Mod and Minecraft.
        </p>
        <div>
          {stats.map((section) => (
            <StatisticsCard
              key={section.title}
              title={section.title}
              stats={section.stats}
              icon={iconMap[section.title] ?? ""}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
