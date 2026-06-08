export default function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-3/4 rounded bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gray-200"></div>
        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
        <div className="h-4 w-4/6 rounded bg-gray-200"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 rounded bg-gray-200"></div>
        <div className="h-24 rounded bg-gray-200"></div>
        <div className="h-24 rounded bg-gray-200"></div>
        <div className="h-24 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="h-32 rounded-lg border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="h-4 w-1/2 rounded bg-gray-200 mb-2"></div>
      <div className="h-8 w-3/4 rounded bg-gray-200"></div>
      <div className="h-3 w-2/3 rounded bg-gray-200 mt-4"></div>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="h-10 w-32 rounded-md bg-gray-200 animate-pulse"></div>
  );
}
