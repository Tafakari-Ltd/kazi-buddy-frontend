'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Employer page error:', error)
  }, [error])

  return (
    <div className="px-6 md:px-12 py-10 bg-gray-50 min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Employer Dashboard Error</h2>
        <p className="text-gray-600 mb-6">
          An error occurred while loading your employer dashboard.
        </p>
        <button
          onClick={() => reset()}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}