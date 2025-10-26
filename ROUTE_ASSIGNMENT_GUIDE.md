# Route Assignment Guide for Admin

## Overview
The Route Assignment feature allows admins to create flight routes and assign them to cargo packages for shipment. This guide explains how to use this feature.

## Accessing Route Assignment

1. **Login as Admin** at `/login`
2. In the admin sidebar (left side), click on the **"Routes"** icon (map/route icon, 3rd icon from top)
3. This will take you to `/admin/route-assignment`

## Step 1: Create Flight Routes

Before you can assign routes to packages, you need to create flight routes.

### Creating Routes

1. Go to **Admin Dashboard** → **"Routes"** menu
2. You'll need to use the Routes API to create routes:

**API Endpoint:** `POST /api/admin/routes`

**Example Route Data:**
```json
{
  "routeName": "Lagos to London Express",
  "origin": "Lagos",
  "destination": "London",
  "aircraftType": "Boeing 747",
  "departureTime": "08:00",
  "arrivalTime": "14:30",
  "flightDuration": "6.5 hours",
  "basePrice": 500,
  "pricePerKg": 15,
  "maxWeight": 25000,
  "availableDays": ["Monday", "Wednesday", "Friday"],
  "isActive": true,
  "description": "Direct cargo flight from Lagos to London"
}
```

**Field Descriptions:**
- `routeName`: Descriptive name for the route
- `origin`: Starting airport/city
- `destination`: Destination airport/city
- `aircraftType`: Type of aircraft (e.g., Boeing 747, Airbus A380)
- `departureTime`: Departure time in HH:MM format (24-hour)
- `arrivalTime`: Arrival time in HH:MM format (24-hour)
- `flightDuration`: Duration of flight (e.g., "6.5 hours")
- `basePrice`: Base price in USD
- `pricePerKg`: Price per kilogram in USD
- `maxWeight`: Maximum cargo weight in kg
- `availableDays`: Array of days route operates (e.g., ["Monday", "Wednesday", "Friday"])
- `isActive`: Whether route is currently active (true/false)
- `description`: Optional description

## Step 2: Assign Routes to Packages

### Using the Route Assignment Page

1. Navigate to `/admin/route-assignment` from the admin sidebar
2. You'll see a dashboard with:
   - **Stats Cards**: Total packages, unassigned routes, pending, in-transit, delivered
   - **Filter Buttons**: 
     - "Unassigned Routes" - Shows only packages without assigned routes
     - "All Packages" - Shows all packages
   - **Package Table**: Lists all packages with their details

### Assigning a Route

1. Find the package you want to assign a route to
2. Click the **"Assign Route"** button in the Actions column
3. A modal will open showing:
   - Package details (tracking ID, weight)
   - Dropdown to select a route
4. Select a route from the dropdown
5. Review the route details shown below (aircraft, times, pricing, max weight)
6. If the package weight exceeds the route's max weight, you'll see a warning
7. Click **"Assign Route"** to confirm

### Removing a Route Assignment

1. Find a package that already has a route assigned
2. Click the **"Remove Route"** button in the Actions column
3. Confirm the removal

## Package Table Columns

The route assignment page displays packages with the following information:

- **Tracking ID**: Unique package identifier + cargo type
- **Sender**: Sender name and origin location
- **Destination**: Receiver name and destination location
- **Weight**: Package weight in kg
- **Status**: Current shipment status (Booked, In Transit, etc.)
- **Assigned Route**: Route name and aircraft type (or "Not Assigned")
- **Date**: Package creation date
- **Actions**: Assign or Remove route button

## Status Filters

Use the filter buttons at the top to quickly find:
- **Unassigned Routes**: Packages that need route assignment (recommended view)
- **All Packages**: Complete list of all packages in the system

## Route Details in Assignment Modal

When assigning a route, you'll see:
- **Aircraft**: Type of aircraft
- **Max Weight**: Maximum cargo weight for this route
- **Departure Time**: Flight departure time
- **Arrival Time**: Flight arrival time
- **Base Price**: Base shipping cost
- **Per Kg Rate**: Cost per kilogram
- **Weight Warning**: Alert if package exceeds route capacity

## Tips

1. **Filter by Unassigned**: Start with "Unassigned Routes" to focus on packages needing attention
2. **Check Weight**: Always verify package weight is within route's max weight
3. **Route Availability**: Only active routes appear in the dropdown
4. **Bulk Operations**: Assign routes as packages are booked for efficient processing

## API Endpoints

For developers/advanced users:

- **List Routes**: `GET /api/admin/routes`
- **Create Route**: `POST /api/admin/routes`
- **Get Route**: `GET /api/admin/routes/[id]`
- **Update Route**: `PUT /api/admin/routes/[id]`
- **Delete Route**: `DELETE /api/admin/routes/[id]`
- **List Packages**: `GET /api/admin/packages?routeAssigned=false`
- **Assign Route**: `PUT /api/admin/packages/[id]/assign-route`
- **Remove Route**: `DELETE /api/admin/packages/[id]/assign-route`

## Troubleshooting

**Problem**: Routes dropdown is empty
- **Solution**: Create routes first using the Routes API

**Problem**: Can't assign route to package
- **Solution**: Check if package weight exceeds route's max weight

**Problem**: Don't see "Routes" in sidebar
- **Solution**: Make sure you're logged in as Admin role

**Problem**: Error when assigning route
- **Solution**: Ensure the route is active and exists in the database

## Example Workflow

1. Customer books a cargo shipment
2. Package appears with status "Booked" and "Not Assigned" route
3. Admin filters for "Unassigned Routes"
4. Admin clicks "Assign Route" on the package
5. Admin selects appropriate route based on origin/destination
6. System validates weight against route capacity
7. Admin confirms assignment
8. Package now shows assigned route details
9. Freight officer can see this in their daily tasks
10. Package can be tracked with route information

---

**Need Help?** Contact system administrator or refer to technical documentation.
