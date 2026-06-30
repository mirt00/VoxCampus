const TABS = [
  { key: "trending", label: "Trending" },
  { key: "latest",   label: "Latest"   },
  { key: "top",      label: "Top"      },
];

export default function FeedTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-sm">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
            active === key
              ? "bg-primary text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
