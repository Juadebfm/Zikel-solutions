import type {
  User,
  YoungPerson,
  Home,
  CareGroup,
  CareGroupHome,
  Stakeholder,
  Employee,
  Task,
  IOILog,
  Vehicle,
  CalendarEvent,
  TaskExplorerForm,
  TaskExplorerLogEntry,
  HomeSettingItem,
  HomeSettingCategory,
  HomeAuditEntry,
  HomeAuditCategory,
  YoungPersonReward,
  YPSettingItem,
  YPSettingCategory,
  YPAuditEntry,
  YPAuditCategory,
  OutcomeStarEntry,
  EmpSettingItem,
  EmpSettingCategory,
  EmpAuditEntry,
  EmpAuditCategory,
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
    id: 1,
    firstName: "James",
    lastName: "Wilson",
    dateOfBirth: "15/03/2010",
    homeId: "home-1",
    homeName: "The Homeland",
    status: "current",
    youngPersonType: "child",
    gender: "male",
    category: "Residential",
    admissionDate: "01/06/2023",
    keyWorker: "Sarah Johnson",
  },
  {
    id: 2,
    firstName: "Emily",
    lastName: "Brown",
    dateOfBirth: "22/07/2011",
    homeId: "home-1",
    homeName: "The Homeland",
    status: "current",
    youngPersonType: "child",
    gender: "female",
    category: "Residential",
    admissionDate: "15/04/2023",
    keyWorker: "Mark Thompson",
  },
  {
    id: 3,
    firstName: "Oliver",
    lastName: "Davis",
    dateOfBirth: "08/11/2009",
    homeId: "home-2",
    homeName: "Oakwood House",
    status: "current",
    youngPersonType: "child",
    gender: "male",
    category: "Residential",
    admissionDate: "20/09/2022",
    keyWorker: "Emma White",
  },
  {
    id: 4,
    firstName: "Sophie",
    lastName: "Taylor",
    dateOfBirth: "30/01/2012",
    homeId: "home-1",
    homeName: "The Homeland",
    status: "current",
    youngPersonType: "child",
    gender: "female",
    category: "Residential",
    admissionDate: "10/01/2024",
    keyWorker: "Sarah Johnson",
  },
  {
    id: 5,
    firstName: "Daniel",
    lastName: "Moore",
    dateOfBirth: "12/05/2008",
    homeId: "home-2",
    homeName: "Oakwood House",
    status: "past",
    youngPersonType: "young-adult",
    gender: "male",
    category: "Semi-Independent",
    admissionDate: "05/03/2021",
    keyWorker: "James Clark",
  },
  {
    id: 6,
    firstName: "Amelia",
    lastName: "Harris",
    dateOfBirth: "18/09/2010",
    homeId: "home-2",
    homeName: "Oakwood House",
    status: "current",
    youngPersonType: "child",
    gender: "female",
    category: "Residential",
    admissionDate: "12/07/2024",
    keyWorker: "Emma White",
  },
  {
    id: 7,
    firstName: "Noah",
    lastName: "Patel",
    dateOfBirth: "03/04/2011",
    homeId: "home-1",
    homeName: "The Homeland",
    status: "planned",
    youngPersonType: "child",
    gender: "male",
    category: "Residential",
    admissionDate: "01/03/2026",
    keyWorker: "Sarah Johnson",
  },
  {
    id: 8,
    firstName: "Chloe",
    lastName: "Roberts",
    dateOfBirth: "27/12/2007",
    homeId: "home-1",
    homeName: "The Homeland",
    status: "past",
    youngPersonType: "young-adult",
    gender: "female",
    category: "Semi-Independent",
    admissionDate: "14/08/2022",
    keyWorker: "Mark Thompson",
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
    id: 562133529,
    name: "THR Services Limited",
    type: "private",
    phoneNumber: "",
    email: "",
    faxNumber: "",
    description: "",
    website: "",
    defaultUserIpRestriction: false,
    homes: ["home-1", "home-2", "home-3"],
    manager: "David Williams",
    lastUpdated: "18/11/2025 0:22PM",
    lastUpdatedBy: "thrservicesadmin",
    contact: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    countryRegion: "",
    postcode: "",
    twilioSid: "••••••••••••••••••••••",
    twilioToken: "••••••••••••••••••••••••••",
    twilioPhoneNumber: "",
  },
]

// Care Group Homes
export const mockCareGroupHomes: CareGroupHome[] = [
  {
    id: 4,
    name: "The Homeland",
    status: "current",
    category: "Children's Home",
    responsibleIndividual: "thrservicesadmin",
    detailsAvailable: true,
    careGroupId: 562133529,
  },
  {
    id: 7,
    name: "Oakwood House",
    status: "current",
    category: "Children's Home",
    responsibleIndividual: "Sarah Johnson",
    detailsAvailable: true,
    careGroupId: 562133529,
  },
  {
    id: 12,
    name: "Riverside Lodge",
    status: "past",
    category: "Supported Accommodation",
    responsibleIndividual: "Michael Roberts",
    detailsAvailable: true,
    careGroupId: 562133529,
  },
  {
    id: 15,
    name: "Willow Gardens",
    status: "planned",
    category: "Children's Home",
    responsibleIndividual: "thrservicesadmin",
    detailsAvailable: false,
    careGroupId: 562133529,
  },
  {
    id: 19,
    name: "Birch Cottage",
    status: "current",
    category: "Secure Children's Home",
    responsibleIndividual: "Lisa Anderson",
    detailsAvailable: true,
    careGroupId: 562133529,
  },
  {
    id: 22,
    name: "Elm Court",
    status: "past",
    category: "Children's Home",
    responsibleIndividual: "James Clark",
    detailsAvailable: true,
    careGroupId: 562133529,
  },
]

// Care Group Stakeholders
export const mockStakeholders: Stakeholder[] = []

// Helper function to get care group by ID
export function getCareGroupById(id: number): CareGroup | undefined {
  return mockCareGroups.find((cg) => cg.id === id)
}

