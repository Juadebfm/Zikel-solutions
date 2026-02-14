import { create } from "zustand"
import type { Vehicle } from "@/types"
import { mockVehicles } from "@/lib/mock-data"

const STORAGE_KEY = "nexus-vehicles"

function loadFromStorage(): Vehicle[] {
  if (typeof window === "undefined") return mockVehicles
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : mockVehicles
  } catch {
    return mockVehicles
  }
}

function saveToStorage(vehicles: Vehicle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles))
}

interface VehicleStore {
  vehicles: Vehicle[]
  loadVehicles: () => void
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void
}

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: [],

  loadVehicles: () => {
    set({ vehicles: loadFromStorage() })
  },

  addVehicle: (vehicleData) => {
    const { vehicles } = get()
    const maxId = vehicles.length > 0 ? Math.max(...vehicles.map((v) => v.id)) : 0
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: maxId + 1,
    }
    const updated = [...vehicles, newVehicle]
    saveToStorage(updated)
    set({ vehicles: updated })
  },
}))
