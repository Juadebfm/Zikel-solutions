import Image from "next/image"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white relative">
        {/* Mesh pattern - only visible on small screens */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(232,93,4,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(232,93,4,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-12">
          {children}
        </div>

        {/* Footer */}
        <div className="relative px-8 sm:px-16 lg:px-20 py-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm lg:bg-white lg:backdrop-blur-none">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-gray-500">
            <div className="flex flex-col">
              <span>Need help?</span>
              <a
                href="#"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Click here to visit our helpdesk.
              </a>
            </div>
            <div className="text-xs text-gray-400">
              <span>&copy; 2024 - {new Date().getFullYear()} Nexus Therapeutic Solutions Ltd. All Rights Reserved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Branded */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background pattern - mesh grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Logo positioned bottom-right */}
        <div className="absolute bottom-8 right-8">
          <Image
            src="/logo.svg"
            alt="Nexus Therapeutic Solutions"
            width={200}
            height={52}
            priority
          />
        </div>
      </div>
    </div>
  )
}
