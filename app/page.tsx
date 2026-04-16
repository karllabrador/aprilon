import Button from "@/components/common/Button";
import ContributorGrid from "@/components/contributor/ContributorGrid";
import DownloadsSection from "@/components/downloads/DownloadsSection";
import Hero from "@/components/hero/Hero";
import StatisticsGrid from "@/components/statistics/StatisticsGrid";
import Image from "next/image";

export const revalidate = 300; // Revalidate this page every 5 minutes for Steam data

export default function Home() {
  return (
    <>
      <Hero darkOverlay blur>
        <div className="mt-8 mb-6">
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
        <div className="flex gap-2 mt-8 mb-8">
          <Button
            href="https://discord.gg/sTBfWTG"
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
            href="https://steamcommunity.com/groups/aprilon"
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
      </Hero>

      <StatisticsGrid />
      <DownloadsSection />
      <ContributorGrid />

      <footer className="mt-auto py-6 px-6 text-center text-sm text-gray-500">
        <p>
          Made by{" "}
          <a
            href="https://github.com/karllabrador"
            className="hover:text-gray-300 transition-colors"
          >
            Karl Labrador
          </a>
          {" · "}
          <a
            href="https://github.com/karllabrador/aprilon"
            className="hover:text-gray-300 transition-colors"
          >
            Source code
          </a>
          {" · "}
          <a
            href="https://discord.gg/sTBfWTG"
            className="hover:text-gray-300 transition-colors"
          >
            Discord
          </a>
        </p>
      </footer>
    </>
  );
}
