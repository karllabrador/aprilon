import Image from "next/image";

type DiscordSplitButtonProps = {
  href: string;
  memberCount: number;
};

export default function DiscordSplitButton({
  href,
  memberCount,
}: DiscordSplitButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex overflow-hidden rounded-full bg-[#363636] hover:bg-[#2f2f2f] text-white text-xs uppercase tracking-wide transition-colors"
    >
      <span className="inline-flex items-center gap-2.5 px-4 py-2.25 border-r border-[#4a4a4a]">
        <Image
          src="/images/discord-128x144.png"
          width={16}
          height={16}
          alt="Discord logo"
        />
        Discord
      </span>
      <span className="inline-flex items-center gap-2 px-3 py-2.25">
        <span className="inline-block w-2 h-2 rounded-full bg-[#3ba55c]" />
        <span className="text-white/65 normal-case tracking-normal">
          {memberCount.toLocaleString()}
        </span>
      </span>
    </a>
  );
}
