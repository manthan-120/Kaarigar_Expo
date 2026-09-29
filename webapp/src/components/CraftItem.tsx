type CraftItemProps = {
  icon: string;
  title: string;
};

export default function CraftItem({
  icon,
  title,
}: CraftItemProps) {
  return (
    <div className="group rounded-xl border border-[#eaded2] bg-white p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-[#d9c9bd] hover:shadow-md sm:p-8">
      <div className="text-4xl transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="mt-4 text-base font-semibold text-[#3b2923] sm:text-lg">
        {title}
      </h3>

      <span className="mt-2 block text-sm font-medium text-[#c65d3a]">
        Explore →
      </span>
    </div>
  );
}