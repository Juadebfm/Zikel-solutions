import type {
  User,
  YoungPerson,
  Home,
  CareGroup,
  Employee,
  Task,
  IOILog,
  Vehicle,
  CalendarEvent,
} from "@/types"

// Current logged in user
export const mockUser: User = {
  id: "user-1",
  email: "sarah.johnson@nexustherapeutic.com",
  firstName: "Sarah",
  lastName: "Johnson",
  role: "manager",
  avatar: undefined,
  homeId: "home-1",
  createdAt: "2023-01-15T09:00:00Z",
}

// Dashboard statistics
export const mockStats = {
  overdue: 3,
  dueToday: 7,
  pendingApproval: 12,
  rejected: 2,
  draft: 5,
  future: 18,
  comments: 4,
  rewards: 6,
}

// Young People
export const mockYoungPeople: YoungPerson[] = [
  {
    id: "yp-1",
    firstName: "James",
    lastName: "Wilson",
    dateOfBirth: "2010-03-15",
    homeId: "home-1",
    homeName: "Maple House",
    status: "active",
    admissionDate: "2023-06-01",
    keyWorker: "Sarah Johnson",
  },
  {
    id: "yp-2",
    firstName: "Emily",
    lastName: "Brown",
    dateOfBirth: "2011-07-22",
    homeId: "home-1",
    homeName: "Maple House",
    status: "active",
    admissionDate: "2023-04-15",
    keyWorker: "Mark Thompson",
  },
  {
    id: "yp-3",
    firstName: "Oliver",
    lastName: "Davis",
    dateOfBirth: "2009-11-08",
    homeId: "home-2",
    homeName: "Oak Lodge",
    status: "active",
    admissionDate: "2022-09-20",
    keyWorker: "Emma White",
  },
  {
    id: "yp-4",
    firstName: "Sophie",
    lastName: "Taylor",
    dateOfBirth: "2012-01-30",
    homeId: "home-1",
    homeName: "Maple House",
    status: "active",
    admissionDate: "2024-01-10",
    keyWorker: "Sarah Johnson",
  },
  {
    id: "yp-5",
    firstName: "Daniel",
    lastName: "Moore",
    dateOfBirth: "2008-05-12",
    homeId: "home-2",
    homeName: "Oak Lodge",
    status: "transferred",
    admissionDate: "2021-03-05",
    keyWorker: "James Clark",
  },
]

// Homes
export const mockHomes: Home[] = [
  {
    id: "home-1",
    name: "Maple House",
    address: "123 Maple Street, Manchester, M1 2AB",
    capacity: 6,
    currentOccupancy: 4,
    manager: "Sarah Johnson",
    phone: "0161 234 5678",
    status: "active",
  },
  {
    id: "home-2",
    name: "Oak Lodge",
    address: "45 Oak Avenue, Liverpool, L2 3CD",
    capacity: 5,
    currentOccupancy: 3,
    manager: "Michael Roberts",
    phone: "0151 987 6543",
    status: "active",
  },
  {
    id: "home-3",
    name: "Willow Court",
    address: "78 Willow Lane, Leeds, LS1 4EF",
    capacity: 4,
    currentOccupancy: 2,
    manager: "Lisa Anderson",
    phone: "0113 456 7890",
    status: "active",
  },
]

// Care Groups
export const mockCareGroups: CareGroup[] = [
  {
    id: "cg-1",
    name: "North West Region",
    description: "All homes in the North West area",
    homes: ["home-1", "home-2"],
    manager: "David Williams",
  },
  {
    id: "cg-2",
    name: "Yorkshire Region",
    description: "All homes in Yorkshire",
    homes: ["home-3"],
    manager: "Jennifer Brown",
  },
]

// Employees
export const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@nexustherapeutic.com",
    role: "manager",
    homeId: "home-1",
    homeName: "Maple House",
    phone: "07700 900001",
    status: "active",
    startDate: "2021-03-15",
  },
  {
    id: "emp-2",
    firstName: "Mark",
    lastName: "Thompson",
    email: "mark.thompson@nexustherapeutic.com",
    role: "staff",
    homeId: "home-1",
    homeName: "Maple House",
    phone: "07700 900002",
    status: "active",
    startDate: "2022-06-01",
  },
  {
    id: "emp-3",
    firstName: "Emma",
    lastName: "White",
    email: "emma.white@nexustherapeutic.com",
    role: "staff",
    homeId: "home-2",
    homeName: "Oak Lodge",
    phone: "07700 900003",
    status: "active",
    startDate: "2022-09-15",
  },
  {
    id: "emp-4",
    firstName: "James",
    lastName: "Clark",
    email: "james.clark@nexustherapeutic.com",
    role: "staff",
    homeId: "home-2",
    homeName: "Oak Lodge",
    phone: "07700 900004",
    status: "on-leave",
    startDate: "2021-11-01",
  },
  {
    id: "emp-5",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@nexustherapeutic.com",
    role: "manager",
    homeId: "home-3",
    homeName: "Willow Court",
    phone: "07700 900005",
    status: "active",
    startDate: "2020-08-20",
  },
]