// Employees
export const mockEmployees: Employee[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@nexustherapeutic.com",
    role: "manager",
    homeId: "home-1",
    homeName: "The Homeland",
    phone: "07700 900001",
    jobTitle: "Registered Manager",
    status: "current",
    startDate: "15/03/2021",
  },
  {
    id: 2,
    firstName: "Mark",
    lastName: "Thompson",
    email: "mark.thompson@nexustherapeutic.com",
    role: "staff",
    homeId: "home-1",
    homeName: "The Homeland",
    phone: "07700 900002",
    jobTitle: "Senior Support Worker",
    status: "current",
    startDate: "01/06/2022",
  },
  {
    id: 3,
    firstName: "Emma",
    lastName: "White",
    email: "emma.white@nexustherapeutic.com",
    role: "staff",
    homeId: "home-2",
    homeName: "Oakwood House",
    phone: "07700 900003",
    jobTitle: "Support Worker",
    status: "current",
    startDate: "15/09/2022",
  },
  {
    id: 4,
    firstName: "James",
    lastName: "Clark",
    email: "james.clark@nexustherapeutic.com",
    role: "staff",
    homeId: "home-2",
    homeName: "Oakwood House",
    phone: "07700 900004",
    jobTitle: "Support Worker",
    status: "past",
    startDate: "01/11/2021",
  },
  {
    id: 5,
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@nexustherapeutic.com",
    role: "manager",
    homeId: "home-1",
    homeName: "The Homeland",
    phone: "07700 900005",
    jobTitle: "Deputy Manager",
    status: "current",
    startDate: "20/08/2020",
  },
  {
    id: 6,
    firstName: "David",
    lastName: "Okafor",
    email: "david.okafor@nexustherapeutic.com",
    role: "staff",
    homeId: "home-2",
    homeName: "Oakwood House",
    phone: "07700 900006",
    jobTitle: "Night Support Worker",
    status: "current",
    startDate: "10/01/2024",
  },
  {
    id: 7,
    firstName: "Rachel",
    lastName: "Green",
    email: "rachel.green@nexustherapeutic.com",
    role: "staff",
    homeId: "home-1",
    homeName: "The Homeland",
    phone: "07700 900007",
    jobTitle: "Waking Night Staff",
    status: "planned",
    startDate: "01/03/2026",
  },
  {
    id: 8,
    firstName: "Thomas",
    lastName: "Wright",
    email: "thomas.wright@nexustherapeutic.com",
    role: "staff",
    homeId: "home-2",
    homeName: "Oakwood House",
    phone: "07700 900008",
    jobTitle: "Senior Support Worker",
    status: "past",
    startDate: "05/04/2020",
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

// Task Explorer — Forms
export const mockTaskExplorerForms: TaskExplorerForm[] = [
  {
    id: "form-1",
    name: "Daily Care Record",
    category: "Daily Care",
    fields: [
      { id: "f1-1", label: "Young Person", type: "select", required: true },
      { id: "f1-2", label: "Date", type: "date", required: true },
      { id: "f1-3", label: "Mood Assessment", type: "select", required: true },
      { id: "f1-4", label: "Activities", type: "text", required: false },
      { id: "f1-5", label: "Notes", type: "text", required: false },
    ],
    lastUpdated: "2026-02-08T10:00:00Z",
  },
  {
    id: "form-2",
    name: "Health Check Form",
    category: "Health & Medical",
    fields: [
      { id: "f2-1", label: "Young Person", type: "select", required: true },
      { id: "f2-2", label: "Check Date", type: "date", required: true },
      { id: "f2-3", label: "Weight (kg)", type: "number", required: true },
      { id: "f2-4", label: "Temperature", type: "number", required: false },
      { id: "f2-5", label: "General Wellbeing", type: "select", required: true },
      { id: "f2-6", label: "Follow-up Required", type: "checkbox", required: false },
    ],
    lastUpdated: "2026-02-07T14:30:00Z",
  },
  {
    id: "form-3",
    name: "Incident Report Form",
    category: "Behavioral",
    fields: [
      { id: "f3-1", label: "Incident Date", type: "date", required: true },
      { id: "f3-2", label: "Incident Type", type: "select", required: true },
      { id: "f3-3", label: "Young People Involved", type: "select", required: true },
      { id: "f3-4", label: "Description", type: "text", required: true },
      { id: "f3-5", label: "Action Taken", type: "text", required: true },
    ],
    lastUpdated: "2026-02-06T09:15:00Z",
  },
  {
    id: "form-4",
    name: "Care Plan Review",
    category: "Review & Assessment",
    fields: [
      { id: "f4-1", label: "Young Person", type: "select", required: true },
      { id: "f4-2", label: "Review Date", type: "date", required: true },
      { id: "f4-3", label: "Goals Progress", type: "text", required: true },
      { id: "f4-4", label: "Updated Goals", type: "text", required: true },
      { id: "f4-5", label: "Next Review Date", type: "date", required: true },
    ],
    lastUpdated: "2026-02-05T11:00:00Z",
  },
  {
    id: "form-5",
    name: "Risk Assessment",
    category: "Review & Assessment",
    fields: [
      { id: "f5-1", label: "Young Person", type: "select", required: true },
      { id: "f5-2", label: "Assessment Date", type: "date", required: true },
      { id: "f5-3", label: "Risk Level", type: "select", required: true },
      { id: "f5-4", label: "Risk Factors", type: "text", required: true },
      { id: "f5-5", label: "Mitigation Plan", type: "text", required: true },
    ],
    lastUpdated: "2026-02-04T16:45:00Z",
  },
  {
    id: "form-6",
    name: "Medication Administration",
    category: "Health & Medical",
    fields: [
      { id: "f6-1", label: "Young Person", type: "select", required: true },
      { id: "f6-2", label: "Medication Name", type: "text", required: true },
      { id: "f6-3", label: "Dosage", type: "text", required: true },
      { id: "f6-4", label: "Time Administered", type: "date", required: true },
      { id: "f6-5", label: "Administered By", type: "select", required: true },
    ],
    lastUpdated: "2026-02-09T08:00:00Z",
  },
  {
    id: "form-7",
    name: "Key Worker Session",
    category: "Daily Care",
    fields: [
      { id: "f7-1", label: "Young Person", type: "select", required: true },
      { id: "f7-2", label: "Session Date", type: "date", required: true },
      { id: "f7-3", label: "Topics Discussed", type: "text", required: true },
      { id: "f7-4", label: "Goals Set", type: "text", required: false },
      { id: "f7-5", label: "Next Session", type: "date", required: false },
    ],
    lastUpdated: "2026-02-03T13:20:00Z",
  },
]

// Task Explorer — Log Entries (matches real table columns)
export const mockTaskExplorerLogs: TaskExplorerLogEntry[] = [
  {
    id: "log-1",
    taskId: 796,
    title: "Absence/Missing Form - PE 09/02/2026 (4)",
    formGroup: "Absence Form",
    relatesTo: "Peniel Essouma",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 10:28:00 PM",
    status: "draft",
    originallyRecordedAt: "09/02/2026 11:30:23 PM",
    originallyRecordedBy: "Kwadwo",
  },
  {
    id: "log-2",
    taskId: 725,
    title: "Medication Prescribed",
    formGroup: "Medication Dispensed",
    relatesTo: "CAITLIN SMITH",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:47:00 PM",
    status: "sent-for-approval",
    originallyRecordedAt: "09/02/2026 8:49:55 PM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-3",
    taskId: 722,
    title: "Daily Summary - 09/02/2026",
    formGroup: "Daily Summary",
    relatesTo: "CAITLIN SMITH",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:36:00 PM",
    status: "draft",
    originallyRecordedAt: "09/02/2026 8:45:19 PM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-4",
    taskId: 743,
    title: "PM sharps check",
    formGroup: "Daily AM sharps check",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:32:00 PM",
    status: "submitted",
    originallyRecordedAt: "09/02/2026 8:33:44 PM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-5",
    taskId: 721,
    title: "Daily Summary - 09/02/2026 (8)",
    formGroup: "Daily Summary",
    relatesTo: "Peniel Essouma",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 5:54:00 PM",
    status: "draft",
    originallyRecordedAt: "09/02/2026 11:48:16 PM",
    originallyRecordedBy: "Masud",
  },
  {
    id: "log-6",
    taskId: 738,
    title: "Professional Contact 09/02/2026",
    formGroup: "Professional Contact",
    relatesTo: "CAITLIN SMITH",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 5:48:00 PM",
    status: "sent-for-approval",
    originallyRecordedAt: "09/02/2026 6:53:43 PM",
    originallyRecordedBy: "Masud",
  },
  {
    id: "log-7",
    taskId: 734,
    title: "Cleaning Schedule",
    formGroup: "Daily Cleaning Schedule",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 4:37:00 PM",
    status: "approved",
    originallyRecordedAt: "09/02/2026 5:38:11 PM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-8",
    taskId: 737,
    title: "Ligature Check",
    formGroup: "Daily Ligature Check",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:45:00 AM",
    status: "approved",
    originallyRecordedAt: "09/02/2026 8:45:58 AM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-9",
    taskId: 733,
    title: "AM sharps check",
    formGroup: "Daily AM sharps check",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:44:00 AM",
    status: "submitted",
    originallyRecordedAt: "09/02/2026 8:45:22 AM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-10",
    taskId: 728,
    title: "Fridge/Freezer Temps Checks",
    formGroup: "Fridge/Freezer Temps",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:43:00 AM",
    status: "submitted",
    originallyRecordedAt: "09/02/2026 8:44:32 AM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-11",
    taskId: 716,
    title: "Waking Night Summary - 09/02/2026 (8)",
    formGroup: "Waking Night Summary",
    relatesTo: "CAITLIN SMITH",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 12:42:00 AM",
    status: "rejected",
    originallyRecordedAt: "09/02/2026 8:30:34 AM",
    originallyRecordedBy: "Miracle",
  },
  {
    id: "log-12",
    taskId: 717,
    title: "Daily Cleaning Schedule - 09/02/2026 (2)",
    formGroup: "Daily Cleaning Schedule",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 12:40:00 AM",
    status: "approved",
    originallyRecordedAt: "09/02/2026 1:42:08 AM",
    originallyRecordedBy: "Miracle",
  },
  {
    id: "log-13",
    taskId: 723,
    title: "Daily Handover - 09/02/2026 (4)",
    formGroup: "Daily Handover",
    relatesTo: "Peniel Essouma",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 12:00:00 AM",
    status: "sent-for-approval",
    originallyRecordedAt: "09/02/2026 11:26:33 PM",
    originallyRecordedBy: "Masud",
  },
  {
    id: "log-14",
    taskId: 740,
    title: "Petty Cash 09/02/2026",
    formGroup: "Petty Cash",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 3:15:00 PM",
    status: "draft",
    originallyRecordedAt: "09/02/2026 4:20:00 PM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-15",
    taskId: 729,
    title: "Daily Window Restrictor checks",
    formGroup: "Daily Window Restrictor checks",
    relatesTo: "The Homeland",
    relatesToIcon: "home",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 7:40:00 AM",
    status: "submitted",
    originallyRecordedAt: "09/02/2026 8:42:15 AM",
    originallyRecordedBy: "Penn",
  },
  {
    id: "log-16",
    taskId: 724,
    title: "Daily Handover - 09/02/2026 (7)",
    formGroup: "Daily Handover",
    relatesTo: "CAITLIN SMITH",
    relatesToIcon: "person",
    homeOrSchool: "The Homeland",
    taskDate: "09/02/2026 12:00:00 AM",
    status: "deleted",
    originallyRecordedAt: "09/02/2026 11:30:00 PM",
    originallyRecordedBy: "Masud",
  },
]

// Task Explorer — Form Submission Chart Data
export interface FormSubmissionData {
  name: string
  count: number
  color: string
}

export const mockFormSubmissions: FormSubmissionData[] = [
  { name: "Petty Cash", count: 1, color: "#00BFFF" },
  { name: "Daily Handover", count: 2, color: "#9E9E9E" },
  { name: "Daily Summary", count: 2, color: "#FF3B30" },
  { name: "Absence Form", count: 1, color: "#FF9500" },
  { name: "Professional Contact", count: 1, color: "#4CD964" },
  { name: "Medication Dispensed", count: 1, color: "#34C759" },
  { name: "Fridge/Freezer Temps", count: 1, color: "#FFCC00" },
  { name: "Daily Window Restrictor checks", count: 1, color: "#FF6B6B" },
  { name: "Daily AM sharps check", count: 2, color: "#FF2D55" },
  { name: "Daily Cleaning Schedule", count: 2, color: "#FF9500" },
  { name: "Waking Night Summary", count: 1, color: "#AF52DE" },
  { name: "Daily Ligature Check", count: 1, color: "#5856D6" },
]

// ─── Home Settings Mock Data ─────────────────────────────────────────────────

export const mockHomeSettings: HomeSettingItem[] = [
  // Reg Report Types
  { id: 5, name: "Annex A - 2024-25", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "08/02/2024 10:19:05 AM", updatedOn: "08/02/2024 12:38:40 PM", updatedBy: "Zikel Admin", category: "reg-report-types", sortOrder: 1 },
  { id: 2, name: "Reg 44", systemGenerated: true, hidden: false, createdBy: "", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "08/02/2024 12:38:40 PM", updatedBy: "", category: "reg-report-types", sortOrder: 2 },
  { id: 3, name: "Reg 45", systemGenerated: true, hidden: false, createdBy: "", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "08/02/2024 12:38:40 PM", updatedBy: "", category: "reg-report-types", sortOrder: 3 },
  { id: 6, name: "Annex A for Supported Accommodation", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "12/05/2025 9:00:41 AM", updatedOn: "12/05/2025 9:00:41 AM", updatedBy: "Zikel Admin", category: "reg-report-types", sortOrder: 4 },
  { id: 7, name: "Annex A - 2025-26", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "13/05/2025 9:23:05 AM", updatedOn: "13/05/2025 9:23:05 AM", updatedBy: "Zikel Admin", category: "reg-report-types", sortOrder: 5 },
  { id: 8, name: "Annex A for Secure Children's Homes - 2025-26", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "27/11/2025 12:16:18 AM", updatedOn: "27/11/2025 12:16:18 AM", updatedBy: "Zikel Admin", category: "reg-report-types", sortOrder: 6 },
  // Medication Stock Types
  { id: 10, name: "Tablet", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", updatedOn: "15/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "medication-stock-types", sortOrder: 1 },
  { id: 11, name: "Capsule", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", updatedOn: "15/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "medication-stock-types", sortOrder: 2 },
  { id: 12, name: "Liquid", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", updatedOn: "15/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "medication-stock-types", sortOrder: 3 },
  { id: 13, name: "Inhaler", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "20/06/2024 2:30:00 PM", updatedOn: "20/06/2024 2:30:00 PM", updatedBy: "thrservicesadmin", category: "medication-stock-types", sortOrder: 4 },
  // Medication Stock Categories
  { id: 20, name: "Controlled Drug", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", updatedOn: "15/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "medication-stock-categories", sortOrder: 1 },
  { id: 21, name: "Over The Counter", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", updatedOn: "15/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "medication-stock-categories", sortOrder: 2 },
  { id: 22, name: "Prescription Only", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", updatedOn: "15/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "medication-stock-categories", sortOrder: 3 },
  { id: 23, name: "Homely Remedy", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "01/07/2024 9:15:00 AM", updatedOn: "01/07/2024 9:15:00 AM", updatedBy: "thrservicesadmin", category: "medication-stock-categories", sortOrder: 4 },
  // Shift Types
  { id: 30, name: "Day Shift", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "22/12/2021 9:57:16 AM", updatedBy: "Zikel Admin", category: "shift-types", sortOrder: 1 },
  { id: 31, name: "Night Shift", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "22/12/2021 9:57:16 AM", updatedBy: "Zikel Admin", category: "shift-types", sortOrder: 2 },
  { id: 32, name: "Waking Night", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "22/12/2021 9:57:16 AM", updatedBy: "Zikel Admin", category: "shift-types", sortOrder: 3 },
  { id: 33, name: "Sleep-In", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "10/01/2025 11:00:00 AM", updatedOn: "10/01/2025 11:00:00 AM", updatedBy: "thrservicesadmin", category: "shift-types", sortOrder: 4 },
  // Custom Information Groups
  { id: 40, name: "Medical Information", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "05/02/2025 3:20:00 PM", updatedOn: "05/02/2025 3:20:00 PM", updatedBy: "thrservicesadmin", category: "custom-information-groups", sortOrder: 1 },
  { id: 41, name: "Education Details", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "05/02/2025 3:25:00 PM", updatedOn: "05/02/2025 3:25:00 PM", updatedBy: "thrservicesadmin", category: "custom-information-groups", sortOrder: 2 },
  { id: 42, name: "Contact Preferences", systemGenerated: false, hidden: true, createdBy: "thrservicesadmin", createdAt: "05/02/2025 3:30:00 PM", updatedOn: "10/02/2025 9:00:00 AM", updatedBy: "Sarah Johnson", category: "custom-information-groups", sortOrder: 3 },
  // Custom Information Fields
  { id: 50, name: "GP Name", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "06/02/2025 10:00:00 AM", updatedOn: "06/02/2025 10:00:00 AM", updatedBy: "thrservicesadmin", category: "custom-information-fields", sortOrder: 1 },
  { id: 51, name: "GP Surgery Address", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "06/02/2025 10:05:00 AM", updatedOn: "06/02/2025 10:05:00 AM", updatedBy: "thrservicesadmin", category: "custom-information-fields", sortOrder: 2 },
  { id: 52, name: "NHS Number", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "06/02/2025 10:10:00 AM", updatedOn: "06/02/2025 10:10:00 AM", updatedBy: "thrservicesadmin", category: "custom-information-fields", sortOrder: 3 },
  { id: 53, name: "Allergies", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "06/02/2025 10:15:00 AM", updatedOn: "06/02/2025 10:15:00 AM", updatedBy: "thrservicesadmin", category: "custom-information-fields", sortOrder: 4 },
  // File Categories
  { id: 60, name: "Care Plans", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "22/12/2021 9:57:16 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 1 },
  { id: 61, name: "Incident Reports", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", updatedOn: "22/12/2021 9:57:16 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 2 },
  { id: 62, name: "Staff Documents", systemGenerated: false, hidden: false, createdBy: "thrservicesadmin", createdAt: "15/01/2025 4:00:00 PM", updatedOn: "15/01/2025 4:00:00 PM", updatedBy: "thrservicesadmin", category: "file-categories", sortOrder: 3 },
]

export function getHomeSettingsByCategory(category: HomeSettingCategory): HomeSettingItem[] {
  return mockHomeSettings.filter((s) => s.category === category)
}

// ─── Home Audit Mock Data ────────────────────────────────────────────────────

export const mockHomeAudits: HomeAuditEntry[] = [
  // Homes
  { id: 1, event: "Update", createdBy: "Kwadwo Opoku-Adomako", createdAt: "08/01/2026 4:34:46 PM", category: "homes", before: [{ field: "ID", value: "1" }, { field: "Email", value: "" }, { field: "Phone", value: "" }, { field: "Latitude", value: "" }, { field: "Postcode", value: "NN5 5US" }, { field: "Longitude", value: "" }], after: [{ field: "ID", value: "1" }, { field: "Email", value: "Kwadwo.Opoku-Adomako@thresidentialservice.co.uk" }, { field: "Phone", value: "7483103245" }, { field: "Latitude", value: "52.2412199" }, { field: "Postcode", value: "NN5 5ES" }, { field: "Longitude", value: "-0.9129055" }] },
  { id: 2, event: "Create", createdBy: "Zikel Admin", createdAt: "18/11/2025 11:23:22 AM", category: "homes", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "The Homeland" }, { field: "Status", value: "Current" }, { field: "Category", value: "Children's Home" }] },
  { id: 3, event: "Update", createdBy: "Kwadwo Opoku-Adomako", createdAt: "08/01/2026 4:34:46 PM", category: "homes", before: [{ field: "Updated By", value: "" }], after: [{ field: "Updated By", value: "5" }] },
  { id: 4, event: "Create", createdBy: "Zikel Admin", createdAt: "18/11/2025 11:23:22 AM", category: "homes", before: [], after: [{ field: "ID", value: "2" }, { field: "Name", value: "Oakwood House" }, { field: "Status", value: "Current" }] },
  // Medication Locations
  { id: 10, event: "Create", createdBy: "thrservicesadmin", createdAt: "20/01/2026 9:00:00 AM", category: "medication-locations", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "Kitchen Cabinet" }, { field: "Home", value: "The Homeland" }] },
  { id: 11, event: "Update", createdBy: "Penn", createdAt: "05/02/2026 2:15:00 PM", category: "medication-locations", before: [{ field: "Name", value: "Kitchen Cabinet" }], after: [{ field: "Name", value: "Kitchen Locked Cabinet" }] },
  // Medication Stocks
  { id: 20, event: "Create", createdBy: "Penn", createdAt: "09/02/2026 8:50:00 PM", category: "medication-stocks", before: [], after: [{ field: "ID", value: "1" }, { field: "Medication", value: "Paracetamol 500mg" }, { field: "Quantity", value: "28" }, { field: "Type", value: "Tablet" }] },
  { id: 21, event: "Update", createdBy: "Penn", createdAt: "10/02/2026 7:30:00 AM", category: "medication-stocks", before: [{ field: "Quantity", value: "28" }], after: [{ field: "Quantity", value: "26" }] },
  // Medication Stock Audits
  { id: 30, event: "Create", createdBy: "Penn", createdAt: "10/02/2026 7:30:00 AM", category: "medication-stock-audits", before: [], after: [{ field: "Stock", value: "Paracetamol 500mg" }, { field: "Action", value: "Dispensed" }, { field: "Quantity Change", value: "-2" }] },
  { id: 31, event: "Create", createdBy: "Masud", createdAt: "10/02/2026 10:00:00 PM", category: "medication-stock-audits", before: [], after: [{ field: "Stock", value: "Ibuprofen 200mg" }, { field: "Action", value: "Received" }, { field: "Quantity Change", value: "+30" }] },
  // Medication Stock Types
  { id: 40, event: "Create", createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", category: "medication-stock-types", before: [], after: [{ field: "ID", value: "10" }, { field: "Name", value: "Tablet" }, { field: "System Generated", value: "Yes" }] },
  { id: 41, event: "Create", createdBy: "thrservicesadmin", createdAt: "20/06/2024 2:30:00 PM", category: "medication-stock-types", before: [], after: [{ field: "ID", value: "13" }, { field: "Name", value: "Inhaler" }, { field: "System Generated", value: "No" }] },
  // Medication Stock Categories
  { id: 50, event: "Create", createdBy: "Zikel Admin", createdAt: "15/03/2024 10:00:00 AM", category: "medication-stock-categories", before: [], after: [{ field: "ID", value: "20" }, { field: "Name", value: "Controlled Drug" }] },
  { id: 51, event: "Create", createdBy: "thrservicesadmin", createdAt: "01/07/2024 9:15:00 AM", category: "medication-stock-categories", before: [], after: [{ field: "ID", value: "23" }, { field: "Name", value: "Homely Remedy" }] },
  // Regulatory Reports
  { id: 60, event: "Create", createdBy: "Zikel Admin", createdAt: "08/02/2024 10:19:05 AM", category: "regulatory-reports", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "Annex A - 2024-25" }, { field: "Type", value: "Reg Report" }] },
  { id: 61, event: "Update", createdBy: "Zikel Admin", createdAt: "08/02/2024 12:38:40 PM", category: "regulatory-reports", before: [{ field: "Status", value: "Draft" }], after: [{ field: "Status", value: "Published" }] },
  // Regulatory Report Types
  { id: 70, event: "Create", createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", category: "regulatory-report-types", before: [], after: [{ field: "ID", value: "2" }, { field: "Name", value: "Reg 44" }] },
  { id: 71, event: "Create", createdBy: "Zikel Admin", createdAt: "22/12/2021 9:57:16 AM", category: "regulatory-report-types", before: [], after: [{ field: "ID", value: "3" }, { field: "Name", value: "Reg 45" }] },
  // Regulatory Report Type Sections
  { id: 80, event: "Create", createdBy: "Zikel Admin", createdAt: "08/02/2024 10:20:00 AM", category: "regulatory-report-type-sections", before: [], after: [{ field: "ID", value: "1" }, { field: "Section", value: "Section A - Basic Details" }, { field: "Report Type", value: "Annex A" }] },
  { id: 81, event: "Update", createdBy: "Zikel Admin", createdAt: "08/02/2024 12:39:00 PM", category: "regulatory-report-type-sections", before: [{ field: "Order", value: "1" }], after: [{ field: "Order", value: "2" }] },
  // Regulatory Report Type Sections 2
  { id: 90, event: "Create", createdBy: "Zikel Admin", createdAt: "13/05/2025 9:25:00 AM", category: "regulatory-report-type-sections-2", before: [], after: [{ field: "ID", value: "10" }, { field: "Section", value: "Part 1 - Registration" }, { field: "Report Type", value: "Annex A - 2025-26" }] },
  { id: 91, event: "Create", createdBy: "Zikel Admin", createdAt: "13/05/2025 9:26:00 AM", category: "regulatory-report-type-sections-2", before: [], after: [{ field: "ID", value: "11" }, { field: "Section", value: "Part 2 - Staffing" }] },
  // Regulatory Report Values
  { id: 100, event: "Update", createdBy: "thrservicesadmin", createdAt: "01/02/2026 3:00:00 PM", category: "regulatory-report-values", before: [{ field: "Value", value: "" }], after: [{ field: "Value", value: "4" }, { field: "Field", value: "Number of Beds" }] },
  { id: 101, event: "Update", createdBy: "thrservicesadmin", createdAt: "01/02/2026 3:05:00 PM", category: "regulatory-report-values", before: [{ field: "Value", value: "Pending" }], after: [{ field: "Value", value: "Complete" }, { field: "Field", value: "Section Status" }] },
]

