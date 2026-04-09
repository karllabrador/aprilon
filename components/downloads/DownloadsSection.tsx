import Button from "@/components/common/Button";
import Hero from "@/components/hero/Hero";
import worldsData from "@/config/worlds.json";
import type { MinecraftWorld } from "@/types";

const worlds = worldsData as MinecraftWorld[];

export default function DownloadsSection() {
  return (
    <Hero backgroundImage="/images/minecraft-background-1920x1080.jpg" wide>
      <div className="flex items-center justify-between w-full">
        <div className="shrink-0">
          <h2 className="text-2xl font-bold text-white">Minecraft Worlds</h2>
          <p className="text-sm text-gray-300 mt-1">
            Previous worlds are available for download
          </p>
        </div>
        <div className="flex gap-6">
          {worlds.map((world) => (
            <div key={world.title} className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  {world.title} ({world.fromYear}–{world.toYear})
                </p>
                <p className="text-4xl font-bold text-white mt-1">
                  {world.size}
                </p>
              </div>
              <Button href={world.url}>Download</Button>
            </div>
          ))}
        </div>
      </div>
    </Hero>
  );
}
