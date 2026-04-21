import StatValue from "./StatValue";

type StatsRowProps = {
  title: string;
  stats: { label: string; value: string }[];
  icon: React.ReactNode;
};

export default function StatsRow({ title, stats, icon }: StatsRowProps) {
  return (
    <div className="flex flex-col gap-4 py-6 px-6 w-full md:flex-row md:items-center md:gap-6">
      <div className="flex items-center gap-4 md:contents">
        <div className="shrink-0">{icon}</div>
        <div className="md:flex-1 md:px-10">
          <span className="text-2xl font-semibold text-[#ededed]">{title}</span>
        </div>
      </div>

      <div className="flex justify-between md:flex-3">
        {stats.map((stat) => (
          <StatValue key={stat.label} value={stat.value} label={stat.label} />
        ))}
      </div>
    </div>
  );
}
