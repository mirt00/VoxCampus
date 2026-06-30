import { useState, useEffect } from "react";

export default function SearchBar({ onSearch, defaultValue = "" }) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value), 400);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search suggestions..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                   placeholder:text-gray-400 shadow-sm transition-all"
      />
      {value && (
        <button
          onClick={() => { setValue(""); onSearch(""); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}
