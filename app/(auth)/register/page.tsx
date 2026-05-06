"use client"

import dynamic from "next/dynamic"

function RegisterFormLoading() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center py-14">
          <div className="h-10 w-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="mt-4 text-sm text-gray-500">Loading registration form...</p>
        </div>
      </div>
    </div>
  )
}

const SignupForm = dynamic(
  () => import("@/components/auth/signup/signup-form").then((mod) => mod.SignupForm),
  {
    loading: () => <RegisterFormLoading />,
  }
)

export default function RegisterPage() {
  return <SignupForm />
}
