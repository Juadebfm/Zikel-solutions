"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

interface CategoryTab {
  key: string
  label: string
}

interface CategorySubTabsProps {
  tabs: CategoryTab[]
  activeTab: string
  onTabChange: (key: string) => void
  initialVisibleCount?: number
}

export function CategorySubTabs({
  tabs,
  activeTab,
  onTabChange,
  initialVisibleCount = 5,
}: CategorySubTabsProps) {
  const [expanded, setExpanded] = useState(false)
  const needsExpand = tabs.length > initialVisibleCount
  const visibleTabs = expanded ? tabs : tabs.slice(0, initialVisibleCount)

  return (
    <div className="flex flex-wrap gap-y-1">
      {visibleTabs.map((tab, index) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 sm:px-6 py-2 text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap ${
            activeTab === tab.key
              ? "bg-primary text-white border-primary"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          } ${index === 0 && !expanded ? "rounded-l-lg" : index === 0 ? "rounded-tl-lg" : ""} ${!needsExpand && index === tabs.length - 1 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
        >
          {tab.label}
        </button>
      ))}
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-3 py-2 text-xs sm:text-sm font-medium border border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors -ml-px ${expanded ? "" : "rounded-r-lg"} flex items-center gap-1`}
        >
          <ChevronUp className={`h-3.5 w-3.5 transition-transform ${expanded ? "" : "rotate-180"}`} />
          {expanded ? "Less" : "More"}
        </button>
      )}
    </div>
  )
}
