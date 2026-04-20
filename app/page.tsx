import Button from "@/components/common/Button";
import Footer from "@/components/common/Footer";
import ContributorSection from "@/components/contributor/ContributorSection";
import DownloadsSection from "@/components/downloads/DownloadsSection";
import Hero from "@/components/hero/Hero";
import StatsSection from "@/components/statistics/StatsSection";
import {
  DISCORD_INVITE_CODE,
  DISCORD_INVITE_URL,
  STEAM_GROUP_URL,
} from "@/lib/constants";
import { getDiscordStats } from "@/lib/discord";
import Image from "next/image";

export const revalidate = 300; // Revalidate this page every 5 minutes for Steam data

export default async function Home() {
  const discordStats = await getDiscordStats(DISCORD_INVITE_CODE);

  return (
    <>
      <Hero darkOverlay blur>
        <div className="mt-8 mb-6">
          <h1 className="sr-only">Aprilon</h1>
          <Image
            src="/images/aprilon-small-compact.png"
            width={165}
            height={55}
            alt="Aprilon logo"
          />
        </div>

        <div className="text-gray-200 flex flex-col gap-5">
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
        <div className="flex flex-col gap-2 mt-8 mb-8">
          <div className="flex gap-2">
            <Button
              href={DISCORD_INVITE_URL}
              upperCase={true}
              icon={{
                src: "/images/discord-128x144.png",
                width: 16,
                height: 16,
                alt: "Discord logo",
              }}
            >
              Discord
            </Button>
            <Button
              href={STEAM_GROUP_URL}
              upperCase={true}
              icon={{
                src: "/images/steam-128x128.png",
                width: 20,
                height: 20,
                alt: "Steam logo",
              }}
            >
              Steam Group
            </Button>
          </div>
          {discordStats && (
            <div className="flex items-center gap-2 pl-4 pt-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-gray-300">
                {discordStats.memberCount.toLocaleString()} members in Discord
              </span>
            </div>
          )}
        </div>
      </Hero>

      <StatsSection />
      <DownloadsSection />
      <ContributorSection />

      <Footer />
    </>
  );
}
