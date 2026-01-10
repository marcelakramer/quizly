import Link from "next/link";
import { ClipboardList, Users, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center opacity-0 animate-fade-up">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            Create engaging
            <span className="text-primary"> assessments</span>
            <br />
            for your students
          </h1>
          <p className="mt-6 text-lg text-gray-600 md:text-xl">
            Build interactive quizzes, share them with a simple link, and track
            your students&apos; progress—all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-primary border-2 border-primary px-8 py-3 rounded-lg font-medium text-lg shadow-md hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Create Lists
            </h3>
            <p className="text-gray-600">
              Build exercise lists with multiple-choice questions. Add as many
              questions and options as you need.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-up [animation-delay:150ms]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Share Easily
            </h3>
            <p className="text-gray-600">
              Share a simple link with your students. They can take the quiz
              from any device, no login required.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow opacity-0 animate-fade-up [animation-delay:300ms]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 mb-4">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              Track Results
            </h3>
            <p className="text-gray-600">
              View all student submissions in one place. See scores, averages,
              and individual responses.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Teachy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
