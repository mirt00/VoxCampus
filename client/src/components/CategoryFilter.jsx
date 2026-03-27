import { useQuery } from "@tanstack/react-query";
import api from "../api/axiosInstance";

export default function CategoryFilter({ active, onChange }) {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get("/categories").then((r) => r.data),
  });

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => onChange("")}
        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          !active ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
        }`}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c._id}
          onClick={() => onChange(c._id)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            active === c._id ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
