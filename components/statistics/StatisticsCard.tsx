import Image from "next/image";
import StatCounter from "./StatCounter";

type StatisticsCardProps = {
  title: string;
  stats: { label: string; value: string }[];
  icon: string;
};

export default function StatisticsCard({
  title,
  stats,
  icon,
}: StatisticsCardProps) {
  return (
    <div className="flex items-center gap-6 py-5">
      <div className="flex items-center gap-3 w-44 shrink-0">
        <Image src={icon} width={40} height={40} alt={`${title} icon`} />
        <span className="font-semibold text-[#ededed]">{title}</span>
      </div>

      <div className="flex gap-10">
        {stats.map((stat) => (
          <StatCounter key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  );
}
