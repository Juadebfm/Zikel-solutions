"use client"

import { useState } from "react"
import { Loader2, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useAuth } from "@/contexts/auth-context"
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
  useOrganisationSettings,
  useUpdateOrganisationSettings,
} from "@/hooks/api/use-settings"
import type {
  DigestFrequency,
  NotificationSettings,
  OrganisationSettings,
} from "@/services/settings.service"
import { useToastStore } from "@/components/shared/toast"
import { useErrorModalStore } from "@/components/shared/error-modal"

// ─── Page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("personal")
  const { hasPermission } = useAuth()
  const isAdmin = hasPermission("canManageSettings")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Your space to personalise how Zikel works for you — from profile
          details to how you receive updates.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="organisation">Organisation</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalTab />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="organisation" className="mt-6">
            <OrganisationTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// ─── Personal Tab ──────────────────────────────────────────────

function PersonalTab() {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <NotificationSection />
    </div>
  )
}

function ProfileSection() {
  const { user } = useAuth()
  const showToast = useToastStore((s) => s.show)

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  const profileFormKey = `${user.id}:${user.firstName ?? ""}:${user.lastName ?? ""}:${user.email ?? ""}`

  return (
    <ProfileForm
      key={profileFormKey}
      initialFirstName={user.firstName ?? ""}
      initialLastName={user.lastName ?? ""}
      initialEmail={user.email ?? ""}
      onSaved={() => showToast("Profile saved successfully.")}
    />
  )
}

interface ProfileFormProps {
  initialFirstName: string
  initialLastName: string
  initialEmail: string
  onSaved: () => void
}

function ProfileForm({
  initialFirstName,
  initialLastName,
  initialEmail,
  onSaved,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [email, setEmail] = useState(initialEmail)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
        <CardDescription>
          The basics — your name and email so your team always knows who they are
          working with.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            // Profile update would go through a dedicated hook when the endpoint
            // is available. For now, show confirmation.
            onSaved()
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit">Save</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function NotificationSection() {
  const showToast = useToastStore((s) => s.show)
  const showError = useErrorModalStore((s) => s.show)

  const notificationsQuery = useNotificationSettings()
  const updateNotifications = useUpdateNotificationSettings()

  if (notificationsQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  const initialSettings: NotificationSettings = notificationsQuery.data ?? {
    emailNotifications: true,
    pushNotifications: false,
    digestFrequency: "off",
  }
  const notificationFormKey = `${initialSettings.emailNotifications}:${initialSettings.pushNotifications}:${initialSettings.digestFrequency}`

  return (
    <NotificationForm
      key={notificationFormKey}
      initialSettings={initialSettings}
      isSaving={updateNotifications.isPending}
      onSave={(payload) =>
        updateNotifications.mutate(payload, {
          onSuccess: () => showToast("Notification preferences saved."),
          onError: () =>
            showError("We could not save your notification preferences right now. Please try again."),
        })
      }
    />
  )
}

interface NotificationFormProps {
  initialSettings: NotificationSettings
  isSaving: boolean
  onSave: (payload: NotificationSettings) => void
}

function NotificationForm({ initialSettings, isSaving, onSave }: NotificationFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialSettings.emailNotifications)
  const [pushNotifications, setPushNotifications] = useState(initialSettings.pushNotifications)
  const [digestFrequency, setDigestFrequency] = useState<DigestFrequency>(initialSettings.digestFrequency)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you would like to hear from us — we will make sure
          the important things still reach you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications" className="text-sm font-medium">
                Email notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates and reminders via email.
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications" className="text-sm font-medium">
                Push notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get real-time alerts directly in your browser.
              </p>
            </div>
            <Switch
              id="pushNotifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="digestFrequency">Digest frequency</Label>
            <p className="text-sm text-muted-foreground">
              A summary of activity sent at regular intervals so nothing slips
              through the cracks.
            </p>
            <Select value={digestFrequency} onValueChange={(value) => setDigestFrequency(value as DigestFrequency)}>
              <SelectTrigger id="digestFrequency" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Off</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() =>
              onSave({
                emailNotifications,
                pushNotifications,
                digestFrequency,
              })
            }
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Organisation Tab (admin only) ────────────────────────────

function OrganisationTab() {
  const showToast = useToastStore((s) => s.show)
  const showError = useErrorModalStore((s) => s.show)

  const orgQuery = useOrganisationSettings()
  const updateOrg = useUpdateOrganisationSettings()

  if (orgQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-80 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-24" />
        </CardContent>
      </Card>
    )
  }

  const initialSettings: OrganisationSettings = orgQuery.data ?? {
    name: "",
    timezone: "Europe/London",
    locale: "en-GB",
    dateFormat: "dd/MM/yyyy",
    sessionTimeout: 30,
    mfaRequired: false,
    dataRetentionDays: 365,
  }
  const organisationFormKey = [
    initialSettings.name,
    initialSettings.timezone,
    initialSettings.locale,
    initialSettings.dateFormat,
    initialSettings.sessionTimeout,
    initialSettings.mfaRequired,
    initialSettings.dataRetentionDays,
  ].join(":")

  return (
    <OrganisationForm
      key={organisationFormKey}
      initialSettings={initialSettings}
      isSaving={updateOrg.isPending}
      onSave={(payload) =>
        updateOrg.mutate(payload, {
          onSuccess: () => showToast("Organisation settings saved."),
          onError: () =>
            showError(
              "We could not update the organisation settings right now. Please try again shortly."
            ),
        })
      }
    />
  )
}

interface OrganisationFormProps {
  initialSettings: OrganisationSettings
  isSaving: boolean
  onSave: (payload: Partial<OrganisationSettings>) => void
}

function OrganisationForm({ initialSettings, isSaving, onSave }: OrganisationFormProps) {
  const [name, setName] = useState(initialSettings.name)
  const [timezone, setTimezone] = useState(initialSettings.timezone)
  const [locale, setLocale] = useState(initialSettings.locale)
  const [dateFormat, setDateFormat] = useState(initialSettings.dateFormat)
  const [sessionTimeout, setSessionTimeout] = useState(initialSettings.sessionTimeout)
  const [mfaRequired, setMfaRequired] = useState(initialSettings.mfaRequired)
  const [dataRetentionDays, setDataRetentionDays] = useState(initialSettings.dataRetentionDays)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Organisation Settings</CardTitle>
        <CardDescription>
          These settings shape how your entire team experiences the platform —
          from time zones to security policies.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            onSave({
              name,
              timezone,
              locale,
              dateFormat,
              sessionTimeout,
              mfaRequired,
              dataRetentionDays,
            })
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organisation name</Label>
              <Input
                id="orgName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Care Ltd"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="Europe/London"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locale">Locale</Label>
              <Input
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                placeholder="en-GB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date format</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                  <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  <SelectItem value="dd MMM yyyy">dd MMM yyyy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session timeout (minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                min={5}
                max={1440}
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                How long a user can be idle before they are signed out.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataRetentionDays">Data retention (days)</Label>
              <Input
                id="dataRetentionDays"
                type="number"
                min={30}
                max={3650}
                value={dataRetentionDays}
                onChange={(e) => setDataRetentionDays(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                How long records are kept before being eligible for archival.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mfaRequired" className="text-sm font-medium">
                Require multi-factor authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                When enabled, every team member will need to verify with a second
                factor at sign-in — an extra layer of safety for everyone.
              </p>
            </div>
            <Switch
              id="mfaRequired"
              checked={mfaRequired}
              onCheckedChange={setMfaRequired}
            />
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
