"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ChevronRight,
  Save,
  FileDown,
  FileText,
  FileSpreadsheet,
  Lock,
  Search,
  RefreshCw,
  Columns3,
  Plus,
  ChevronLeft,
  Info,
  Home as HomeIcon,
  User as UserIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getCareGroupById, mockStakeholders, mockCareGroupHomes } from "@/lib/mock-data"
import type { CareGroupType, CareGroupHomeStatus } from "@/types"

type TabKey = "summary" | "contact-details" | "addresses" | "settings" | "stakeholders" | "homes"

const tabs: { key: TabKey; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "contact-details", label: "Contact Details" },
  { key: "addresses", label: "Addresses" },
  { key: "settings", label: "Settings" },
  { key: "stakeholders", label: "Stakeholders" },
  { key: "homes", label: "Homes" },
]

export default function CareGroupDetailPage() {
  const params = useParams()
  const careGroupId = Number(params.id)
  const careGroup = getCareGroupById(careGroupId)

  const [activeTab, setActiveTab] = useState<TabKey>("summary")

  // Form state
  const [name, setName] = useState(careGroup?.name || "")
  const [type, setType] = useState<CareGroupType>(careGroup?.type || "private")
  const [description, setDescription] = useState(careGroup?.description || "")
  const [website, setWebsite] = useState(careGroup?.website || "")
  const [ipRestriction, setIpRestriction] = useState(careGroup?.defaultUserIpRestriction || false)

  // Contact Details
  const [contact, setContact] = useState(careGroup?.contact || "")
  const [phone, setPhone] = useState(careGroup?.phoneNumber || "")
  const [fax, setFax] = useState(careGroup?.faxNumber || "")
  const [email, setEmail] = useState(careGroup?.email || "")

  // Address
  const [addressLine1, setAddressLine1] = useState(careGroup?.addressLine1 || "")
  const [addressLine2, setAddressLine2] = useState(careGroup?.addressLine2 || "")
  const [city, setCity] = useState(careGroup?.city || "")
  const [countryRegion, setCountryRegion] = useState(careGroup?.countryRegion || "")
  const [postcode, setPostcode] = useState(careGroup?.postcode || "")

  const handleSave = () => {
    console.log("Save care group", { name, type, description, website, ipRestriction, contact, phone, fax, email, addressLine1, addressLine2, city, countryRegion, postcode })
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export as ${format}`)
  }

  if (!careGroup) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Care Group Not Found</h1>
          <p className="text-gray-500 mt-1">The requested care group does not exist.</p>
        </div>
        <Link href="/care-groups" className="text-primary hover:underline text-sm font-medium">
          Back To Care Groups
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/care-groups" className="text-primary hover:underline font-medium">
          Care Groups
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-gray-600 font-medium">{careGroup.name}</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{careGroup.name}</h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Export As PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                Export As Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap">
        {tabs.map((tab, index) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              activeTab === tab.key
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${index === 0 ? "rounded-l-lg" : ""} ${index === tabs.length - 1 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content — wrapped in card */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      {activeTab === "summary" && (
        <SummaryTab
          careGroup={careGroup}
          name={name}
          setName={setName}
          type={type}
          setType={setType}
          description={description}
          setDescription={setDescription}
          website={website}
          setWebsite={setWebsite}
          ipRestriction={ipRestriction}
          setIpRestriction={setIpRestriction}
        />
      )}

      {activeTab === "contact-details" && (
        <ContactDetailsTab
          contact={contact}
          setContact={setContact}
          phone={phone}
          setPhone={setPhone}
          fax={fax}
          setFax={setFax}
          email={email}
          setEmail={setEmail}
        />
      )}

      {activeTab === "addresses" && (
        <AddressesTab
          addressLine1={addressLine1}
          setAddressLine1={setAddressLine1}
          addressLine2={addressLine2}
          setAddressLine2={setAddressLine2}
          city={city}
          setCity={setCity}
          countryRegion={countryRegion}
          setCountryRegion={setCountryRegion}
          postcode={postcode}
          setPostcode={setPostcode}
        />
      )}

      {activeTab === "settings" && (
        <SettingsTab careGroup={careGroup} />
      )}

      {activeTab === "stakeholders" && (
        <StakeholdersTab />
      )}

      {activeTab === "homes" && (
        <HomesTab careGroupId={careGroupId} />
      )}
      </div>
    </div>
  )
}

// ─── Summary Tab ─────────────────────────────────────────────────────────────

interface SummaryTabProps {
  careGroup: NonNullable<ReturnType<typeof getCareGroupById>>
  name: string
  setName: (v: string) => void
  type: CareGroupType
  setType: (v: CareGroupType) => void
  description: string
  setDescription: (v: string) => void
  website: string
  setWebsite: (v: string) => void
  ipRestriction: boolean
  setIpRestriction: (v: boolean) => void
}

function SummaryTab({ careGroup, name, setName, type, setType, description, setDescription, website, setWebsite, ipRestriction, setIpRestriction }: SummaryTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
      {/* Left Column */}
      <div className="space-y-6">
        <div>
          <Label className="text-sm text-gray-700">
            <span className="text-red-500">*</span> ID
          </Label>
          <div className="mt-1.5 flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            <Lock className="h-4 w-4" />
            {careGroup.id}
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-700">
            <span className="text-red-500">*</span> Care Group Name
          </Label>
          <Input
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-sm text-gray-700">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as CareGroupType)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="charity">Charity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm text-gray-700">Default User IP Restriction</Label>
          <div className="mt-2 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ipRestriction"
                checked={!ipRestriction}
                onChange={() => setIpRestriction(false)}
                className="accent-primary"
              />
              <span className="text-sm">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ipRestriction"
                checked={ipRestriction}
                onChange={() => setIpRestriction(true)}
                className="accent-primary"
              />
              <span className="text-sm">Yes</span>
            </label>
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-700">Care Group Website</Label>
          <Input
            className="mt-1.5"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div>
          <Label className="text-sm text-gray-700">Description</Label>
          <Textarea
            className="mt-1.5 min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-sm text-gray-700">
            <span className="text-red-500">*</span> Last Updated
          </Label>
          <div className="mt-1.5 flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            <Lock className="h-4 w-4" />
            {careGroup.lastUpdated}
          </div>
        </div>

        <div>
          <Label className="text-sm text-gray-700">
            <span className="text-red-500">*</span> Last Updated By
          </Label>
          <div className="mt-1.5 flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500">
            <Lock className="h-4 w-4" />
            {careGroup.lastUpdatedBy}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Contact Details Tab ─────────────────────────────────────────────────────

interface ContactDetailsTabProps {
  contact: string
  setContact: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  fax: string
  setFax: (v: string) => void
  email: string
  setEmail: (v: string) => void
}

function ContactDetailsTab({ contact, setContact, phone, setPhone, fax, setFax, email, setEmail }: ContactDetailsTabProps) {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> Contact
        </Label>
        <Select value={contact} onValueChange={setContact}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thrservicesadmin">thrservicesadmin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> Phone Number
        </Label>
        <Input
          className="mt-1.5"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">Fax Number</Label>
        <Input
          className="mt-1.5"
          value={fax}
          onChange={(e) => setFax(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> Email Address
        </Label>
        <Input
          className="mt-1.5"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Addresses Tab ───────────────────────────────────────────────────────────

interface AddressesTabProps {
  addressLine1: string
  setAddressLine1: (v: string) => void
  addressLine2: string
  setAddressLine2: (v: string) => void
  city: string
  setCity: (v: string) => void
  countryRegion: string
  setCountryRegion: (v: string) => void
  postcode: string
  setPostcode: (v: string) => void
}

function AddressesTab({ addressLine1, setAddressLine1, addressLine2, setAddressLine2, city, setCity, countryRegion, setCountryRegion, postcode, setPostcode }: AddressesTabProps) {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> Address Line 1
        </Label>
        <Input
          className="mt-1.5"
          value={addressLine1}
          onChange={(e) => setAddressLine1(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">Address Line 2</Label>
        <Input
          className="mt-1.5"
          value={addressLine2}
          onChange={(e) => setAddressLine2(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> City
        </Label>
        <Input
          className="mt-1.5"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> Country/Region
        </Label>
        <Input
          className="mt-1.5"
          value={countryRegion}
          onChange={(e) => setCountryRegion(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">
          <span className="text-red-500">*</span> Postcode
        </Label>
        <Input
          className="mt-1.5"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
        />
      </div>
    </div>
  )
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

interface SettingsTabProps {
  careGroup: NonNullable<ReturnType<typeof getCareGroupById>>
}

function SettingsTab({ careGroup }: SettingsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
      <div>
        <Label className="text-sm text-gray-700">Twilio SID</Label>
        <Input
          className="mt-1.5"
          type="password"
          defaultValue={careGroup.twilioSid || ""}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">Twilio Phone Number</Label>
        <Input
          className="mt-1.5"
          defaultValue={careGroup.twilioPhoneNumber || ""}
        />
      </div>

      <div>
        <Label className="text-sm text-gray-700">Twilio Token</Label>
        <Input
          className="mt-1.5"
          type="password"
          defaultValue={careGroup.twilioToken || ""}
        />
      </div>
    </div>
  )
}

// ─── Stakeholders Tab ────────────────────────────────────────────────────────

type StakeholderColumnKey = "id" | "name" | "position" | "responsibleIndividual" | "startDate" | "endDate"

const stakeholderColumns: { key: StakeholderColumnKey; label: string; filterable: boolean; filterType: "search" | "select" | "date" | "none" }[] = [
  { key: "id", label: "ID", filterable: true, filterType: "search" },
  { key: "name", label: "Name", filterable: true, filterType: "search" },
  { key: "position", label: "Position", filterable: false, filterType: "none" },
  { key: "responsibleIndividual", label: "Responsible Individual", filterable: true, filterType: "select" },
  { key: "startDate", label: "Start Date", filterable: true, filterType: "date" },
  { key: "endDate", label: "End Date", filterable: true, filterType: "date" },
]

function StakeholdersTab() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")
  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(mockStakeholders.length / pageSizeNum))
  const paginated = mockStakeholders.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  const handleAdd = () => {
    console.log("Add stakeholder")
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export stakeholders as ${format}`)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="gap-1.5 text-primary">
            <RefreshCw className="size-3.5" />
            Reset Grid
          </Button>
          <span className="text-gray-300">|</span>
          <p className="text-sm text-gray-500">
            Drag a column header here to group by that column
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" size="sm" className="gap-1.5 text-primary">
              <Columns3 className="size-3.5" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <h4 className="font-medium text-sm mb-3">Columns</h4>
            <div className="space-y-2">
              {stakeholderColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox defaultChecked />
                  <span className="text-sm">{col.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-2">
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
              <FileText className="h-4 w-4" />
              Export As PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="h-4 w-4" />
              Export As Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className="min-w-160">
          <TableHeader>
            <TableRow className="bg-gray-50">
              {stakeholderColumns.map((col) => (
                <TableHead key={col.key} className="font-semibold text-gray-700">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
            {/* Filter row */}
            <TableRow>
              {stakeholderColumns.map((col) => (
                <TableHead key={`filter-${col.key}`} className="py-1">
                  {col.filterType === "search" && (
                    <div className={`relative ${col.key === "id" ? "max-w-24" : ""}`}>
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input placeholder="" className="pl-6 h-6 text-xs border-gray-200" />
                    </div>
                  )}
                  {col.filterType === "select" && (
                    <Select defaultValue="all">
                      <SelectTrigger className="h-6 text-xs border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {col.filterType === "date" && (
                    <Input type="text" placeholder="⇤" className="h-6 text-xs border-gray-200 text-center" />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={stakeholderColumns.length}
                  className="text-center py-10 text-gray-400"
                >
                  No Data
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((s, index) => (
                <TableRow
                  key={s.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                >
                  <TableCell className="text-sm text-gray-700">{s.id}</TableCell>
                  <TableCell className="text-sm text-gray-700">{s.name}</TableCell>
                  <TableCell className="text-sm text-gray-700">{s.position}</TableCell>
                  <TableCell className="text-sm text-gray-700">{s.responsibleIndividual ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-sm text-gray-700">{s.startDate}</TableCell>
                  <TableCell className="text-sm text-gray-700">{s.endDate || ""}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(0) }}>
            <SelectTrigger className="w-16 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs sm:text-sm text-gray-500">
            Showing {pageSizeNum} records per page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="px-2 py-1 border rounded text-center min-w-8">
              {page + 1}
            </span>
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Homes Tab ──────────────────────────────────────────────────────────────

type HomesStatusTab = "all" | "current" | "past" | "planned"

type HomeColumnKey = "id" | "details" | "name" | "status" | "category" | "responsibleIndividual" | "reports" | "createTask"

const homeColumns: { key: HomeColumnKey; label: string; filterable: boolean; filterType: "search" | "select" | "none" }[] = [
  { key: "id", label: "ID", filterable: true, filterType: "search" },
  { key: "details", label: "Details", filterable: false, filterType: "none" },
  { key: "name", label: "Home Name", filterable: true, filterType: "search" },
  { key: "status", label: "Status", filterable: true, filterType: "select" },
  { key: "category", label: "Category", filterable: true, filterType: "search" },
  { key: "responsibleIndividual", label: "Responsible Individual", filterable: true, filterType: "search" },
  { key: "reports", label: "Reports", filterable: false, filterType: "none" },
  { key: "createTask", label: "Create Task", filterable: false, filterType: "none" },
]

const defaultHomeColumns: HomeColumnKey[] = ["id", "details", "name", "status", "category", "responsibleIndividual", "reports", "createTask"]

const homeStatusBadge: Record<CareGroupHomeStatus, { bg: string; text: string }> = {
  current: { bg: "bg-green-600", text: "text-white" },
  past: { bg: "bg-gray-400", text: "text-white" },
  planned: { bg: "bg-blue-500", text: "text-white" },
}

interface HomesTabProps {
  careGroupId: number
}

function HomesTab({ careGroupId }: HomesTabProps) {
  const [statusTab, setStatusTab] = useState<HomesStatusTab>("all")
  const [visibleColumns, setVisibleColumns] = useState<HomeColumnKey[]>(defaultHomeColumns)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState("20")

  const allHomes = mockCareGroupHomes.filter((h) => h.careGroupId === careGroupId)

  // Filter by status tab
  const statusFiltered = statusTab === "all" ? allHomes : allHomes.filter((h) => h.status === statusTab)

  // Filter by column search
  const filtered = statusFiltered.filter((home) => {
    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue
      let cellValue = ""
      if (key === "id") cellValue = home.id.toString()
      else if (key === "name") cellValue = home.name
      else if (key === "category") cellValue = home.category
      else if (key === "responsibleIndividual") cellValue = home.responsibleIndividual
      else if (key === "status") {
        if (value !== "all" && home.status !== value) return false
        continue
      }
      if (!cellValue.toLowerCase().includes(value.toLowerCase())) return false
    }
    return true
  })

  const pageSizeNum = parseInt(pageSize)
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSizeNum))
  const paginated = filtered.slice(page * pageSizeNum, (page + 1) * pageSizeNum)

  const statusTabCounts = {
    all: allHomes.length,
    current: allHomes.filter((h) => h.status === "current").length,
    past: allHomes.filter((h) => h.status === "past").length,
    planned: allHomes.filter((h) => h.status === "planned").length,
  }

  const handleTabChange = (tab: HomesStatusTab) => {
    setStatusTab(tab)
    setPage(0)
    setSelectedRows(new Set())
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const toggleColumn = (col: HomeColumnKey) => {
    setVisibleColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    )
  }

  const resetGrid = () => {
    setVisibleColumns(defaultHomeColumns)
    setFilters({})
    setSelectedRows(new Set())
    setPage(0)
    setStatusTab("all")
  }

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllRows = () => {
    if (selectedRows.size === paginated.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginated.map((h) => h.id)))
    }
  }

  const handleExport = (format: "pdf" | "excel") => {
    console.log(`Export homes as ${format}`)
  }

  const visibleColumnDefs = homeColumns.filter((col) => visibleColumns.includes(col.key))

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="flex">
        {(["all", "current", "past", "planned"] as const).map((tab, index) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm font-medium border transition-colors ${
              statusTab === tab
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            } ${index === 0 ? "rounded-l-lg" : ""} ${index === 3 ? "rounded-r-lg" : ""} ${index !== 0 ? "-ml-px" : ""}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({statusTabCounts[tab]})
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="link" size="sm" className="gap-1.5 text-primary" onClick={resetGrid}>
            <RefreshCw className="size-3.5" />
            Reset Grid
          </Button>
          <span className="text-gray-300">|</span>
          <p className="text-sm text-gray-500">
            Drag a column header here to group by that column
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="size-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Export As PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
                <FileSpreadsheet className="h-4 w-4" />
                Export As Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" size="sm" className="gap-2 bg-red-500 hover:bg-red-600">
            Actions
          </Button>
        </div>
      </div>

      {/* Columns popover — right-aligned */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" size="sm" className="gap-1.5 text-primary">
              <Columns3 className="size-3.5" />
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56">
            <h4 className="font-medium text-sm mb-3">Columns</h4>
            <div className="space-y-2">
              {homeColumns.map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={visibleColumns.includes(col.key)}
                    onCheckedChange={() => toggleColumn(col.key)}
                  />
                  <span className="text-sm">{col.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-white overflow-x-auto">
        <Table className="min-w-200">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={paginated.length > 0 && selectedRows.size === paginated.length}
                  onCheckedChange={toggleAllRows}
                />
              </TableHead>
              {visibleColumnDefs.map((col) => (
                <TableHead
                  key={col.key}
                  className={`font-semibold text-gray-700 ${
                    col.key === "id" ? "w-20" : ""
                  } ${col.key === "details" ? "w-16" : ""
                  } ${col.key === "status" ? "text-center" : ""
                  } ${col.key === "reports" || col.key === "createTask" ? "text-center" : ""}`}
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
            {/* Filter row */}
            <TableRow>
              <TableHead className="pl-4" />
              {visibleColumnDefs.map((col) => (
                <TableHead key={`filter-${col.key}`} className="py-1">
                  {col.filterType === "search" && (
                    <div className={`relative ${col.key === "id" ? "max-w-16" : ""}`}>
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <Input placeholder="" className="pl-6 h-6 text-xs border-gray-200" onChange={(e) => handleFilterChange(col.key, e.target.value)} />
                    </div>
                  )}
                  {col.filterType === "select" && (
                    <Select defaultValue="all" onValueChange={(v) => handleFilterChange(col.key, v)}>
                      <SelectTrigger className="h-6 text-xs border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnDefs.length + 1}
                  className="text-center py-10 text-gray-400"
                >
                  No Data
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((home, index) => (
                <TableRow
                  key={home.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                >
                  <TableCell className="pl-4 py-3">
                    <Checkbox
                      checked={selectedRows.has(home.id)}
                      onCheckedChange={() => toggleRow(home.id)}
                    />
                  </TableCell>
                  {visibleColumnDefs.map((col) => (
                    <TableCell
                      key={col.key}
                      className={`py-3 ${col.key === "status" || col.key === "reports" || col.key === "createTask" ? "text-center" : ""}`}
                    >
                      {col.key === "id" && (
                        <span className="text-sm text-gray-700">{home.id}</span>
                      )}
                      {col.key === "details" && (
                        <button className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-amber-400 bg-amber-50 text-amber-600 hover:bg-amber-100">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {col.key === "name" && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-200">
                            <HomeIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <Link
                            href={`/homes/${home.id}`}
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            {home.name}
                          </Link>
                        </div>
                      )}
                      {col.key === "status" && (
                        <Badge className={`${homeStatusBadge[home.status].bg} ${homeStatusBadge[home.status].text} hover:opacity-90`}>
                          {home.status.charAt(0).toUpperCase() + home.status.slice(1)}
                        </Badge>
                      )}
                      {col.key === "category" && (
                        <span className="text-sm text-gray-700">{home.category}</span>
                      )}
                      {col.key === "responsibleIndividual" && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-300">
                            <UserIcon className="h-3.5 w-3.5 text-gray-600" />
                          </div>
                          <Link
                            href="#"
                            className="text-sm text-primary hover:underline font-medium"
                          >
                            {home.responsibleIndividual}
                          </Link>
                        </div>
                      )}
                      {col.key === "reports" && (
                        <Link
                          href="#"
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Reports
                        </Link>
                      )}
                      {col.key === "createTask" && (
                        <Link
                          href="#"
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          Create Task
                        </Link>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Select value={pageSize} onValueChange={(v) => { setPageSize(v); setPage(0) }}>
            <SelectTrigger className="w-16 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs sm:text-sm text-gray-500">
            Showing {pageSizeNum} records per page
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 text-sm">
            <span className="px-2 py-1 border rounded text-center min-w-8">
              {page + 1}
            </span>
            <span className="text-gray-500">of {totalPages}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
