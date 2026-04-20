import { DISCORD_INVITE_URL, GITHUB_URL, STEAM_GROUP_URL } from "@/lib/constants";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#1c1d20] border-t border-[#2a2b2e] mt-auto">
      <div className="container max-w-336 mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <Image
            src="/images/aprilon-small-compact.png"
            width={80}
            height={27}
            alt="Aprilon"
            className="opacity-50"
          />

          <div className="flex gap-8">
            <a
              href={DISCORD_INVITE_URL}
              className="text-xs text-gray-400 hover:text-[#ededed] transition-colors uppercase"
            >
              Discord
            </a>
            <a
              href={STEAM_GROUP_URL}
              className="text-xs text-gray-400 hover:text-[#ededed] transition-colors uppercase"
            >
              Steam Group
            </a>
            <a
              href={GITHUB_URL}
              className="text-xs text-gray-400 hover:text-[#ededed] transition-colors uppercase"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
