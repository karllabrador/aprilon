import AprilonLogo from "@/components/common/AprilonLogo";
import { DISCORD_INVITE_URL, GITHUB_URL, STEAM_GROUP_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#1c1d20] border-t border-[#2a2b2e] mt-auto">
      <div className="container max-w-336 mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <AprilonLogo width={80} className="text-[#ededed] opacity-50" />

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
