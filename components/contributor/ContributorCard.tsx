import type { ContributorWithSteam } from "@/types";
import Image from "next/image";

type ContributorCardProps = {
  contributor: ContributorWithSteam;
};

export function getStatusStyle(
  steam: ContributorWithSteam["steam"],
): React.CSSProperties {
  const state = steam?.personastate ?? 0;

  if (steam?.gameid && steam.gameid !== "0") {
    return {
      background: "linear-gradient(to bottom, #9BC861 5%, #789E4C 95%)",
    };
  }

  if (state >= 1) {
    return {
      background: "linear-gradient(to bottom, #7BAFD6 5%, #506D92 95%)",
    };
  }

  return { background: "linear-gradient(to bottom, #706C6B 5%, #4E4D4D 95%)" };
}

export default function ContributorCard({ contributor }: ContributorCardProps) {
  const roles = Array.isArray(contributor.roles)
    ? contributor.roles
    : [contributor.roles];
  const displayName = contributor.steam?.personaname ?? contributor.name;
  const showTooltip = displayName !== contributor.name;
  const avatarUrl = contributor.steam?.avatarfull;
  const profileUrl =
    contributor.steam?.profileurl ??
    `https://steamcommunity.com/profiles/${contributor.steamId64}`;

  return (
    <div
      className="relative border border-[#151516]"
      style={{
        height: "88px",
        borderRadius: "0.25rem",
        boxShadow: "0 0 4px #202020",
      }}
    >
      {/* Status bar — absolutely positioned left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 z-20"
        style={{
          ...getStatusStyle(contributor.steam),
          borderRadius: "0.25rem 0 0 0.25rem",
        }}
      />

      {/* Background layers — clipped to card bounds */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ borderRadius: "0.25rem" }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center scale-110"
            style={{ filter: "blur(12px) brightness(0.4)" }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#1E1F21]" />
        )}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
      </div>

      {/* Content — no overflow:hidden anywhere so text-shadow bleeds freely */}
      <div className="relative z-10 flex items-center gap-3 pl-5 pr-3 h-full">
        <div className="shrink-0">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              width={52}
              height={52}
              alt={displayName}
              className="shadow-md shadow-black/60"
            />
          ) : (
            <div className="w-13 h-13 bg-gray-700 flex items-center justify-center text-xl text-gray-300">
              {contributor.name[0]}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="relative group inline-block">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contributor-name text-xl text-white whitespace-nowrap"
            >
              {displayName}
            </a>
            {showTooltip && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 flex items-center opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 ease-out pointer-events-none z-30">
                <span className="shrink-0 w-2.5 h-2.5 rotate-45 bg-[#1c1d20] border-l border-b border-[#2e3035] -mr-1.25" />
                <div className="bg-[#1c1d20] border border-[#2e3035] rounded-md shadow-xl shadow-black/60 px-3 py-2 min-w-max">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">Also known as</p>
                  <p className="text-sm text-gray-200 font-medium">{contributor.name}</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-wide whitespace-nowrap">
            {roles.join(" & ")}
          </p>
        </div>
      </div>
    </div>
  );
}
