import statsData from "@/config/stats.json";
import ForumIcon from "@/components/icons/ForumIcon";
import GarrysModIcon from "@/components/icons/GarrysModIcon";
import MinecraftIcon from "@/components/icons/MinecraftIcon";
import TeamFortress2Icon from "@/components/icons/TeamFortress2Icon";
import type { Statistics } from "@/types";
import StatsRow from "./StatsRow";

const iconMap: Record<string, React.ReactNode> = {
  "Garry's Mod": <GarrysModIcon />,
  "Team Fortress 2": <TeamFortress2Icon />,
  Minecraft: <MinecraftIcon />,
  Forums: <ForumIcon />,
};

const stats = statsData as Statistics;

export default function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="container max-w-336 mx-auto">
        <h2 className="text-3xl font-bold text-[#ededed] mb-2">Stats</h2>
        <p className="text-base text-gray-400 mb-8">
          Over its six years, Aprilon saw thousands of players across its game
          servers. These numbers are drawn from HLStatsX:CE for Team Fortress 2,
          and our own in-house developed management tools for Garry&apos;s Mod
          and Minecraft.
        </p>

        <div className="p-3">
          {stats.map((section) => (
            <StatsRow
              key={section.title}
              title={section.title}
              stats={section.stats}
              icon={iconMap[section.title]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
