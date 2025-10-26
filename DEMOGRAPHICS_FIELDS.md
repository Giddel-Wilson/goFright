# User Demographics & Analytics Fields

## Overview
Added demographic and location fields to user profiles for better analytics and user insights.

## New Fields Added

### Demographics
1. **Gender** (Optional)
   - Type: Enum
   - Options: male, female, other, prefer_not_to_say
   - Purpose: Demographic analytics

2. **Date of Birth** (Optional)
   - Type: Date
   - Purpose: Age demographics, birthday notifications

3. **Nationality** (Optional)
   - Type: String (max 100 chars)
   - Purpose: Geographic analytics, international shipping insights

4. **State of Origin** (Optional)
   - Type: String (max 100 chars)
   - Purpose: Regional analytics (especially for Nigeria)

### Location
5. **City** (Optional)
   - Type: String (max 100 chars)
   - Purpose: City-level analytics, local routing

6. **State/Province** (Optional)
   - Type: String (max 100 chars)
   - Purpose: State-level analytics, regional operations

## Files Modified

### Database Model
**File:** `/src/lib/server/db/models/User.ts`
- Added fields to `IUser` interface
- Added schema definitions with validation
- All fields optional to not break existing data

### Auth Store
**File:** `/src/lib/stores/auth.ts`
- Updated `User` interface to include new fields
- Ensures type safety across the application

### API Endpoints

#### Admin Profile API
**File:** `/src/routes/api/admin/profile/+server.ts`
- Updated `PUT` endpoint to accept new fields
- Added fields to `allowedUpdates` array
- Uses `$set` operator with validation

#### Freight Officer Profile API
**File:** `/src/routes/api/freight-officer/profile/+server.ts`
- Updated `PUT` endpoint to accept new fields
- Builds updates object dynamically
- Uses `runValidators: true` for data integrity

#### Customer Profile API
**File:** `/src/routes/api/customer/profile/+server.ts`
- Updated `PUT` endpoint to accept new fields
- Same pattern as freight officer
- Maintains role-based access control

### UI Components

#### Admin Profile Page
**File:** `/src/routes/(admin)/admin/profile/+page.svelte`
- Added new form fields to `formData` state
- Updated `loadProfile()` to load new fields
- Updated `saveProfile()` to send new fields
- Added UI inputs:
  - Gender dropdown
  - Date picker for DOB
  - Text inputs for nationality, state of origin, city, state
  - Textarea for address (moved to span full width)

## Analytics Benefits

### User Demographics
- **Gender distribution**: Understand user base composition
- **Age groups**: From date of birth calculations
- **Geographic spread**: By nationality and location

### Regional Insights
- **Popular states**: Where most users come from
- **City clusters**: Urban vs rural distribution
- **State of origin**: Migration patterns (Nigeria-specific)

### Business Intelligence
- **Target markets**: Which regions to focus on
- **Service optimization**: Tailor services by demographics
- **Marketing campaigns**: Demographic-targeted promotions
- **Resource allocation**: Deploy resources where users are

## Form UI Layout

The profile form now displays:

**Row 1:** Name | Email
**Row 2:** Phone | Role (disabled)
**Row 3:** Gender | Date of Birth
**Row 4:** Nationality | State of Origin
**Row 5:** City | State/Province
**Row 6:** Address (full width)

All fields are optional and can be edited when "Edit Profile" is clicked.

## Data Validation

- **Gender**: Must be one of 4 predefined values
- **Date of Birth**: Must be valid date format
- **Text fields**: Max length 100 characters
- **Address**: Max length 500 characters
- **All fields**: Trimmed whitespace

## Database Migration

No migration needed! Since all fields are optional:
- Existing users: Fields will be `null`/`undefined`
- New users: Can fill fields during registration or later
- Updates: Users can add information gradually

## Example Usage

### Update Profile Request
```json
{
  "name": "Giddel Wilson",
  "email": "admin@gofright.com",
  "phone": "+2348061403424",
  "address": "24 Extension A, Odumini Crescent",
  "gender": "male",
  "dateOfBirth": "1990-05-15",
  "nationality": "Nigerian",
  "stateOfOrigin": "Lagos",
  "city": "Agia",
  "state": "Benue"
}
```

### Analytics Query Examples
```javascript
// Gender distribution
db.users.aggregate([
  { $group: { _id: "$gender", count: { $sum: 1 } } }
])

// Users by state
db.users.aggregate([
  { $group: { _id: "$state", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Age groups
db.users.aggregate([
  { $project: { 
      age: { 
        $subtract: [
          { $year: new Date() },
          { $year: "$dateOfBirth" }
        ]
      }
    }
  },
  { $bucket: {
      groupBy: "$age",
      boundaries: [18, 25, 35, 45, 55, 65, 100],
      default: "Unknown"
    }
  }
])
```

## Next Steps (Optional Enhancements)

1. **Registration Form**: Add these fields to registration (optional)
2. **User Management**: Show demographics in admin user list
3. **Analytics Dashboard**: Create charts/graphs using this data
4. **Reports**: Generate demographic reports
5. **Export**: Include in user data exports

---

**Status:** ✅ Complete - Demographics fields added to all user types

**Date:** October 19, 2025

**Backward Compatible:** Yes - All fields optional
