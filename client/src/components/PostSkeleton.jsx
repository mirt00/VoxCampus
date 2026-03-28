export default function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      {/* Author row */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-gray-200 rounded-full w-1/4" />
          <div className="h-2.5 bg-gray-100 rounded-full w-1/6" />
        </div>
      </div>
      {/* Badges */}
      <div className="flex gap-2 mb-3">
        <div className="h-6 bg-gray-100 rounded-full w-24" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
      {/* Title */}
      <div className="h-5 bg-gray-200 rounded-lg w-3/4 mb-2" />
      {/* Body */}
      <div className="space-y-1.5 mb-4">
        <div className="h-3.5 bg-gray-100 rounded-lg w-full" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-5/6" />
      </div>
      {/* Bottom */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="h-8 bg-gray-100 rounded-full w-20" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}
