import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className='text-white flex flex-col items-center justify-center h-screen space-y-6 overflow-y-hidden'>
      <svg className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 3h.01M12 4a8 8 0 100 16 8 8 0 000-16z" />
        </svg>
      <h2 className='text-3xl'>Page Not Found</h2>
      <Link href="/">
        <button className="mt-4 px-6 py-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200">
          Go Home
        </button>
      </Link>
    </div>
  )
}