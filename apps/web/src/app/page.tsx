import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-50 to-white">
      <div className="z-10 max-w-4xl w-full items-center justify-between text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-900">
          Teachy Assignment Platform
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Create and share exercise lists with your students
        </p>
        <p className="text-lg text-gray-500 mb-12">
          Teachers can create assignments, students can complete them and view
          results
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-shadow"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
