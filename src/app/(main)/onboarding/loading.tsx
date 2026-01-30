export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Content Area - matches actual page structure */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <div className="text-center w-full flex flex-col items-center">
          {/* Skeleton image */}
          <div
            className="w-[280px] h-[280px] rounded-[28px] bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 animate-pulse"
            style={{ boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.25)' }}
          />

          {/* Skeleton dots */}
          <div className="flex justify-center gap-2.5 mt-10 mb-6">
            <div className="w-7 h-2.5 rounded-full bg-violet-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-violet-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-violet-200" />
          </div>

          {/* Skeleton title */}
          <div className="h-7 w-52 bg-violet-100 rounded-lg animate-pulse mb-3" />

          {/* Skeleton description */}
          <div className="h-5 w-64 bg-violet-50 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-48 bg-violet-50 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Button Area */}
      <div className="px-6 pb-10 pt-4">
        <div className="h-14 w-full bg-violet-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
