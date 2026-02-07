"use client"

import { useAuth } from "@/contexts/auth-context"
import { PageHeader } from "@/components/layout/header"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { TodoList } from "@/components/dashboard/todo-list"
import type { TodoItem } from "@/components/dashboard/todo-list"
import { TasksToApprove } from "@/components/dashboard/tasks-to-approve"
import type { ApprovalTask } from "@/components/dashboard/tasks-to-approve"
import { Provisions } from "@/components/dashboard/provisions"
import type { HomeProvision } from "@/components/dashboard/provisions"
import { AccessBanner } from "@/components/permission/access-banner"
import { NoPermissionModal } from "@/components/permission/no-permission-modal"
import { usePermissionGuard } from "@/components/permission/use-permission-guard"

// Mock data — To Do List items
const todoItems: TodoItem[] = [
  {
    id: "1",
    taskId: "2841",
    title: "Monthly Medication Review",
    relatedTo: "James Wilson — Maple House",
    dueDate: "06 Feb 2026",
    status: "not-started",
    assignee: { name: "James Wilson", initials: "JW", color: "bg-blue-600" },
  },
  {
    id: "2",
    taskId: "2839",
    title: "Lab Results Follow-up",
    relatedTo: "Sarah Chen — Oak Lodge",
    dueDate: "06 Feb 2026",
    status: "draft",
    assignee: { name: "Sarah Chen", initials: "SC", color: "bg-purple-600" },
  },
  {
    id: "3",
    taskId: "2836",
    title: "Care Plan Update",
    relatedTo: "Maple House",
    dueDate: "07 Feb 2026",
    status: "in-progress",
    assignee: { name: "Mark Thompson", initials: "MT", color: "bg-teal-600" },
  },
  {
    id: "4",
    taskId: "2834",
    title: "Incident Report",
    relatedTo: "Oak Lodge",
    dueDate: "05 Feb 2026",
    status: "overdue",
    assignee: { name: "David Williams", initials: "DW", color: "bg-red-600" },
  },
  {
    id: "5",
    taskId: "2830",
    title: "Risk Assessment Review",
    relatedTo: "Emily Parker — Pine View",
    dueDate: "08 Feb 2026",
    status: "not-started",
    assignee: { name: "Emily Parker", initials: "EP", color: "bg-amber-600" },
  },
]

// Mock data — Tasks to Approve (more items to test pagination)
const approvalTasks: ApprovalTask[] = [
  {
    id: "1",
    taskId: "REQ-0892",
    title: "IOI Log — James Wilson",
    relatedTo: "Mark Thompson — Maple House",
    dueDate: "06 Feb 2026",
    status: "sent-for-approval",
    submitter: { name: "Mark Thompson", initials: "MT", color: "bg-teal-600" },
  },
  {
    id: "2",
    taskId: "REQ-0891",
    title: "Medication Change Request",
    relatedTo: "Sarah Johnson — Oak Lodge",
    dueDate: "06 Feb 2026",
    status: "needs-review",
    submitter: { name: "Sarah Johnson", initials: "SJ", color: "bg-pink-600" },
  },
  {
    id: "3",
    taskId: "REQ-0890",
    title: "Shift Handover Notes",
    relatedTo: "David Williams — Pine View",
    dueDate: "06 Feb 2026",
    status: "sent-for-approval",
    submitter: { name: "David Williams", initials: "DW", color: "bg-red-600" },
  },
  {
    id: "4",
    taskId: "REQ-0889",
    title: "Weekly Progress Report",
    relatedTo: "Emily Parker — Maple House",
    dueDate: "07 Feb 2026",
    status: "sent-for-approval",
    submitter: { name: "Emily Parker", initials: "EP", color: "bg-amber-600" },
  },
  {
    id: "5",
    taskId: "REQ-0888",
    title: "Incident Report Submission",
    relatedTo: "Tom Richards — Oak Lodge",
    dueDate: "05 Feb 2026",
    status: "urgent",
    submitter: { name: "Tom Richards", initials: "TR", color: "bg-indigo-600" },
  },
  {
    id: "6",
    taskId: "REQ-0887",
    title: "Care Plan Amendment",
    relatedTo: "Lisa Anderson — Pine View",
    dueDate: "08 Feb 2026",
    status: "sent-for-approval",
    submitter: { name: "Lisa Anderson", initials: "LA", color: "bg-green-600" },
  },
]

// Mock data — Provisions grouped by home
const homeProvisions: HomeProvision[] = [
  {
    id: "1",
    name: "Maple House",
    events: [
      {
        id: "e1",
        title: "Peniel's, Appointments...",
        time: "12:30PM - 1:30PM",
        type: "appointment",
        typeLabel: "Young Person",
        assignedTo: "Peniel Essouma",
        assignees: "Any",
        initials: "PE",
        avatarColor: "bg-blue-600",
      },
      {
        id: "e2",
        title: "Health, appointment",
        time: "4:00PM - 6:30PM",
        type: "appointment",
        typeLabel: "Young Person",
        assignedTo: "Caitlin Smith",
        assignees: "Any",
        initials: "CS",
        avatarColor: "bg-purple-600",
      },
    ],
    shifts: [
      {
        id: "s1",
        name: "Mark Thompson",
        role: "Senior Care Worker",
        shift: "07:00 — 19:00",
        initials: "MT",
        avatarColor: "bg-teal-600",
      },
      {
        id: "s2",
        name: "Emily Parker",
        role: "Care Worker",
        shift: "19:00 — 07:00",
        initials: "EP",
        avatarColor: "bg-amber-600",
      },
    ],
  },
  {
    id: "2",
    name: "Oak Lodge",
    events: [
      {
        id: "e3",
        title: "GP Appointment — Sarah Chen",
        time: "10:30AM - 11:00AM",
        type: "appointment",
        typeLabel: "Young Person",
        assignedTo: "Sarah Chen",
        assignees: "Any",
        initials: "SC",
        avatarColor: "bg-green-600",
      },
    ],
    shifts: [],
  },
  {
    id: "3",
    name: "Pine View",
    events: [],
    shifts: [
      {
        id: "s3",
        name: "David Williams",
        role: "Team Leader",
        shift: "08:00 — 20:00",
        initials: "DW",
        avatarColor: "bg-red-600",
      },
    ],
  },
]

export default function MySummaryPage() {
  const { user } = useAuth()
  const { guard, allowed, showModal, setShowModal } = usePermissionGuard("canApproveIOILogs")

  const handleNewTask = () => {
    console.log("New task clicked")
  }

  const handleAskAI = () => {
    console.log("Ask AI clicked")
  }

  const handleViewApproval = (id: string) => {
    console.log("View approval:", id)
  }

  const handleApproveTask = (id: string) => {
    guard(() => console.log("Approve task:", id))
  }

  const handleProcessBatch = () => {
    guard(() => console.log("Process batch clicked"))
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

      {/* Stats Grid — 10 cards */}
      <StatsOverview />

      <AccessBanner show={!allowed} message="You have view-only access to approval actions on this page." />

      {/* Main Content Grid — To Do + Tasks to Approve */}
      <div className="grid lg:grid-cols-2 gap-6">
        <TodoList items={todoItems} />
        <TasksToApprove
          items={approvalTasks}
          onView={handleViewApproval}
          onApprove={handleApproveTask}
          onProcessBatch={handleProcessBatch}
        />
      </div>

      {/* Bottom Section — Provisions per home */}
      <Provisions homes={homeProvisions} />

      <NoPermissionModal open={showModal} onOpenChange={setShowModal} />
    </div>
  )
}
