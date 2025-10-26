# Profile Picture Sidebar Fix

## Issue
The sidebar profile pictures were not displaying or updating reactively when users uploaded new photos.

## Root Cause
The layouts were using local `user` variables derived from the auth store, but they weren't reactive to changes. In Svelte 5, to make store values reactive in templates, you need to use the `$storeName` syntax directly.

## Files Fixed

### 1. Admin Layout (`/src/routes/(admin)/+layout.svelte`)
**Changes:**
- Removed local `user` and `isLoading` state variables
- Changed all references to use `$authStore.user` and `$authStore.isLoading` directly
- Profile picture now displays from `$authStore.user?.photoUrl`
- Fallback shows user initials if no photo exists

### 2. Freight Officer Layout (`/src/routes/(freight-officer)/+layout.svelte`)
**Changes:**
- Removed local `user` variable derived from store
- Changed all references to use `$authStore.user` directly
- Profile picture now reactive with `$authStore.user?.photoUrl`
- Green gradient fallback with initials

### 3. Customer Layout (`/src/routes/(customer)/+layout.svelte`)
**Changes:**
- Removed local `user` variable derived from store
- Changed all references to use `$authStore.user` directly
- Profile picture in sidebar now reactive with `$authStore.user?.photoUrl`
- Shows user name and email below photo

## How It Works Now

When a user uploads a profile picture:
1. The profile page updates the user via API: `PUT /api/users/:id`
2. The API returns updated user data including new `photoUrl`
3. The profile page updates auth store: `authStore.setUser(updatedUser)`
4. All layouts automatically re-render because they use `$authStore.user`
5. Sidebar profile pictures update instantly across all pages

## Technical Details

**Before (Not Reactive):**
```svelte
let user = $derived(authStore.user);
{#if user?.photoUrl}
  <img src={user.photoUrl} />
{/if}
```

**After (Reactive):**
```svelte
{#if $authStore.user?.photoUrl}
  <img src={$authStore.user.photoUrl} />
{/if}
```

The `$` prefix creates a reactive subscription that automatically updates the UI when the store changes.

## Testing

To verify the fix:
1. Login as any user (admin, freight officer, or customer)
2. Navigate to Profile page
3. Click "Upload Photo" and select an image
4. Photo should appear in:
   - Profile page (main display)
   - Sidebar avatar (bottom of sidebar)
   - Navigation bar (top right)
5. Navigate to other pages - photo should persist
6. Refresh page - photo should load from database

## Related Files

- Auth Store: `/src/lib/stores/auth.ts`
- Profile Pages:
  - Admin: `/src/routes/(admin)/admin/profile/+page.svelte`
  - Freight Officer: `/src/routes/(freight-officer)/freight-officer/profile/+page.svelte`
  - Customer: `/src/routes/(customer)/customer/profile/+page.svelte`

---

**Status:** ✅ Fixed - Profile pictures now display and update reactively in all sidebars

**Date:** October 19, 2025
