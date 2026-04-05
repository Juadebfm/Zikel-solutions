# Vehicles: BE Confirmation (Ready For FE Wiring)

**Confirmed on:** April 5, 2026  
**Status:** No backend changes needed for current vehicle scope.

## Available endpoints

- `GET /api/v1/vehicles`  
  Supports pagination + filters: `homeId`, `status`, `fuelType`, `search`, `isActive`.
- `GET /api/v1/vehicles/:id`
- `POST /api/v1/vehicles`
- `PATCH /api/v1/vehicles/:id`
- `DELETE /api/v1/vehicles/:id` (soft deactivate)
- `GET /api/v1/vehicles/export?format=pdf|excel`

## Task relation contract (vehicle)

- Preferred payload:
  - `type: "vehicle"`
  - `relatedEntityId: "{vehicleId}"`
- Alternative supported:
  - `vehicleId: "{vehicleId}"`
- Vehicle task filtering:
  - `GET /api/v1/tasks?vehicleId={id}`

## Create vehicle payloads

### Minimum

```json
{
  "registration": "AB12 CDE"
}
```

### Full example

```json
{
  "registration": "AB12 CDE",
  "homeId": "clx...",
  "make": "Ford",
  "model": "Transit",
  "year": 2024,
  "colour": "White",
  "status": "current",
  "fuelType": "Diesel",
  "ownership": "Owned",
  "motDue": "2026-09-15T00:00:00.000Z",
  "nextServiceDue": "2026-06-01T00:00:00.000Z",
  "insuranceDate": "2026-12-01T00:00:00.000Z",
  "registrationDate": "2024-03-01T00:00:00.000Z",
  "details": {
    "seatingCapacity": 8,
    "wheelchairAccessible": true
  }
}
```

## Not supported (by design)

- Vehicle-linked calendar event entity relation is not supported.
- Calendar events are home-scoped.
- If vehicle context is needed in calendar:
  - create the event under the vehicle’s home, and
  - include vehicle details in title/description.
- For strict vehicle relation workflows, use Tasks (`type: "vehicle"`).

## FE implementation note

- FE can proceed immediately with full vehicles wiring.
