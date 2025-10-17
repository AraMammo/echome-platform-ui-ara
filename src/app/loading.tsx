export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-[#3a8e9c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#9b8baf] text-sm font-medium">Loading EchoMe...</p>
      </div>
    </div>
  );
}
