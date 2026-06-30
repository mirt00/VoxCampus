export default function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 animate-pulse">
      {/* Author row */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-gray-200 rounded-full w-1/4" />
          <div className="h-2.5 bg-gray-100 rounded-full w-1/6" />
        </div>
      </div>
      {/* Badges */}
      <div className="flex gap-2 mb-3.5">
        <div className="h-6 bg-gray-100 rounded-full w-28" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
      {/* Title */}
      <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2.5" />
      {/* Body */}
      <div className="space-y-2 mb-5">
        <div className="h-3.5 bg-gray-100 rounded-lg w-full" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-5/6" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-4/6" />
      </div>
      {/* Bottom */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-9 bg-gray-100 rounded-full w-24" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}
