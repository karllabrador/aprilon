import Image from "next/image";
import type { ContributorWithSteam } from "@/types";

type ContributorCardProps = {
  contributor: ContributorWithSteam;
};

function getStatusClass(steam: ContributorWithSteam["steam"]): string {
  if (!steam) return "border-l-gray-700";
  if (steam.gameid) return "border-l-blue-400";
  if (steam.personastate && steam.personastate >= 1) return "border-l-green-500";
  return "border-l-gray-700";
}

export default function ContributorCard({ contributor }: ContributorCardProps) {
  const roles = Array.isArray(contributor.roles)
    ? contributor.roles
    : [contributor.roles];
  const displayName = contributor.steam?.personaname ?? contributor.name;
  const statusClass = getStatusClass(contributor.steam);

  return (
    <div
      className={`flex items-center gap-3 p-3 bg-[#1E1F21] shadow-lg shadow-black/40 border-l-4 ${statusClass}`}
    >
      <div className="shrink-0">
        {contributor.steam?.avatarfull ? (
          <Image
            src={contributor.steam.avatarfull}
            width={48}
            height={48}
            alt={displayName}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-700 flex items-center justify-center text-lg font-bold text-gray-300">
            {contributor.name[0]}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#ededed] truncate">{displayName}</p>
        <p className="text-xs text-gray-400 truncate">{roles.join(", ")}</p>
      </div>
    </div>
  );
}
