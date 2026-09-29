type AdminStatCardProps = {
  title: string;
  value: number;
  valueClassName?: string;
};

export default function AdminStatCard({
  title,
  value,
  valueClassName = "",
}: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-[#eaded2] bg-white p-6 shadow-sm">
      <p className="text-sm text-[#75665e]">{title}</p>

      <p className={`mt-2 text-3xl font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}