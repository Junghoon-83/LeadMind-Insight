export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        {/* Skeleton blob */}
        <div className="relative w-[280px] h-[280px] mx-auto mb-10 rounded-[28px] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 animate-pulse" />

        {/* Skeleton dots */}
        <div className="flex justify-center gap-2.5 mb-6">
          <div className="w-7 h-2.5 rounded-full bg-violet-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-violet-100" />
          <div className="w-2.5 h-2.5 rounded-full bg-violet-100" />
        </div>

        {/* Skeleton text */}
        <div className="h-7 w-48 mx-auto mb-3 bg-violet-100 rounded-lg animate-pulse" />
        <div className="h-5 w-64 mx-auto bg-violet-50 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
