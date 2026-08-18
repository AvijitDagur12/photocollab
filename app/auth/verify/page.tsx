export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl w-full max-w-md border border-white/10 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">📧 Check Your Email</h1>
        <p className="text-gray-400">
          We've sent a verification link to your email address.
          Please click the link to confirm your account.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          After verification, you can login.
        </p>
        <a 
          href="/auth/login" 
          className="inline-block mt-6 px-6 py-2 bg-white text-black rounded-xl hover:bg-gray-200 transition"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}