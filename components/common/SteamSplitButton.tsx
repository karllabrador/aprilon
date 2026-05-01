import SteamIcon from "@/components/icons/SteamIcon";

type SteamSplitButtonProps = {
  href: string;
  memberCount: number;
};

export default function SteamSplitButton({ href, memberCount }: SteamSplitButtonProps) {
  return (
    <a
      href={href}
      className="inline-flex overflow-hidden rounded-md bg-[#363636] hover:bg-[#2f2f2f] border border-[#4d4d4d] text-white text-xs font-medium uppercase tracking-wide transition-colors"
    >
      <span className="inline-flex items-center gap-2.5 px-4.5 py-2.5 border-r border-[#4d4d4d]">
        <SteamIcon />
        Steam Group
      </span>
      <span className="inline-flex items-center px-3 py-2.5 normal-case tracking-normal text-white/65">
        {new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(memberCount)}
      </span>
    </a>
  );
}
