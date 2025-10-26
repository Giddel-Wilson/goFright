# Auth Persistence Testing Checklist

## Pre-Test Setup

- [ ] Database has test users for all roles:
  - Admin: `admin@gofright.com`
  - Freight Officer: Register or use existing
  - Customer: Register or use existing

## Test 1: Freight Officer Auth Persistence

### Steps:
1. [ ] Open browser DevTools Console
2. [ ] Navigate to `/login`
3. [ ] Login with freight officer credentials
4. [ ] Verify redirect to `/freight-officer`
5. [ ] Navigate to `/freight-officer/profile`
6. [ ] Hard refresh page (Cmd+R / Ctrl+R)
7. [ ] Wait for page to reload

### Expected Results:
- [ ] No redirect to `/login` page
- [ ] Page stays on `/freight-officer/profile`
- [ ] Sidebar shows profile picture and name
- [ ] Profile data loads correctly
- [ ] Console shows:
  ```
  Layout mounted - loading user...
  User loaded: { name: "...", ... }
  ```

### If Test Fails:
- [ ] Check console for errors
- [ ] Verify `await authStore.loadUser()` in onMount
- [ ] Verify `$effect()` has `!$authStore.isLoading &&` guard
- [ ] Check cookies in DevTools → Application → Cookies

---

## Test 2: Customer Auth Persistence

### Steps:
1. [ ] Open browser DevTools Console
2. [ ] Navigate to `/login`
3. [ ] Login with customer credentials
4. [ ] Verify redirect to `/customer`
5. [ ] Navigate to `/customer/profile`
6. [ ] Hard refresh page (Cmd+R / Ctrl+R)
7. [ ] Wait for page to reload

### Expected Results:
- [ ] No redirect to `/login` page
- [ ] Page stays on `/customer/profile`
- [ ] Sidebar shows profile picture and name
- [ ] Console shows:
  ```
  Customer layout mounted - loading user...
  User loaded: { name: "...", ... }
  ```

### If Test Fails:
- [ ] Check console for errors
- [ ] Verify loading screen appears briefly
- [ ] Check customer layout has same pattern as freight officer

---

## Test 3: Admin Auth Persistence (Baseline)

### Steps:
1. [ ] Navigate to `/login`
2. [ ] Login with admin credentials
3. [ ] Navigate to `/admin/profile`
4. [ ] Hard refresh page
5. [ ] Verify page reloads normally

### Expected Results:
- [ ] No redirect to `/login` page
- [ ] Admin layout still works as before
- [ ] No regression in admin auth flow

---

## Test 4: Role-Based Redirect After Refresh

### Test 4a: Freight Officer trying to access Customer pages
1. [ ] Login as freight officer
2. [ ] Manually navigate to `/customer` (type in address bar)
3. [ ] **Expected**: Redirect to `/freight-officer` or `/login`

### Test 4b: Customer trying to access Freight Officer pages
1. [ ] Login as customer
2. [ ] Manually navigate to `/freight-officer` (type in address bar)
3. [ ] **Expected**: Redirect to `/customer` or `/login`

---

## Test 5: Loading Screen

### Steps:
1. [ ] Throttle network in DevTools (Fast 3G)
2. [ ] Login as freight officer
3. [ ] Hard refresh page
4. [ ] Observe loading behavior

### Expected Results:
- [ ] Loading spinner appears briefly
- [ ] "Loading..." text visible
- [ ] Smooth transition to main content
- [ ] No flash of unstyled content
- [ ] No flash of redirect

---

## Test 6: Auto-Logout Still Works

### Test 6a: Invalid Token
1. [ ] Login as freight officer
2. [ ] Open DevTools → Application → Cookies
3. [ ] Delete `authToken` cookie
4. [ ] Hard refresh page
5. [ ] **Expected**: Redirect to `/login` page

### Test 6b: Manual Logout
1. [ ] Login as customer
2. [ ] Click "Logout" button
3. [ ] Confirm logout
4. [ ] **Expected**: Redirect to `/login` page
5. [ ] Try to navigate back
6. [ ] **Expected**: Cannot access protected pages

---

## Test 7: Multiple Tabs

### Steps:
1. [ ] Login as freight officer in Tab 1
2. [ ] Open Tab 2, navigate to `/freight-officer/profile`
3. [ ] In Tab 1, click Logout
4. [ ] Switch to Tab 2, refresh page
5. [ ] **Expected**: Tab 2 redirects to `/login`

---

## Pass/Fail Criteria

### ✅ All Tests Pass If:
- No auto-logout on page refresh for any role
- Console shows proper user loading sequence
- Loading screens appear and transition smoothly
- Role-based redirects still work
- Manual logout still works
- Invalid tokens still cause redirect

### ❌ Tests Fail If:
- Any page refresh causes logout
- Console shows redirect before user loads
- Loading screen doesn't appear
- Role checks happen before `loadUser()` completes
- Race condition still exists

---

## Debug Checklist

If tests fail, check:
- [ ] `onMount` is `async`
- [ ] `await authStore.loadUser()` is present
- [ ] `$effect()` has `!$authStore.isLoading &&` guard
- [ ] Local `isLoading` state is managed correctly
- [ ] Loading screen condition is `{#if isLoading || !$authStore.user}`
- [ ] No other code redirects before `loadUser()` completes
- [ ] `authStore.loadUser()` successfully reads from cookies
- [ ] Cookies are set with correct domain/path

---

## Files to Verify

Before testing, confirm these files have the fix:
- [ ] `/src/routes/(freight-officer)/+layout.svelte`
- [ ] `/src/routes/(customer)/+layout.svelte`

Reference: `/docs/AUTH_PERSISTENCE_FIX.md`

---

## Testing Complete

Date: ___________  
Tester: ___________  

**Overall Result**: [ ] ✅ PASS  [ ] ❌ FAIL

**Notes**:
