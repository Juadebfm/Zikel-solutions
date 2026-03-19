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

// Task Explorer Options
export const taskExplorerPeriodOptions = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7-days", label: "Last 7 Days" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "this-year", label: "This Year" },
  { value: "last-month", label: "Last Month" },
  { value: "all", label: "All" },
  { value: "custom", label: "Custom Range" },
] as const

export const taskExplorerTypeOptions = [
  { value: "home", label: "Home" },
  { value: "young-person", label: "Young Person" },
  { value: "vehicle", label: "Vehicle" },
] as const

export const taskExplorerProjectOptions = [
  { value: "all", label: "All" },
  { value: "maple-house", label: "Maple House" },
  { value: "oak-lodge", label: "Oak Lodge" },
  { value: "willow-court", label: "Willow Court" },
  { value: "pine-view", label: "Pine View" },
] as const

export const taskExplorerFormOptions = [
  { value: "building-and-care-procedures-audit", label: "Building And Care Procedures Audit" },
  { value: "cc-regulation-44-visit-report", label: "CC Regulation 44 Visit Report" },
  { value: "complaint-resolution", label: "Complaint Resolution" },
  { value: "complaints", label: "Complaints" },
  { value: "compliments-log", label: "Compliments Log" },
  { value: "daily-am-sharps-check", label: "Daily AM Sharps Check" },
  { value: "daily-cleaning-schedule", label: "Daily Cleaning Schedule" },
  { value: "daily-handover", label: "Daily Handover" },
  { value: "daily-ligature-check", label: "Daily Ligature Check" },
  { value: "daily-window-restrictor-checks", label: "Daily Window Restrictor Checks" },
  { value: "fridge-freezer-temps", label: "Fridge/Freezer Temps" },
  { value: "house-evacuation", label: "House Evacuation" },
  { value: "house-information", label: "House Information" },
  { value: "house-team-meeting", label: "House Team Meeting" },
  { value: "kpi-home-extended-data", label: "KPI Home Extended Data" },
  { value: "location-of-premises-risk-assessment", label: "Location Of Premises Risk Assessment" },
  { value: "maintenance-request", label: "Maintenance Request" },
  { value: "managers-weekly-medication-audit", label: "Manager's Weekly Medication Audit" },
  { value: "managers-response-to-reg-44-actions", label: "Managers Response To Reg 44 Actions" },
  { value: "notification-to-ofsted", label: "Notification To Ofsted" },
  { value: "petty-cash", label: "Petty Cash" },
  { value: "placement-impact-evaluation", label: "Placement Impact Evaluation" },
  { value: "pool-car-checks", label: "Pool Car Checks" },
  { value: "property-damage", label: "Property Damage" },
  { value: "reg-44-or-ofsted-actions", label: "REG 44 OR OFSTED ACTIONS" },
  { value: "reg-44-visit-report-form", label: "REG 44 VISIT REPORT FORM" },
  { value: "reg-45-review-summary-form", label: "REG 45 Review Summary Form" },
  { value: "regulation-40", label: "Regulation 40" },
  { value: "regulation-45", label: "Regulation 45" },
  { value: "waking-night-summary", label: "Waking Night Summary" },
  { value: "weekly-cossh-check", label: "Weekly Cossh Check" },
  { value: "weekly-deep-cleaning", label: "Weekly Deep Cleaning" },
  { value: "weekly-fire-alarm-and-equipment-checks", label: "Weekly Fire Alarm And Equipment Checks" },
  { value: "weekly-water-temp-checks", label: "Weekly Water Temp Checks" },
] as const

export const taskExplorerFieldOptions = [
  { value: "title", label: "Title" },
  { value: "assigned-to", label: "Assigned To" },
  { value: "related-to", label: "Related To" },
  { value: "created-by", label: "Created By" },
  { value: "due-date", label: "Due Date" },
] as const

