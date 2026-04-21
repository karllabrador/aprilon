import DownloadSplitButton from "@/components/common/DownloadSplitButton";
import Hero from "@/components/hero/Hero";
import worldsData from "@/config/worlds.json";
import type { MinecraftWorld } from "@/types";

const worlds = worldsData as MinecraftWorld[];

export default function DownloadsSection() {
  return (
    <Hero backgroundImage="/images/minecraft-background-1920x1080.jpg" wide>
      <div className="flex flex-col gap-8 w-full md:flex-row md:items-center md:justify-between">
        <div className="shrink-0">
          <h2 className="text-3xl font-bold text-[#ededed] mb-2">
            Minecraft Worlds
          </h2>
          <p className="text-xl text-gray-300 mt-1">
            Previous worlds are available for download
          </p>
        </div>

        <div className="flex justify-center gap-12 md:gap-32">
          {worlds.map((world) => (
            <div key={world.title} className="flex flex-col items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  {world.title}
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">
                  ({world.fromYear} – {world.toYear})
                </p>
                <p className="text-4xl text-white mt-1">{world.size}</p>
              </div>
              <DownloadSplitButton
                href={world.url}
                downloadSize={world.downloadSize}
              />
            </div>
          ))}
        </div>
      </div>
    </Hero>
  );
}
