"use client"

import { useState } from "react"
import { useCreateEmployeeStore } from "@/stores/create-employee-store"
import type { PermissionUser } from "@/stores/create-employee-store"
import { Search } from "lucide-react"

export function StepPermissions() {
  const { permissions, updatePermissionUser, setShowInactiveUsers } = useCreateEmployeeStore()
  const [searchWithout, setSearchWithout] = useState("")
  const [searchWith, setSearchWith] = useState("")

  const usersWithoutAccess = permissions.users.filter((u) => u.accessLevel === "none")
  const usersWithAccess = permissions.users.filter((u) => u.accessLevel !== "none")

  const filteredWithout = usersWithoutAccess.filter(
    (u) =>
      u.name.toLowerCase().includes(searchWithout.toLowerCase()) ||
      u.email.toLowerCase().includes(searchWithout.toLowerCase())
  )

  const filteredWith = usersWithAccess.filter(
    (u) =>
      u.name.toLowerCase().includes(searchWith.toLowerCase()) ||
      u.email.toLowerCase().includes(searchWith.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Show Inactive Users */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Show Inactive Users
        </label>
        <select
          value={permissions.showInactiveUsers ? "yes" : "no"}
          onChange={(e) => setShowInactiveUsers(e.target.value === "yes")}
          className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Without Access */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-700">
              Users Without Access ({usersWithoutAccess.length})
            </h3>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchWithout}
                onChange={(e) => setSearchWithout(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredWithout.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 text-center">No users found</p>
            ) : (
              filteredWithout.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onSetAccess={(level) => updatePermissionUser(user.id, level)}
                />
              ))
            )}
          </div>
        </div>

        {/* Users With Access */}
        <div className="border border-gray-200 rounded-lg">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
            <h3 className="text-sm font-semibold text-gray-700">
              Users With Access ({usersWithAccess.length})
            </h3>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchWith}
                onChange={(e) => setSearchWith(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredWith.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 text-center">
                No users have been granted access yet
              </p>
            ) : (
              filteredWith.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onSetAccess={(level) => updatePermissionUser(user.id, level)}
                  showRemove
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function UserRow({
  user,
  onSetAccess,
  showRemove,
}: {
  user: PermissionUser
  onSetAccess: (level: PermissionUser["accessLevel"]) => void
  showRemove?: boolean
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          checked={user.accessLevel !== "none"}
          onChange={() => {
            if (user.accessLevel !== "none") {
              onSetAccess("none")
            } else {
              onSetAccess("read-only")
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <button
          onClick={() => onSetAccess("read-write")}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            user.accessLevel === "read-write"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Read/Write
        </button>
        <button
          onClick={() => onSetAccess("read-only")}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            user.accessLevel === "read-only"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Read Only
        </button>
        {showRemove && (
          <button
            onClick={() => onSetAccess("none")}
            className="px-2.5 py-1 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