export const taskExplorerSearchByOtherOptions = [
  { value: "task-summary", label: "Task Summary" },
  { value: "field-value", label: "Field Value" },
] as const

export const taskExplorerStatusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "draft", label: "Draft" },
  { value: "sent-for-approval", label: "Sent For Approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "sent-for-deletion", label: "Sent For Deletion" },
  { value: "deleted", label: "Deleted" },
  { value: "deleted-draft", label: "Deleted Draft" },
  { value: "hidden", label: "Hidden" },
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

// ─── Create Employee Form Options ──────────────────────────────────────────

export const administratorOptions = [
  { value: "sarah-johnson", label: "Sarah Johnson" },
  { value: "mark-thompson", label: "Mark Thompson" },
  { value: "emma-white", label: "Emma White" },
  { value: "david-chen", label: "David Chen" },
  { value: "lisa-patel", label: "Lisa Patel" },
] as const

export const colourOptions = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "purple", label: "Purple" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
] as const

export const nationalityOptions = [
  { value: "british", label: "British" },
  { value: "irish", label: "Irish" },
  { value: "american", label: "American" },
  { value: "australian", label: "Australian" },
  { value: "canadian", label: "Canadian" },
  { value: "indian", label: "Indian" },
  { value: "pakistani", label: "Pakistani" },
  { value: "polish", label: "Polish" },
  { value: "romanian", label: "Romanian" },
  { value: "other", label: "Other" },
] as const

export const ethnicityOptions = [
  { value: "white-british", label: "White British" },
  { value: "white-irish", label: "White Irish" },
  { value: "white-other", label: "Any Other White Background" },
  { value: "mixed-white-caribbean", label: "White and Black Caribbean" },
  { value: "mixed-white-african", label: "White and Black African" },
  { value: "mixed-white-asian", label: "White and Asian" },
  { value: "asian-indian", label: "Indian" },
  { value: "asian-pakistani", label: "Pakistani" },
  { value: "asian-bangladeshi", label: "Bangladeshi" },
  { value: "black-caribbean", label: "Caribbean" },
  { value: "black-african", label: "African" },
  { value: "other", label: "Other Ethnic Group" },
] as const

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer Not To Say" },
] as const

export const jobTitleOptions = [
  { value: "registered-manager", label: "Registered Manager" },
  { value: "deputy-manager", label: "Deputy Manager" },
  { value: "senior-support-worker", label: "Senior Support Worker" },
  { value: "support-worker", label: "Support Worker" },
  { value: "night-support-worker", label: "Night Support Worker" },
  { value: "waking-night-worker", label: "Waking Night Worker" },
  { value: "team-leader", label: "Team Leader" },
  { value: "administrator", label: "Administrator" },
  { value: "cook", label: "Cook" },
  { value: "maintenance", label: "Maintenance" },
] as const

export const employmentTypeOptions = [
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "bank", label: "Bank" },
  { value: "agency", label: "Agency" },
  { value: "voluntary", label: "Voluntary" },
] as const

export const lineManagerOptions = [
  { value: "sarah-johnson", label: "Sarah Johnson" },
  { value: "mark-thompson", label: "Mark Thompson" },
  { value: "emma-white", label: "Emma White" },
  { value: "david-chen", label: "David Chen" },
] as const

export const contractTypeOptions = [
  { value: "permanent", label: "Permanent" },
  { value: "fixed-term", label: "Fixed Term" },
  { value: "zero-hours", label: "Zero Hours" },
  { value: "temporary", label: "Temporary" },
] as const

export const annualLeaveFlexibilityOptions = [
  { value: "standard", label: "Standard" },
  { value: "flexible", label: "Flexible" },
  { value: "compressed", label: "Compressed" },
] as const

export const homeSchoolOptions = [
  { value: "the-homeland", label: "The Homeland" },
  { value: "oakwood-house", label: "Oakwood House" },
  { value: "maple-house", label: "Maple House" },
  { value: "willow-court", label: "Willow Court" },
] as const
