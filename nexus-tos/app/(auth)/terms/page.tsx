import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-gray-900">Terms of Use</h1>
        <p className="text-sm text-gray-500">Last updated: March 11, 2026</p>
      </div>

      <div className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
        <section>
          <h2 className="text-base font-semibold text-gray-900">1. Acceptance of terms</h2>
          <p>
            By using Zikel Solutions, you agree to these terms and all applicable laws. If you do not
            agree, you should stop using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">2. Account responsibility</h2>
          <p>
            You are responsible for maintaining the confidentiality of your credentials and for activities
            that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">3. Acceptable use</h2>
          <p>
            You must not misuse the service, attempt unauthorized access, upload harmful content, or
            interfere with the platform&apos;s operation.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-gray-900">4. Contact</h2>
          <p>
            If you have questions about these terms, contact Zikel Solutions support through your
            organization&apos;s approved support channel.
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