// Tasks - To Do List
export const mockToDoTasks: Task[] = [
  {
    id: "task-1",
    title: "Complete weekly health check for James Wilson",
    description: "Regular health assessment including weight, mood, and general wellbeing",
    status: "due-today",
    dueDate: new Date().toISOString(),
    assignedTo: "emp-1",
    assignedToName: "Sarah Johnson",
    youngPersonId: "yp-1",
    youngPersonName: "James Wilson",
    category: "Health & Medical",
    priority: "high",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T09:00:00Z",
  },
  {
    id: "task-2",
    title: "Submit monthly report for Maple House",
    description: "Compile and submit the monthly operational report",
    status: "overdue",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "emp-1",
    assignedToName: "Sarah Johnson",
    category: "Administrative",
    priority: "high",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z",
  },
  {
    id: "task-3",
    title: "Arrange dental appointment for Emily Brown",
    description: "Schedule routine dental check-up",
    status: "due-today",
    dueDate: new Date().toISOString(),
    assignedTo: "emp-2",
    assignedToName: "Mark Thompson",
    youngPersonId: "yp-2",
    youngPersonName: "Emily Brown",
    category: "Health & Medical",
    priority: "medium",
    createdAt: "2024-01-18T09:00:00Z",
    updatedAt: "2024-01-18T09:00:00Z",
  },
  {
    id: "task-4",
    title: "Update care plan for Sophie Taylor",
    description: "Review and update the care plan following recent assessment",
    status: "future",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "emp-1",
    assignedToName: "Sarah Johnson",
    youngPersonId: "yp-4",
    youngPersonName: "Sophie Taylor",
    category: "Review & Assessment",
    priority: "medium",
    createdAt: "2024-01-19T09:00:00Z",
    updatedAt: "2024-01-19T09:00:00Z",
  },
  {
    id: "task-5",
    title: "Complete safeguarding training",
    description: "Annual mandatory safeguarding refresher course",
    status: "draft",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "emp-2",
    assignedToName: "Mark Thompson",
    category: "Training",
    priority: "low",
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-17T09:00:00Z",
  },
]

// Tasks - Pending Approval
export const mockApprovalTasks: Task[] = [
  {
    id: "approval-1",
    title: "IOI Log - James Wilson - Session 15/01",
    description: "Therapeutic intervention log requiring manager approval",
    status: "pending",
    dueDate: new Date().toISOString(),
    assignedTo: "emp-2",
    assignedToName: "Mark Thompson",
    youngPersonId: "yp-1",
    youngPersonName: "James Wilson",
    category: "Daily Care",
    priority: "medium",
    createdAt: "2024-01-15T14:30:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "approval-2",
    title: "Leave request - Emma White",
    description: "Annual leave request for 5 days in February",
    status: "pending",
    dueDate: new Date().toISOString(),
    assignedTo: "emp-3",
    assignedToName: "Emma White",
    category: "Administrative",
    priority: "low",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
  },
  {
    id: "approval-3",
    title: "Incident report - Minor altercation",
    description: "Incident report requiring review and sign-off",
    status: "pending",
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "emp-4",
    assignedToName: "James Clark",
    youngPersonId: "yp-3",
    youngPersonName: "Oliver Davis",
    category: "Behavioral",
    priority: "high",
    createdAt: "2024-01-19T16:45:00Z",
    updatedAt: "2024-01-19T16:45:00Z",
  },
]

