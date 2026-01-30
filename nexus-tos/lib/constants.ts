import {
  LayoutDashboard,
  BarChart3,
  Search,
  Users,
  Home,
  UserCircle,
  Briefcase,
  Car,
  Calendar,
  FileText,
  Clock,
  PieChart,
  Upload,
  HelpCircle,
  LogOut,
  AlertCircle,
  ListTodo,
  XCircle,
  FileEdit,
  CalendarClock,
  MessageSquare,
  Gift,
  Settings,
} from "lucide-react"

// Navigation Items
export const mainNavItems = [
  { label: "My Summary", href: "/my-summary", icon: LayoutDashboard },
  { label: "My Dashboard", href: "/my-dashboard", icon: BarChart3 },
  { label: "Task Explorer", href: "/tasks", icon: Search },
  "divider",
  { label: "Care Groups", href: "/care-groups", icon: Users },
  { label: "Homes", href: "/homes", icon: Home },
  { label: "Young People", href: "/young-people", icon: UserCircle },
  { label: "Employees", href: "/employees", icon: Briefcase },
  { label: "Vehicles", href: "/vehicles", icon: Car },
  "divider",
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Daily Logs", href: "/daily-logs", icon: FileText },
  { label: "Rotas", href: "/rotas", icon: Clock },
  "divider",
  { label: "Bespoke Reporting", href: "/reports", icon: PieChart },
  { label: "Uploads", href: "/uploads", icon: Upload },
] as const

export const bottomNavItems = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help Centre", href: "/help", icon: HelpCircle },
  { label: "Logout", href: "/logout", icon: LogOut },
] as const

// Dashboard Stats Configuration
export const dashboardStatsConfig = [
  {
    label: "Overdue Tasks",
    key: "overdue",
    color: "bg-red-500",
    textColor: "text-red-600",
    bgLight: "bg-red-50",
    icon: AlertCircle,
    href: "/tasks?status=overdue",
  },
  {
    label: "Tasks Due Today",
    key: "dueToday",
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgLight: "bg-blue-50",
    icon: ListTodo,
    href: "/tasks?status=due-today",
  },
  {
    label: "Pending Approval",
    key: "pendingApproval",
    color: "bg-amber-500",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50",
    icon: Clock,
    href: "/tasks?status=pending",
  },
  {
    label: "Rejected Tasks",
    key: "rejected",
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50",
    icon: XCircle,
    href: "/tasks?status=rejected",
  },
  {
    label: "Draft Tasks",
    key: "draft",
    color: "bg-teal-500",
    textColor: "text-teal-600",
    bgLight: "bg-teal-50",
    icon: FileEdit,
    href: "/tasks?status=draft",
  },
  {
    label: "Future Tasks",
    key: "future",
    color: "bg-green-500",
    textColor: "text-green-600",
    bgLight: "bg-green-50",
    icon: CalendarClock,
    href: "/tasks?status=future",
  },
  {
    label: "Comments",
    key: "comments",
    color: "bg-indigo-500",
    textColor: "text-indigo-600",
    bgLight: "bg-indigo-50",
    icon: MessageSquare,
    href: "/tasks?filter=comments",
  },
  {
    label: "Pending Rewards",
    key: "rewards",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgLight: "bg-yellow-50",
    icon: Gift,
    href: "/tasks?filter=rewards",
  },
] as const

// Status Badge Colors
export const statusColors = {
  overdue: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
  },
  "due-today": {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  rejected: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  draft: {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  future: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  approved: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  active: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
  },
  inactive: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  "on-leave": {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  transferred: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
} as const

// IOI Log Techniques Options
export const ioiTechniques = [
  "Active Listening",
  "Reflective Practice",
  "Cognitive Behavioral Techniques",
  "Trauma-Informed Care",
  "Positive Reinforcement",
  "De-escalation",
  "Grounding Exercises",
  "Mindfulness",
  "Solution-Focused Approach",
  "Play Therapy",
  "Art Therapy",
  "Social Skills Training",
  "Emotion Regulation",
  "Crisis Intervention",
  "Motivational Interviewing",
] as const

// Locations Options
export const locationOptions = [
  "Common Room",
  "Bedroom",
  "Garden",
  "Kitchen",
  "Dining Room",
  "Office",
  "School",
  "Community",
  "Vehicle",
  "Other",
] as const

// Priority Options
export const priorityOptions = [
  { value: "low", label: "Low", color: "text-green-600" },
  { value: "medium", label: "Medium", color: "text-amber-600" },
  { value: "high", label: "High", color: "text-red-600" },
] as const

// Task Categories
export const taskCategories = [
  "Daily Care",
  "Health & Medical",
  "Education",
  "Behavioral",
  "Administrative",
  "Training",
  "Review & Assessment",
  "External Meeting",
  "Family Contact",
  "Other",
] as const
