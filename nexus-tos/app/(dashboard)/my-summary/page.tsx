"use client"

import { Clock, AlertTriangle, FileText, ClipboardList, UserCheck } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "@/components/layout/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { TodoList } from "@/components/dashboard/todo-list"
import { TasksToApprove } from "@/components/dashboard/tasks-to-approve"
import { LinkedOrgs } from "@/components/dashboard/linked-orgs"
import { NeedHelpCard } from "@/components/dashboard/need-help-card"

// Mock data for stats
const statsData = [
  {
    label: "Overdue Tasks",
    value: 4,
    icon: Clock,
    badge: "High Priority",
    badgeColor: "red" as const,
    href: "/tasks?filter=overdue",
  },
  {
    label: "Due Today",
    value: 12,
    icon: AlertTriangle,
    badge: "Due Today",
    badgeColor: "amber" as const,
    href: "/tasks?filter=today",
  },
  {
    label: "IOI Logs",
    value: 8,
    icon: FileText,
    badge: "Pending",
    badgeColor: "blue" as const,
    href: "/daily-logs",
  },
  {
    label: "Forms Due",
    value: 3,
    icon: ClipboardList,
    badge: "This Week",
    badgeColor: "purple" as const,
    href: "/forms",
  },
  {
    label: "Approvals",
    value: 5,
    icon: UserCheck,
    badge: "Pending",
    badgeColor: "green" as const,
    href: "/tasks?filter=approvals",
  },
]

// Mock data for todo list
const todoItems = [
  {
    id: "1",
    taskId: "2841",
    title: "Monthly Medication Review",
    description: "Complete medication review for James Wilson",
    status: "due-today" as const,
    time: "10:00 AM",
    type: "medication" as const,
  },
  {
    id: "2",
    taskId: "2839",
    title: "Lab Results Follow-up",
    description: "Review and document lab results for Sarah Chen",
    status: "due-tomorrow" as const,
    time: "2:00 PM",
    type: "lab" as const,
  },
  {
    id: "3",
    taskId: "2836",
    title: "Care Plan Update",
    description: "Update care plan documentation for Maple House",
    status: "pending" as const,
    type: "document" as const,
  },
  {
    id: "4",
    taskId: "2834",
    title: "Incident Report",
    description: "Complete incident report for Oak Lodge",
    status: "overdue" as const,
    type: "general" as const,
  },
]

// Mock data for approval tasks
const approvalTasks = [
  {
    id: "1",
    requestId: "REQ-0892",
    title: "IOI Log - James Wilson",
    caregiver: "Mark Thompson",
    status: "needs-review" as const,
  },
  {
    id: "2",
    requestId: "REQ-0891",
    title: "Medication Change Request",
    caregiver: "Sarah Johnson",
    status: "urgent" as const,
  },
  {
    id: "3",
    requestId: "REQ-0890",
    title: "Shift Handover Notes",
    caregiver: "David Williams",
    status: "pending" as const,
  },
]

// Mock data for linked organizations
const linkedOrgs = [
  {
    id: "1",
    name: "Maple House",
    type: "Children's Home",
  },
  {
    id: "2",
    name: "Oak Lodge",
    type: "Children's Home",
  },
  {
    id: "3",
    name: "Pine View",
    type: "Supported Living",
  },
]

export default function MySummaryPage() {
  const { user, hasPermission } = useAuth()
  const canApprove = hasPermission("canApproveIOILogs")

  const handleNewTask = () => {
    // TODO: Open new task modal
    console.log("New task clicked")
  }

  const handleAskAI = () => {
    // TODO: Open AI assistant
    console.log("Ask AI clicked")
  }

  const handleViewTask = (id: string) => {
    console.log("View task:", id)
  }

  const handleApproveTask = (id: string) => {
    console.log("Approve task:", id)
  }

  const handleProcessBatch = () => {
    console.log("Process batch clicked")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p className="text-sm text-gray-500 mb-1">
          Welcome back, {user?.firstName}!
        </p>
        <PageHeader
          title="My Summary"
          subtitle="Here's an overview of your tasks and activities."
          showNewTask={true}
          showAskAI={true}
          onNewTask={handleNewTask}
          onAskAI={handleAskAI}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statsData.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            badge={stat.badge}
            badgeColor={stat.badgeColor}
            href={stat.href}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* To Do List */}
        <TodoList items={todoItems} />

        {/* Tasks to Approve - only show if user has permission */}
        {canApprove ? (
          <TasksToApprove
            items={approvalTasks}
            onView={handleViewTask}
            onApprove={handleApproveTask}
            onProcessBatch={handleProcessBatch}
          />
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LinkedOrgs orgs={linkedOrgs} />
        </div>
        <div>
          <NeedHelpCard />
        </div>
      </div>
    </div>
  )
}