export function getHomeAuditsByCategory(category: HomeAuditCategory): HomeAuditEntry[] {
  return mockHomeAudits.filter((a) => a.category === category)
}

// ─── Young People Rewards ─────────────────────────────────────────────────

export const mockYPRewards: YoungPersonReward[] = [
  { id: 1, youngPersonName: "James Wilson", rewardType: "Good Behaviour", points: 10, awardedBy: "Sarah Johnson", awardedAt: "10/01/2026 2:30:00 PM", status: "awarded" },
  { id: 2, youngPersonName: "Emily Brown", rewardType: "Helping Others", points: 15, awardedBy: "Mark Thompson", awardedAt: "09/01/2026 10:00:00 AM", status: "awarded" },
  { id: 3, youngPersonName: "Oliver Davis", rewardType: "Academic Achievement", points: 20, awardedBy: "Emma White", awardedAt: "08/01/2026 3:45:00 PM", status: "redeemed" },
  { id: 4, youngPersonName: "Sophie Taylor", rewardType: "Room Tidy", points: 5, awardedBy: "Sarah Johnson", awardedAt: "07/01/2026 11:20:00 AM", status: "awarded" },
  { id: 5, youngPersonName: "James Wilson", rewardType: "Cooking Help", points: 10, awardedBy: "Mark Thompson", awardedAt: "06/01/2026 4:00:00 PM", status: "redeemed" },
  { id: 6, youngPersonName: "Amelia Harris", rewardType: "Good Behaviour", points: 10, awardedBy: "Emma White", awardedAt: "05/01/2026 9:15:00 AM", status: "awarded" },
  { id: 7, youngPersonName: "Emily Brown", rewardType: "Academic Achievement", points: 20, awardedBy: "Mark Thompson", awardedAt: "04/01/2026 1:30:00 PM", status: "expired" },
  { id: 8, youngPersonName: "Oliver Davis", rewardType: "Sports Achievement", points: 15, awardedBy: "Emma White", awardedAt: "03/01/2026 2:00:00 PM", status: "awarded" },
  { id: 9, youngPersonName: "Sophie Taylor", rewardType: "Helping Others", points: 15, awardedBy: "Sarah Johnson", awardedAt: "02/01/2026 10:45:00 AM", status: "awarded" },
  { id: 10, youngPersonName: "Daniel Moore", rewardType: "Good Behaviour", points: 10, awardedBy: "James Clark", awardedAt: "15/12/2025 3:00:00 PM", status: "redeemed" },
]

