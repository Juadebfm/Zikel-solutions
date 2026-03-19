import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: March 11, 2026</p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="text-base font-semibold text-gray-900">1. Data we collect</h2>
          <p>
            We collect account profile details, authentication data, and service usage information needed
            to provide and secure the platform.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">2. How we use data</h2>
          <p>
            Data is used to operate Zikel Solutions, improve reliability, support users, and meet legal or
            regulatory obligations.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">3. Data sharing and protection</h2>
          <p>
            We do not sell personal data. Access is restricted to authorized personnel and protected with
            appropriate technical and organizational controls.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">4. Your rights</h2>
          <p>
            You may request access, correction, or deletion of personal information through your
            organization&apos;s data protection contact.
          </p>
        </section>
      </div>

      <div className="mt-10">
        <Link href="/register" className="text-sm font-medium text-primary hover:text-primary/80">
          Return to sign up
        </Link>
      </div>
    </div>
  )
}
