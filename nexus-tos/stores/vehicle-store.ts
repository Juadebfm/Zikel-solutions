import { create } from "zustand"
import type { Vehicle } from "@/types"
import { backendDataService } from "@/services/backend-data.service"

interface VehicleStore {
  vehicles: Vehicle[]
  loadVehicles: () => Promise<void>
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<void>
}

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],

  loadVehicles: async () => {
    const vehicles = await backendDataService.listVehicles()
    set({ vehicles })
  },

  addVehicle: async (vehicleData) => {
    await backendDataService.createVehicle(vehicleData)
    const vehicles = await backendDataService.listVehicles()
    set({ vehicles })
  },
}))
