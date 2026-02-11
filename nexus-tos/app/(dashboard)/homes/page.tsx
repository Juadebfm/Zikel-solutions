"use client"

import { useState } from "react"
import { HomesTab } from "@/components/homes/homes-tab"
import { SettingsTab } from "@/components/homes/settings-tab"
import { AuditTab } from "@/components/homes/audit-tab"

type MainTab = "homes" | "settings" | "audit"

const mainTabs: { key: MainTab; label: string }[] = [
  { key: "homes", label: "Homes" },
  { key: "settings", label: "Settings" },
  { key: "audit", label: "Audit" },
]

export default function HomesPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("homes")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Homes</h1>
        <p className="text-gray-500 mt-1">
          View and manage all registered children&apos;s homes.
        </p>
      </div>

      {/* Main Tabs: Homes | Settings | Audit */}
      <div className="flex flex-wrap">
        {mainTabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${index === 0 ? "rounded-l-lg" : ""} ${index === mainTabs.length - 1 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        {activeTab === "homes" && <HomesTab />}
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "audit" && <AuditTab />}
      </div>
    </div>
  )
}
