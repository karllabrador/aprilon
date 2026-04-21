import Button from "@/components/common/Button";
import DiscordSplitButton from "@/components/common/DiscordSplitButton";
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
import DiscordIcon from "@/components/icons/DiscordIcon";
import SteamIcon from "@/components/icons/SteamIcon";
import { getDiscordStats } from "@/lib/discord";
import AprilonLogo from "@/components/common/AprilonLogo";

export const revalidate = 300; // Revalidate this page every 5 minutes for Steam data

export default async function Home() {
  const discordStats = await getDiscordStats(DISCORD_INVITE_CODE);

  return (
    <>
      <Hero darkOverlay blur priority>
        <div className="mt-8 mb-6">
          <h1 className="sr-only">Aprilon</h1>
          <AprilonLogo width={165} className="text-[#ededed]" />
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
        <div className="flex gap-2 mt-8 mb-8">
          {discordStats ? (
            <DiscordSplitButton
              href={DISCORD_INVITE_URL}
              memberCount={discordStats.memberCount}
            />
          ) : (
            <Button
              href={DISCORD_INVITE_URL}
              variant="bordered"
              upperCase={true}
              iconNode={<DiscordIcon />}
            >
              Discord
            </Button>
          )}
          <Button
            href={STEAM_GROUP_URL}
            variant="bordered"
            upperCase={true}
            iconNode={<SteamIcon />}
          >
            Steam Group
          </Button>
        </div>
      </Hero>

      <StatsSection />
      <DownloadsSection />
      <ContributorSection />

      <Footer />
    </>
  );
}