// ─── Young People Settings ────────────────────────────────────────────────

export const mockYPSettings: YPSettingItem[] = [
  // Reward Types
  { id: 1, name: "Good Behaviour", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "reward-types", sortOrder: 1 },
  { id: 2, name: "Helping Others", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "reward-types", sortOrder: 2 },
  { id: 3, name: "Academic Achievement", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 10:30:00 AM", updatedOn: "15/03/2024 10:30:00 AM", updatedBy: "Zikel Admin", category: "reward-types", sortOrder: 3 },
  { id: 4, name: "Room Tidy", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "20/04/2024 2:00:00 PM", updatedOn: "20/04/2024 2:00:00 PM", updatedBy: "Zikel Admin", category: "reward-types", sortOrder: 4 },
  { id: 5, name: "Cooking Help", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "01/05/2024 11:00:00 AM", updatedOn: "01/05/2024 11:00:00 AM", updatedBy: "Zikel Admin", category: "reward-types", sortOrder: 5 },
  { id: 6, name: "Sports Achievement", systemGenerated: false, hidden: true, createdBy: "Zikel Admin", createdAt: "10/06/2024 3:00:00 PM", updatedOn: "10/06/2024 3:00:00 PM", updatedBy: "Zikel Admin", category: "reward-types", sortOrder: 6 },
  // Behaviour Categories
  { id: 10, name: "Positive Behaviour", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "behaviour-categories", sortOrder: 1 },
  { id: 11, name: "Negative Behaviour", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "behaviour-categories", sortOrder: 2 },
  { id: 12, name: "Self-Harm", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "behaviour-categories", sortOrder: 3 },
  { id: 13, name: "Absconding", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "12/02/2024 10:00:00 AM", updatedOn: "12/02/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "behaviour-categories", sortOrder: 4 },
  // Outcome Star Factors
  { id: 20, name: "Accommodation", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "outcome-star-factors", sortOrder: 1 },
  { id: 21, name: "People and Support", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "outcome-star-factors", sortOrder: 2 },
  { id: 22, name: "Education and Work", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "outcome-star-factors", sortOrder: 3 },
  { id: 23, name: "Health and Wellbeing", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "outcome-star-factors", sortOrder: 4 },
  // Key Worker Types
  { id: 30, name: "Primary Key Worker", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "key-worker-types", sortOrder: 1 },
  { id: 31, name: "Secondary Key Worker", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "key-worker-types", sortOrder: 2 },
  { id: 32, name: "Relief Key Worker", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 11:00:00 AM", updatedOn: "15/03/2024 11:00:00 AM", updatedBy: "Zikel Admin", category: "key-worker-types", sortOrder: 3 },
  // Placement Types
  { id: 40, name: "Residential", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "placement-types", sortOrder: 1 },
  { id: 41, name: "Semi-Independent", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "placement-types", sortOrder: 2 },
  { id: 42, name: "Emergency", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "20/02/2024 2:30:00 PM", updatedOn: "20/02/2024 2:30:00 PM", updatedBy: "Zikel Admin", category: "placement-types", sortOrder: 3 },
  { id: 43, name: "Respite", systemGenerated: false, hidden: true, createdBy: "Zikel Admin", createdAt: "01/04/2024 10:00:00 AM", updatedOn: "01/04/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "placement-types", sortOrder: 4 },
  // File Categories
  { id: 50, name: "Care Plans", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 1 },
  { id: 51, name: "Risk Assessments", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 2 },
  { id: 52, name: "Medical Records", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "10/02/2024 10:00:00 AM", updatedOn: "10/02/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 3 },
  { id: 53, name: "Education Records", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/03/2024 11:00:00 AM", updatedOn: "15/03/2024 11:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 4 },
]

export function getYPSettingsByCategory(category: YPSettingCategory): YPSettingItem[] {
  return mockYPSettings.filter((s) => s.category === category)
}

// ─── Young People Audits ──────────────────────────────────────────────────

export const mockYPAudits: YPAuditEntry[] = [
  // Young People
  { id: 1, event: "Create", createdBy: "Zikel Admin", createdAt: "01/06/2023 9:00:00 AM", category: "young-people", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "James Wilson" }, { field: "Home", value: "The Homeland" }, { field: "Status", value: "Current" }] },
  { id: 2, event: "Update", createdBy: "Zikel Admin", createdAt: "15/04/2023 10:30:00 AM", category: "young-people", before: [{ field: "Key Worker", value: "Mark Thompson" }], after: [{ field: "Key Worker", value: "Sarah Johnson" }] },
  { id: 3, event: "Create", createdBy: "Zikel Admin", createdAt: "15/04/2023 9:00:00 AM", category: "young-people", before: [], after: [{ field: "ID", value: "2" }, { field: "Name", value: "Emily Brown" }, { field: "Home", value: "The Homeland" }] },
  // Placements
  { id: 10, event: "Create", createdBy: "Zikel Admin", createdAt: "01/06/2023 9:05:00 AM", category: "placements", before: [], after: [{ field: "Young Person", value: "James Wilson" }, { field: "Home", value: "The Homeland" }, { field: "Type", value: "Residential" }, { field: "Start Date", value: "01/06/2023" }] },
  { id: 11, event: "Update", createdBy: "Zikel Admin", createdAt: "05/03/2025 2:00:00 PM", category: "placements", before: [{ field: "Status", value: "Current" }], after: [{ field: "Status", value: "Past" }, { field: "End Date", value: "05/03/2025" }] },
  // Rewards
  { id: 20, event: "Create", createdBy: "Sarah Johnson", createdAt: "10/01/2026 2:30:00 PM", category: "rewards", before: [], after: [{ field: "Young Person", value: "James Wilson" }, { field: "Type", value: "Good Behaviour" }, { field: "Points", value: "10" }] },
  { id: 21, event: "Update", createdBy: "Emma White", createdAt: "08/01/2026 4:00:00 PM", category: "rewards", before: [{ field: "Status", value: "Awarded" }], after: [{ field: "Status", value: "Redeemed" }] },
  // Behaviours
  { id: 30, event: "Create", createdBy: "Mark Thompson", createdAt: "12/01/2026 11:00:00 AM", category: "behaviours", before: [], after: [{ field: "Young Person", value: "Emily Brown" }, { field: "Category", value: "Positive Behaviour" }, { field: "Description", value: "Helped with dinner preparation" }] },
  { id: 31, event: "Create", createdBy: "Emma White", createdAt: "11/01/2026 3:30:00 PM", category: "behaviours", before: [], after: [{ field: "Young Person", value: "Oliver Davis" }, { field: "Category", value: "Negative Behaviour" }, { field: "Description", value: "Refused to attend school" }] },
  // Outcome Stars
  { id: 40, event: "Create", createdBy: "Sarah Johnson", createdAt: "01/01/2026 10:00:00 AM", category: "outcome-stars", before: [], after: [{ field: "Young Person", value: "James Wilson" }, { field: "Score", value: "7.5" }, { field: "Status", value: "Completed" }] },
  { id: 41, event: "Update", createdBy: "Emma White", createdAt: "05/01/2026 2:00:00 PM", category: "outcome-stars", before: [{ field: "Score", value: "6.0" }], after: [{ field: "Score", value: "7.2" }] },
  // Key Sessions
  { id: 50, event: "Create", createdBy: "Sarah Johnson", createdAt: "14/01/2026 4:00:00 PM", category: "key-sessions", before: [], after: [{ field: "Young Person", value: "James Wilson" }, { field: "Topic", value: "Weekly Review" }, { field: "Duration", value: "45 mins" }] },
  { id: 51, event: "Create", createdBy: "Mark Thompson", createdAt: "13/01/2026 3:00:00 PM", category: "key-sessions", before: [], after: [{ field: "Young Person", value: "Emily Brown" }, { field: "Topic", value: "Education Goals" }, { field: "Duration", value: "30 mins" }] },
  // Incidents
  { id: 60, event: "Create", createdBy: "Emma White", createdAt: "09/01/2026 8:00:00 PM", category: "incidents", before: [], after: [{ field: "Young Person", value: "Oliver Davis" }, { field: "Type", value: "Missing from Home" }, { field: "Severity", value: "Medium" }] },
  { id: 61, event: "Update", createdBy: "Emma White", createdAt: "09/01/2026 10:00:00 PM", category: "incidents", before: [{ field: "Status", value: "Open" }], after: [{ field: "Status", value: "Resolved" }, { field: "Resolution", value: "Returned safely" }] },
  // File Uploads
  { id: 70, event: "Create", createdBy: "Zikel Admin", createdAt: "07/01/2026 9:00:00 AM", category: "file-uploads", before: [], after: [{ field: "File", value: "care-plan-james-wilson.pdf" }, { field: "Category", value: "Care Plans" }, { field: "Young Person", value: "James Wilson" }] },
  { id: 71, event: "Delete", createdBy: "Zikel Admin", createdAt: "06/01/2026 2:30:00 PM", category: "file-uploads", before: [{ field: "File", value: "old-risk-assessment.pdf" }, { field: "Category", value: "Risk Assessments" }], after: [] },
]

export function getYPAuditsByCategory(category: YPAuditCategory): YPAuditEntry[] {
  return mockYPAudits.filter((a) => a.category === category)
}

// ─── Outcome Stars ────────────────────────────────────────────────────────

export const mockOutcomeStars: OutcomeStarEntry[] = [
  { id: 1, youngPersonName: "James Wilson", completedBy: "Sarah Johnson", completedAt: "01/01/2026 10:00:00 AM", score: 7.5, status: "completed" },
  { id: 2, youngPersonName: "Emily Brown", completedBy: "Mark Thompson", completedAt: "28/12/2025 2:30:00 PM", score: 6.8, status: "completed" },
  { id: 3, youngPersonName: "Oliver Davis", completedBy: "Emma White", completedAt: "05/01/2026 2:00:00 PM", score: 7.2, status: "completed" },
  { id: 4, youngPersonName: "Sophie Taylor", completedBy: "Sarah Johnson", completedAt: "10/01/2026 11:00:00 AM", score: 8.1, status: "completed" },
  { id: 5, youngPersonName: "Amelia Harris", completedBy: "Emma White", completedAt: "12/01/2026 3:00:00 PM", score: 5.9, status: "in-progress" },
  { id: 6, youngPersonName: "James Wilson", completedBy: "Sarah Johnson", completedAt: "15/01/2026 10:30:00 AM", score: 8.0, status: "pending" },
  { id: 7, youngPersonName: "Emily Brown", completedBy: "Mark Thompson", completedAt: "20/01/2026 1:00:00 PM", score: 7.0, status: "pending" },
  { id: 8, youngPersonName: "Oliver Davis", completedBy: "Emma White", completedAt: "22/01/2026 4:00:00 PM", score: 7.8, status: "completed" },
]

// ─── Employee Settings ────────────────────────────────────────────────────

export const mockEmpSettings: EmpSettingItem[] = [
  // Job Titles
  { id: 1, name: "Registered Manager", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "job-titles", sortOrder: 1 },
  { id: 2, name: "Deputy Manager", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "job-titles", sortOrder: 2 },
  { id: 3, name: "Senior Support Worker", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/01/2024 10:00:00 AM", updatedOn: "15/01/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "job-titles", sortOrder: 3 },
  { id: 4, name: "Support Worker", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/01/2024 10:00:00 AM", updatedOn: "15/01/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "job-titles", sortOrder: 4 },
  { id: 5, name: "Night Support Worker", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "20/01/2024 11:00:00 AM", updatedOn: "20/01/2024 11:00:00 AM", updatedBy: "Zikel Admin", category: "job-titles", sortOrder: 5 },
  { id: 6, name: "Waking Night Staff", systemGenerated: false, hidden: true, createdBy: "Zikel Admin", createdAt: "25/01/2024 2:00:00 PM", updatedOn: "25/01/2024 2:00:00 PM", updatedBy: "Zikel Admin", category: "job-titles", sortOrder: 6 },
  // Reference Ratings
  { id: 10, name: "Excellent", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "reference-ratings", sortOrder: 1 },
  { id: 11, name: "Good", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "reference-ratings", sortOrder: 2 },
  { id: 12, name: "Satisfactory", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "reference-ratings", sortOrder: 3 },
  { id: 13, name: "Poor", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "reference-ratings", sortOrder: 4 },
  // Qualification Types
  { id: 20, name: "NVQ Level 3", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "qualification-types", sortOrder: 1 },
  { id: 21, name: "NVQ Level 4", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "qualification-types", sortOrder: 2 },
  { id: 22, name: "First Aid", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "10/02/2024 10:00:00 AM", updatedOn: "10/02/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "qualification-types", sortOrder: 3 },
  // Qualification Issuing Bodies
  { id: 30, name: "City & Guilds", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "qualification-issuing-bodies", sortOrder: 1 },
  { id: 31, name: "Pearson Edexcel", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "qualification-issuing-bodies", sortOrder: 2 },
  // Evidence Types
  { id: 40, name: "Certificate", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "evidence-types", sortOrder: 1 },
  { id: 41, name: "Reference Letter", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "evidence-types", sortOrder: 2 },
  { id: 42, name: "DBS Check", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/02/2024 3:00:00 PM", updatedOn: "15/02/2024 3:00:00 PM", updatedBy: "Zikel Admin", category: "evidence-types", sortOrder: 3 },
  // Contract Types
  { id: 50, name: "Full-Time", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "contract-types", sortOrder: 1 },
  { id: 51, name: "Part-Time", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "contract-types", sortOrder: 2 },
  { id: 52, name: "Zero Hours", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "01/03/2024 10:00:00 AM", updatedOn: "01/03/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "contract-types", sortOrder: 3 },
  // Contract Events
  { id: 60, name: "Contract Start", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "contract-events", sortOrder: 1 },
  { id: 61, name: "Contract Renewal", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "contract-events", sortOrder: 2 },
  { id: 62, name: "Contract End", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "contract-events", sortOrder: 3 },
  // File Categories
  { id: 70, name: "Employment Contracts", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 1 },
  { id: 71, name: "DBS Certificates", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 2 },
  { id: 72, name: "Training Records", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "20/02/2024 11:00:00 AM", updatedOn: "20/02/2024 11:00:00 AM", updatedBy: "Zikel Admin", category: "file-categories", sortOrder: 3 },
  // Leave Types
  { id: 80, name: "Annual Leave", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "leave-types", sortOrder: 1 },
  { id: 81, name: "Sick Leave", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "leave-types", sortOrder: 2 },
  { id: 82, name: "Maternity Leave", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "leave-types", sortOrder: 3 },
  // Leave Statuses
  { id: 90, name: "Pending", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "leave-statuses", sortOrder: 1 },
  { id: 91, name: "Approved", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "leave-statuses", sortOrder: 2 },
  { id: 92, name: "Rejected", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "leave-statuses", sortOrder: 3 },
  // Genders
  { id: 100, name: "Male", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "genders", sortOrder: 1 },
  { id: 101, name: "Female", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "genders", sortOrder: 2 },
  { id: 102, name: "Non-Binary", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "10/03/2024 2:00:00 PM", updatedOn: "10/03/2024 2:00:00 PM", updatedBy: "Zikel Admin", category: "genders", sortOrder: 3 },
  // Employment Types
  { id: 110, name: "Permanent", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "employment-types", sortOrder: 1 },
  { id: 111, name: "Temporary", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "employment-types", sortOrder: 2 },
  { id: 112, name: "Agency", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "15/02/2024 10:00:00 AM", updatedOn: "15/02/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "employment-types", sortOrder: 3 },
  // Custom Personal Group
  { id: 120, name: "Emergency Contact", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "custom-personal-group", sortOrder: 1 },
  { id: 121, name: "Next of Kin", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "custom-personal-group", sortOrder: 2 },
  // Custom Personal Fields
  { id: 130, name: "National Insurance Number", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "custom-personal-fields", sortOrder: 1 },
  { id: 131, name: "Driving Licence", systemGenerated: false, hidden: false, createdBy: "Zikel Admin", createdAt: "01/02/2024 10:00:00 AM", updatedOn: "01/02/2024 10:00:00 AM", updatedBy: "Zikel Admin", category: "custom-personal-fields", sortOrder: 2 },
  // Annual Leave Flexibility Types
  { id: 140, name: "Standard", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "annual-leave-flexibility-types", sortOrder: 1 },
  { id: 141, name: "Flexible", systemGenerated: true, hidden: false, createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", updatedOn: "01/01/2024 9:00:00 AM", updatedBy: "Zikel Admin", category: "annual-leave-flexibility-types", sortOrder: 2 },
]

export function getEmpSettingsByCategory(category: EmpSettingCategory): EmpSettingItem[] {
  return mockEmpSettings.filter((s) => s.category === category)
}

// ─── Employee Audits ──────────────────────────────────────────────────────

export const mockEmpAudits: EmpAuditEntry[] = [
  // Employees
  { id: 1, event: "Create", createdBy: "Kwadwo Opoku-Adomako", createdAt: "11/01/2026 9:23:54 PM", category: "employees", before: [], after: [{ field: "ID", value: "16" }, { field: "User ID", value: "-" }, { field: "Gender ID", value: "2" }, { field: "NI Number", value: "-" }, { field: "Created At", value: "11/01/2026 9:23:54 PM" }] },
  { id: 2, event: "Update", createdBy: "Zikel Admin", createdAt: "12/01/2026 10:00:00 AM", category: "employees", before: [{ field: "Job Title", value: "Support Worker" }], after: [{ field: "Job Title", value: "Senior Support Worker" }] },
  { id: 3, event: "Create", createdBy: "Zikel Admin", createdAt: "10/01/2024 9:00:00 AM", category: "employees", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "Sarah Johnson" }, { field: "Job Title", value: "Registered Manager" }, { field: "Home", value: "The Homeland" }] },
  // Genders
  { id: 10, event: "Create", createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", category: "genders", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "Male" }] },
  { id: 11, event: "Create", createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", category: "genders", before: [], after: [{ field: "ID", value: "2" }, { field: "Name", value: "Female" }] },
  { id: 12, event: "Create", createdBy: "Zikel Admin", createdAt: "10/03/2024 2:00:00 PM", category: "genders", before: [], after: [{ field: "ID", value: "3" }, { field: "Name", value: "Non-Binary" }] },
  // Employment Types
  { id: 20, event: "Create", createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", category: "employment-types", before: [], after: [{ field: "ID", value: "1" }, { field: "Name", value: "Permanent" }] },
  { id: 21, event: "Create", createdBy: "Zikel Admin", createdAt: "01/01/2024 9:00:00 AM", category: "employment-types", before: [], after: [{ field: "ID", value: "2" }, { field: "Name", value: "Temporary" }] },
  { id: 22, event: "Create", createdBy: "Zikel Admin", createdAt: "15/02/2024 10:00:00 AM", category: "employment-types", before: [], after: [{ field: "ID", value: "3" }, { field: "Name", value: "Agency" }] },
]

export function getEmpAuditsByCategory(category: EmpAuditCategory): EmpAuditEntry[] {
  return mockEmpAudits.filter((a) => a.category === category)
}

// Helper function to get young person by ID
export function getYoungPersonById(id: number): YoungPerson | undefined {
  return mockYoungPeople.find((yp) => yp.id === id)
}

// Helper function to get employee by ID
export function getEmployeeById(id: number): Employee | undefined {
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
