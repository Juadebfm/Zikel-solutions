"use client"

import { Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LinkedOrg {
  id: string
  name: string
  type: string
}

interface LinkedOrgsProps {
  orgs: LinkedOrg[]
}

export function LinkedOrgs({ orgs }: LinkedOrgsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Linked Organisations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {orgs.map((org) => (
            <div
              key={org.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 min-w-[180px]"
            >
              <div className="p-2 rounded-lg bg-amber-100">
                <Building2 className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{org.name}</p>
                <p className="text-xs text-gray-500">{org.type}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
