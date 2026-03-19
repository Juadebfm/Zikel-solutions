"use client"

import { useState } from "react"
import { VehiclesTab } from "@/components/vehicles/vehicles-tab"
import { VehicleAuditTab } from "@/components/vehicles/vehicle-audit-tab"
import { VehicleSettingsTab } from "@/components/vehicles/vehicle-settings-tab"

type MainTab = "vehicles" | "audit" | "settings"

const mainTabs: { key: MainTab; label: string }[] = [
  { key: "vehicles", label: "Vehicles" },
  { key: "audit", label: "Audit" },
  { key: "settings", label: "Settings" },
]

export default function VehiclesPage() {
  const [activeTab, setActiveTab] = useState<MainTab>("vehicles")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
        <p className="text-gray-500 mt-1">
          Track and manage the vehicle fleet across all homes.
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
        {activeTab === "vehicles" && <VehiclesTab />}
        {activeTab === "audit" && <VehicleAuditTab />}
        {activeTab === "settings" && <VehicleSettingsTab />}
      </div>
    </div>
  )
}
