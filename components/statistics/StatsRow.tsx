import Image from "next/image";
import StatValue from "./StatValue";

type StatsRowProps = {
  title: string;
  stats: { label: string; value: string }[];
  icon: string;
};

export default function StatsRow({ title, stats, icon }: StatsRowProps) {
  return (
    <div className="flex items-center gap-6 py-6 px-6 w-full">
      <div className="shrink-0">
        <Image src={icon} width={64} height={64} alt={`${title} icon`} />
      </div>

      <div className="flex items-left gap-4 flex-1 px-10">
        <span className="text-2xl font-semibold text-[#ededed]">{title}</span>
      </div>

      <div className="flex flex-3 justify-between">
        {stats.map((stat) => (
          <StatValue key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  );
}
