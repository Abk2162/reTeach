import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options'
import Image from 'next/image'
import Link from 'next/link'
import SignInButton from './sign-in-button'

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 pt-20">
      <div className="w-full max-w-md -mt-64">
        {/* Logo above card */}
        <Link href="/" className="flex justify-center mb-8 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="reTeach"
            width={100}
            height={100}
            className="rounded-2xl"
          />
        </Link>

        {/* Sign in card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Sign in to access your teaching dashboard
            </p>
          </div>

          <SignInButton />

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500">
          <Link href="/contact" className="hover:text-gray-700 transition-colors">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