// IOI Logs
export const mockLogs: IOILog[] = [
  {
    id: "log-1",
    youngPersonId: "yp-1",
    youngPersonName: "James Wilson",
    authorId: "emp-1",
    authorName: "Sarah Johnson",
    sessionDate: "2024-01-20T10:00:00Z",
    location: "Common Room",
    status: "approved",
    input: {
      situation: "James appeared withdrawn during breakfast and refused to engage with peers. Staff observed signs of anxiety including fidgeting and avoiding eye contact.",
      clientState: "Anxious, withdrawn, low mood",
      goals: "To help James express his feelings and reduce anxiety levels",
    },
    output: {
      intervention: "Initiated a one-to-one conversation using active listening techniques. Provided a calm, private space in the common room. Used grounding exercises (5-4-3-2-1 technique) to help manage anxiety.",
      techniques: ["Active Listening", "Grounding Exercises", "Trauma-Informed Care"],
      duration: 45,
    },
    impact: {
      immediateImpact: "James gradually opened up about worries regarding upcoming family contact. Anxiety visibly reduced - stopped fidgeting and made eye contact.",
      clientResponse: "James expressed gratitude for the conversation and asked if we could do regular check-ins.",
      followUpNeeded: true,
      notes: "Schedule follow-up before family contact visit next week. Consider involving therapist if anxiety persists.",
    },
    createdAt: "2024-01-20T11:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    approvedBy: "Michael Roberts",
    approvedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "log-2",
    youngPersonId: "yp-2",
    youngPersonName: "Emily Brown",
    authorId: "emp-2",
    authorName: "Mark Thompson",
    sessionDate: "2024-01-19T14:00:00Z",
    location: "Garden",
    status: "pending",
    input: {
      situation: "Emily had a disagreement with another young person during lunch. She left the table upset and went to her room.",
      clientState: "Upset, angry, frustrated",
      goals: "Help Emily process her emotions and develop conflict resolution skills",
    },
    output: {
      intervention: "After allowing Emily time to calm down, approached her and offered to talk in the garden. Used reflective practice to help her understand her emotions and the other person's perspective.",
      techniques: ["Reflective Practice", "Emotion Regulation", "Social Skills Training"],
      duration: 30,
    },
    impact: {
      immediateImpact: "Emily was able to identify that she felt unheard and that her reaction was disproportionate. She agreed to apologise.",
      clientResponse: "Positive - Emily thanked staff for not taking sides and helping her see the situation clearly.",
      followUpNeeded: false,
      notes: "Monitor interactions at mealtimes over the next few days.",
    },
    createdAt: "2024-01-19T15:00:00Z",
    updatedAt: "2024-01-19T15:00:00Z",
  },
  {
    id: "log-3",
    youngPersonId: "yp-4",
    youngPersonName: "Sophie Taylor",
    authorId: "emp-1",
    authorName: "Sarah Johnson",
    sessionDate: "2024-01-18T16:00:00Z",
    location: "Bedroom",
    status: "draft",
    input: {
      situation: "Sophie requested help with homework but became frustrated when she couldn't understand the maths problems.",
      clientState: "Frustrated, low confidence",
      goals: "Support Sophie with homework while building confidence",
    },
    output: {
      intervention: "Broke down the problems into smaller steps. Used positive reinforcement when she got answers correct. Took breaks when frustration built up.",
      techniques: ["Positive Reinforcement", "Solution-Focused Approach"],
      duration: 60,
    },
    impact: {
      immediateImpact: "Sophie completed her homework with support. Her confidence improved as she solved problems independently by the end.",
      clientResponse: "Sophie said she felt proud of herself and asked if we could do homework help sessions regularly.",
      followUpNeeded: true,
      notes: "Arrange regular homework support. Consider liaising with school about additional learning support.",
    },
    createdAt: "2024-01-18T17:30:00Z",
    updatedAt: "2024-01-18T17:30:00Z",
  },
]

// Vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: "veh-1",
    registration: "AB12 CDE",
    make: "Ford",
    model: "Transit Custom",
    homeId: "home-1",
    homeName: "Maple House",
    status: "available",
    mileage: 45230,
    nextServiceDate: "2024-03-15",
  },
  {
    id: "veh-2",
    registration: "XY34 FGH",
    make: "Volkswagen",
    model: "Caddy",
    homeId: "home-2",
    homeName: "Oak Lodge",
    status: "in-use",
    mileage: 32100,
    nextServiceDate: "2024-02-28",
  },
  {
    id: "veh-3",
    registration: "LM56 NOP",
    make: "Vauxhall",
    model: "Vivaro",
    homeId: "home-3",
    homeName: "Willow Court",
    status: "maintenance",
    mileage: 67800,
    nextServiceDate: "2024-01-25",
  },
]

// Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "event-1",
    title: "Team Meeting",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    type: "meeting",
    description: "Weekly team catch-up",
    participants: ["Sarah Johnson", "Mark Thompson"],
  },
  {
    id: "event-2",
    title: "James Wilson - School Review",
    date: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:00",
    type: "appointment",
    description: "Termly review meeting at school",
  },
  {
    id: "event-3",
    title: "Safeguarding Training",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "12:00",
    type: "training",
    description: "Annual mandatory training session",
    participants: ["All Staff"],
  },
  {
    id: "event-4",
    title: "Emily Brown - Family Contact",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    startTime: "15:00",
    endTime: "16:30",
    type: "appointment",
    description: "Supervised family contact visit",
  },
]

// Helper function to get young person by ID
export function getYoungPersonById(id: string): YoungPerson | undefined {
  return mockYoungPeople.find((yp) => yp.id === id)
}

// Helper function to get employee by ID
export function getEmployeeById(id: string): Employee | undefined {
  return mockEmployees.find((emp) => emp.id === id)
}

// Helper function to get home by ID
export function getHomeById(id: string): Home | undefined {
  return mockHomes.find((home) => home.id === id)
}

// Helper function to get log by ID
export function getLogById(id: string): IOILog | undefined {
  return mockLogs.find((log) => log.id === id)
}
