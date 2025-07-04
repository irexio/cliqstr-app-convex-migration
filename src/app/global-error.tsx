'use client'
 
import { useEffect } from 'react'
 
// Custom error page that doesn't expose implementation details
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error('Application error:', error.message)
  }, [error])
 
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Something went wrong
              </h1>
              <p className="mt-2 text-center text-sm text-gray-600">
                We're sorry for the inconvenience. Our team has been notified.
              </p>
            </div>
            <div className="mt-8 space-y-6">
              <button
                onClick={() => reset()}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try again
              </button>
              <div className="text-center">
                <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Return to home page
                </a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
