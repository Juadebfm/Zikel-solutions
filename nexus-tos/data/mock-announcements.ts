export interface Announcement {
  id: number
  title: string
  description: string
  images: string[]
  startsAt: string
  endsAt: string
  status: "read" | "unread"
}

export const mockAnnouncements: Announcement[] = [
  {
    id: 11,
    title: "2026-01-21 February Workshops",
    description:
      "Join us for our Monthly Workshops this February 2026! We have three exciting sessions lined up:\n\n" +
      "**Administrator Training** — 6th February 2026, 10:00 - 15:00\n" +
      "A Guide For Admin Users. Discover key functionalities, get an insight into how to set up the key functionalities, and find out more about AI rotas and the kids app.\n\n" +
      "**End User Training** — 9th February 2026, 11:30 - 14:00\n" +
      "How To Use Clearcare. Find out how to navigate and run reports, discover more about daily logs and other new features, and find out how to complete tasks effectively in your daily routines.\n\n" +
      "**Administrator Training** — 11th February 2026, 10:00 - 12:45\n" +
      "How To Build Forms. Find out how to hide or edit forms, discover how to build forms from scratch, and find out how to set up triggers and procedures.\n\n" +
      "Please note: To benefit from these workshops, please only attend if they are relevant to your job role.",
    images: ["/announcements/feb-workshops.png"],
    startsAt: "20/01/2026 4:10:10 PM",
    endsAt: "26/01/2026 12:00:00 AM",
    status: "read",
  },
  {
    id: 10,
    title: "System Maintenance Scheduled",
    description:
      "Please be advised that the system will undergo scheduled maintenance on **15th February 2026** between 02:00 and 06:00 GMT.\n\n" +
      "During this time, the platform may be intermittently unavailable. Please ensure all critical tasks are completed before the maintenance window.\n\n" +
      "If you experience any issues after the maintenance period, please contact the IT helpdesk immediately.",
    images: [],
    startsAt: "01/02/2026 9:00:00 AM",
    endsAt: "15/02/2026 6:00:00 AM",
    status: "unread",
  },
  {
    id: 9,
    title: "New Safeguarding Policy Update",
    description:
      "Important: The safeguarding policy has been updated as of January 2026. All staff members are required to read and acknowledge the updated policy within 14 days.\n\n" +
      "Key changes include:\n" +
      "- Updated reporting procedures for incidents\n" +
      "- New guidance on online safety for young people\n" +
      "- Revised training requirements for all staff\n\n" +
      "You can access the full policy document in the Forms & Procedures section. Please ensure you complete the acknowledgement form after reading.",
    images: ["/announcements/safeguarding-update.png"],
    startsAt: "15/01/2026 10:00:00 AM",
    endsAt: "31/01/2026 11:59:00 PM",
    status: "read",
  },
  {
    id: 8,
    title: "Staff Appreciation Week 2026",
    description:
      "We are delighted to announce that **Staff Appreciation Week** will be held from 24th to 28th February 2026!\n\n" +
      "Throughout the week we will be recognising the amazing contributions of our care teams across all homes. Activities include:\n" +
      "- Monday: Thank-you breakfast at each home\n" +
      "- Wednesday: Team awards ceremony (virtual)\n" +
      "- Friday: Early finish and team social\n\n" +
      "Managers: please nominate outstanding team members by 20th February using the nominations form.",
    images: ["/announcements/staff-appreciation.png"],
    startsAt: "05/02/2026 8:00:00 AM",
    endsAt: "28/02/2026 6:00:00 PM",
    status: "unread",
  },
  {
    id: 7,
    title: "CQC Inspection Preparation Guidance",
    description:
      "As part of our ongoing commitment to quality, please review the attached CQC Inspection Preparation guide.\n\n" +
      "All home managers should ensure:\n" +
      "- Care plans are up to date for all residents\n" +
      "- Medication records are accurate and signed off\n" +
      "- Staff training records are current\n" +
      "- Health and safety checks are documented\n\n" +
      "Regional managers will conduct pre-inspection audits starting 10th February. Please have all documentation ready.",
    images: [],
    startsAt: "01/02/2026 7:00:00 AM",
    endsAt: "28/02/2026 11:59:00 PM",
    status: "unread",
  },
  {
    id: 6,
    title: "New Mobile App Release v3.2",
    description:
      "We are pleased to announce the release of the Zikel Solutions Mobile App v3.2!\n\n" +
      "New features include:\n" +
      "- Offline mode for daily logs\n" +
      "- Push notifications for task reminders\n" +
      "- Improved photo upload for incident reports\n" +
      "- Bug fixes and performance improvements\n\n" +
      "Please update your app from the App Store or Google Play. If you encounter any issues, contact IT support.",
    images: ["/announcements/mobile-app-v32.png"],
    startsAt: "10/01/2026 12:00:00 PM",
    endsAt: "10/02/2026 12:00:00 PM",
    status: "read",
  },
  {
    id: 5,
    title: "Annual Leave Booking Reminder",
    description:
      "This is a reminder that all annual leave requests for Q2 2026 (April — June) must be submitted by **28th February 2026**.\n\n" +
      "Please use the Rotas section to submit your requests. Managers will review and approve requests on a first-come, first-served basis.\n\n" +
      "Remember: a minimum of 2 staff members must be on shift at all times. Please coordinate with your team before submitting requests.",
    images: [],
    startsAt: "01/02/2026 9:00:00 AM",
    endsAt: "28/02/2026 5:00:00 PM",
    status: "unread",
  },
  {
    id: 4,
    title: "Fire Safety Training — Mandatory",
    description:
      "All staff are required to complete the updated Fire Safety Training module by **14th February 2026**.\n\n" +
      "The training covers:\n" +
      "- Updated evacuation procedures\n" +
      "- Fire extinguisher types and usage\n" +
      "- Emergency assembly points for each home\n" +
      "- Reporting and documentation requirements\n\n" +
      "Access the training through the Documents section. A certificate will be issued upon completion.",
    images: ["/announcements/fire-safety.png"],
    startsAt: "20/01/2026 8:00:00 AM",
    endsAt: "14/02/2026 11:59:00 PM",
    status: "read",
  },
  {
    id: 3,
    title: "Holiday Rota Changes for Easter 2026",
    description:
      "Please note the following changes to rotas during the Easter period (3rd — 6th April 2026):\n\n" +
      "- Enhanced staffing levels on Good Friday and Easter Monday\n" +
      "- Bank holiday pay rates apply for all shifts during this period\n" +
      "- Activity coordinators to plan special Easter events for residents\n\n" +
      "Managers: please finalise Easter rotas by 15th March and submit them for approval.",
    images: [],
    startsAt: "15/02/2026 9:00:00 AM",
    endsAt: "06/04/2026 11:59:00 PM",
    status: "unread",
  },
  {
    id: 2,
    title: "Data Protection Refresher — GDPR Compliance",
    description:
      "As part of our annual compliance requirements, all staff must complete the GDPR Data Protection refresher course by end of February.\n\n" +
      "Topics covered:\n" +
      "- Handling personal data of young people and staff\n" +
      "- Data breach reporting procedures\n" +
      "- Secure communication practices\n" +
      "- Subject access request procedures\n\n" +
      "The course takes approximately 45 minutes. Access it through the Documents section.",
    images: ["/announcements/gdpr-refresher.png"],
    startsAt: "01/02/2026 8:00:00 AM",
    endsAt: "28/02/2026 11:59:00 PM",
    status: "read",
  },
]
