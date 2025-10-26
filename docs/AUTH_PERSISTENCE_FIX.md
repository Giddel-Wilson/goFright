# Auth Persistence Fix - Auto-Logout on Page Refresh

## Problem Description

**Symptom**: When a freight officer or customer logs in and then refreshes the browser, they are immediately logged out and redirected to the login page.

**Impact**: Critical bug that prevents users from using the application normally. Any page refresh causes loss of authentication state.

## Root Cause

This is a **race condition** between Svelte 5's reactive primitives:

1. **`$effect()` block** runs synchronously whenever dependencies change
2. **`onMount()` lifecycle** can run asynchronously and may not complete before other code runs

### The Race Condition Flow:

```
1. Page loads → authStore initializes with { user: null, isLoading: true }
2. $effect() reactive block executes → sees user is null → redirects to /login
3. onMount() finally runs → calls loadUser() → loads user from cookie
4. User is now redirected to login page, even though they have a valid session cookie
```

The $effect() block's redirect happens **before** the async `loadUser()` in onMount can complete.

## The Fix Pattern

### ❌ Before (Broken):

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  onMount(() => {
    // Calls loadUser but doesn't wait for it
    authStore.loadUser();
    
    // Check happens immediately, before loadUser completes
    if (!$authStore.user || $authStore.user.role !== 'freight_officer') {
      goto('/login');
    }
  });
  
  // Runs on every reactive update, including initial render
  $effect(() => {
    if (!$authStore.user) {
      goto('/login'); // Redirects before loadUser completes!
    }
  });
</script>

{#if !$authStore.user}
  <div>Loading...</div>
{:else}
  <!-- Layout content -->
{/if}
```

### ✅ After (Fixed):

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let isLoading = $state(true);

  onMount(async () => {
    console.log('Layout mounted - loading user...');
    // Wait for user to load from cookie
    await authStore.loadUser();
    console.log('User loaded:', $authStore.user);
    
    // Only check role AFTER user is loaded
    if (!$authStore.user || $authStore.user.role !== 'freight_officer') {
      console.log('User is not freight officer, redirecting to login');
      goto('/login');
      return;
    }

    isLoading = false;
  });
  
  // Guard with isLoading check - only redirect if NOT loading AND no user
  $effect(() => {
    if (!$authStore.isLoading && !$authStore.user) {
      goto('/login');
    }
  });
</script>

<!-- Show loading screen while auth is loading OR no user yet -->
{#if isLoading || !$authStore.user}
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      <p class="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
{:else}
  <!-- Layout content -->
{/if}
```

## Key Changes

### 1. **Make onMount async with await**
```typescript
onMount(async () => {
  await authStore.loadUser(); // Wait for completion
  // ... rest of logic
});
```

### 2. **Guard $effect() with isLoading check**
```typescript
$effect(() => {
  // Only redirect if NOT loading AND no user
  if (!$authStore.isLoading && !$authStore.user) {
    goto('/login');
  }
});
```

### 3. **Add local isLoading state**
```typescript
let isLoading = $state(true);
// Set to false after loadUser completes and role is verified
```

### 4. **Show loading screen during auth check**
```svelte
{#if isLoading || !$authStore.user}
  <div>Loading...</div>
{:else}
  <!-- Main content -->
{/if}
```

## Why This Works

1. **`onMount` async/await**: Ensures `loadUser()` completes before role check
2. **`isLoading` guard in `$effect()`**: Prevents redirect during initial load
3. **Local `isLoading` state**: Controls when to show loading vs. content
4. **Loading screen condition**: Shows loading while auth is loading OR user is null

The combination ensures that:
- User loads from cookie before any redirect logic runs
- Loading screen shows during auth check
- Redirect only happens after auth check completes and user is verified as invalid/wrong role

## Files Fixed

- ✅ `/src/routes/(freight-officer)/+layout.svelte`
- ✅ `/src/routes/(customer)/+layout.svelte`

## Testing

### Test Case: Page Refresh Persistence

1. **Login** as freight officer or customer
2. **Navigate** to any page in the portal (e.g., /freight-officer/profile)
3. **Hard refresh** the page (Cmd+R on Mac, Ctrl+R on Windows)
4. **Expected**: User should stay logged in, page reloads normally
5. **Previously**: User was logged out and redirected to /login

### Console Logs

With debug logging enabled, you should see:

```
Layout mounted - loading user...
User loaded: { name: "...", email: "...", role: "freight_officer", ... }
```

NOT:
```
Layout mounted - loading user...
User is not freight officer, redirecting to login
```

## Future Layouts

When creating new role-based layouts, **always** use this pattern:

1. Make `onMount` async
2. `await authStore.loadUser()` before role checks
3. Guard `$effect()` redirects with `!$authStore.isLoading &&`
4. Add local `isLoading` state for loading screen
5. Show loading screen while `isLoading || !$authStore.user`

## Related Issues

- Svelte 5 reactivity timing: https://svelte.dev/docs/svelte/$effect
- Race conditions between lifecycle hooks and reactive blocks
- Cookie-based authentication with client-side routing

## Notes

- The admin layout doesn't have this issue because it uses a different auth check pattern
- This is specific to Svelte 5's reactive primitives ($effect, $state)
- Similar issues may occur with other reactive checks that depend on async data loading
