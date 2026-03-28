import Hero from "@/components/hero/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <Hero>
      <div>
        <p>
          Aprilon was a gaming community that hosted game servers for a
          multitude of games, including Garry&apos;s Mod, Team Fortress 2 and
          Minecraft.
        </p>

        <p>
          The community was founded in 2009, and eventually closed its
          operations in 2015. It was entirely funded by its community.
        </p>

        <p>
          We&apos;re thankful for the support we&apos;ve received from the
          community. This website represents the history of Aprilon.
        </p>
      </div>

      <div className="flex gap-0 mt-8">
        <a
          href="https://discord.gg/sTBfWTG"
          className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors mr-[10px] mt-[4px]"
        >
          <Image
            src="/images/discord-128x144.png"
            width={16}
            height={16}
            alt="Discord logo"
          />
          <span className="text-xs font-semibold uppercase tracking-wide mt-[4px] ml-[10px]">
            Discord
          </span>
        </a>

        <a
          href="https://steamcommunity.com/groups/aprilon"
          className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors mt-[4px]"
        >
          <Image
            src="/images/steam-128x128.png"
            width={20}
            height={20}
            alt="Steam logo"
          />
          <span className="text-xs font-semibold uppercase tracking-wide mt-[4px] ml-[10px]">
            Steam Group
          </span>
        </a>
      </div>
    </Hero>
  );
}

/**
 * Main (Hero)
 * Stats
 * Downloads (Hero)
 * Contributors
 */
