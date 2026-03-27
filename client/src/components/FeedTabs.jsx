const TABS = ["trending", "latest", "top"];

export default function FeedTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
            active === tab ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
