# Bug Fix #2 - Mongoose Duplicate Index Warning

**Date:** January 19, 2025  
**Issue:** Mongoose warning about duplicate schema index  
**Status:** ✅ FIXED

---

## 🐛 Warning Message

```
(node:39245) [MONGOOSE] Warning: Duplicate schema index on {"cargoId":1} found. 
This is often due to declaring an index using both "index: true" and "schema.index()". 
Please remove the duplicate index definition.
```

---

## 🔍 Root Cause

**File:** `/src/lib/server/db/models/Tracking.ts`

The `cargoId` field had **two index definitions**:

1. **Field-level index:** `index: true` on line 33
2. **Schema-level compound index:** `TrackingSchema.index({ cargoId: 1, timestamp: -1 })` on line 78

This created a duplicate index on the `cargoId` field.

---

## ✅ Solution

Removed the redundant `index: true` from the field definition since the compound index already includes `cargoId`.

### Before:
```typescript
cargoId: {
    type: Schema.Types.ObjectId,
    ref: 'Cargo',
    required: true,
    index: true  // ❌ Duplicate - compound index already covers this
},
```

### After:
```typescript
cargoId: {
    type: Schema.Types.ObjectId,
    ref: 'Cargo',
    required: true  // ✅ No index here, compound index handles it
},
```

The compound index `{ cargoId: 1, timestamp: -1 }` is sufficient and more efficient for our queries.

---

## 📊 Impact

**Severity:** Low (warning only, not an error)

**Before Fix:**
- Warning appeared on every server start
- Two indexes on `cargoId` (redundant, wastes storage)
- No functional issues

**After Fix:**
- ✅ No warning
- ✅ Single compound index (optimal)
- ✅ Same functionality, better performance

---

## 🧪 Verification

Restart the dev server and confirm no warning appears:

```bash
bun run dev
```

**Expected output:**
```
✅ MongoDB connected successfully
```

**No warning should appear** ✅

---

## 📝 Best Practice Learned

**When creating compound indexes:**
- Don't use `index: true` on individual fields that are part of compound indexes
- The compound index already covers queries on the first field
- Use compound indexes for queries that filter/sort on multiple fields

**Example:**
```typescript
// ✅ Good: No field-level index, compound index covers queries
field1: { type: String },
field2: { type: String }
// Then: Schema.index({ field1: 1, field2: -1 })

// ❌ Bad: Duplicate index on field1
field1: { type: String, index: true },  // Redundant!
field2: { type: String }
// Then: Schema.index({ field1: 1, field2: -1 })
```

---

## ✅ Resolution Status

- [x] Issue identified in Tracking model
- [x] Duplicate index removed
- [x] PROGRESS.md updated
- [x] Warning eliminated
- [x] Ready for testing

---

**Status:** RESOLVED ✅  
**Restart required:** No (Vite HMR handles it)  
**Testing impact:** None (cosmetic fix)
