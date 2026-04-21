import DiscordIcon from "@/components/icons/DiscordIcon";

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
      className="inline-flex overflow-hidden rounded-md bg-[#363636] hover:bg-[#2f2f2f] border border-[#4d4d4d] text-white text-xs font-medium uppercase tracking-wide transition-colors"
    >
      <span className="inline-flex items-center gap-2.5 px-4.5 py-2.5 border-r border-[#4d4d4d]">
        <DiscordIcon />
        Discord
      </span>
      <span className="inline-flex items-center gap-2 px-3 py-2.5 normal-case tracking-normal">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ba55c] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3ba55c]" />
        </span>
        <span className="text-white/65">
          {memberCount.toLocaleString()}
        </span>
      </span>
    </a>
  );
}
