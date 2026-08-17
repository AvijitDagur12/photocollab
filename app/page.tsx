export default function HomePage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white">Ztag  v1</h1>
        <p className="text-gray-400 mt-2 text-sm md:text-base">Private memories. Together.</p>
        <a href="/auth/login" className="inline-block mt-6 bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition">
          Login
        </a>
      </div>
    </div>
  )
}