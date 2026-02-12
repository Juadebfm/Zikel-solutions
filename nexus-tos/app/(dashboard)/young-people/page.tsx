"use client"

import { useState } from "react"
import { YoungPeopleTab } from "@/components/young-people/young-people-tab"
import { RewardsTab } from "@/components/young-people/rewards-tab"
import { YPSettingsTab } from "@/components/young-people/yp-settings-tab"
import { OutcomeStarTab } from "@/components/young-people/outcome-star-tab"
import { YPAuditTab } from "@/components/young-people/yp-audit-tab"

type MainTab = "young-people" | "rewards" | "settings" | "outcome-star" | "audit"

const mainTabs: { key: MainTab; label: string }[] = [
  { key: "young-people", label: "Young People" },
  { key: "rewards", label: "Rewards" },
  { key: "outcome-star", label: "Outcome Star" },
  { key: "audit", label: "Audit" },
  { key: "settings", label: "Settings" },
]

export default function YoungPeoplePage() {
  const [activeTab, setActiveTab] = useState<MainTab>("young-people")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Young People</h1>
        <p className="text-gray-500 mt-1">
          View and manage young people profiles and care records.
        </p>
      </div>

      {/* Main Tabs */}
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
        {activeTab === "young-people" && <YoungPeopleTab />}
        {activeTab === "rewards" && <RewardsTab />}
        {activeTab === "settings" && <YPSettingsTab />}
        {activeTab === "outcome-star" && <OutcomeStarTab />}
        {activeTab === "audit" && <YPAuditTab />}
      </div>
    </div>
  )
}
