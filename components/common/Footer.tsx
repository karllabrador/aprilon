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
              href="https://discord.gg/sTBfWTG"
              className="text-xs text-gray-400 hover:text-[#ededed] transition-colors uppercase"
            >
              Discord
            </a>
            <a
              href="https://steamcommunity.com/groups/aprilon"
              className="text-xs text-gray-400 hover:text-[#ededed] transition-colors uppercase"
            >
              Steam Group
            </a>
            <a
              href="https://github.com/karllabrador/aprilon"
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
