# Profile Photo Upload - Complete Testing Guide

## ✅ What Was Fixed

### 1. Admin Users Page Display Issue
- **Fixed**: Changed `user.profilePicture` → `user.photoUrl` in user list cards
- **Impact**: Profile photos now display in the admin users list

### 2. API Endpoint Password Field
- **Fixed**: Changed all `.select('-password')` → `.select('-password_hash')`
- **Impact**: Correct field exclusion from API responses

### 3. Mongoose Strict Mode
- **Fixed**: Added `strict: false` to all `findByIdAndUpdate()` calls
- **Impact**: Ensures photoUrl and demographics save properly

### 4. Enhanced Logging
- **Added**: Comprehensive console logging to track photo uploads
- **Impact**: Better debugging and verification

## 🧪 Step-by-Step Testing

### Test 1: Customer Photo Upload

1. **Login as Customer**
   - Email: `testcustomer@gofright.com`
   - Check the browser console (F12 → Console tab)

2. **Go to Profile Page**
   - Navigate to `/customer/profile`

3. **Upload Photo**
   - Click "Choose Photo" button
   - Select an image file
   - Click "Upload Photo" button
   - **Expected console logs**:
   ```
   📸 Customer photo upload: {
     userId: '...',
     filename: '...-1729468800000.jpg',
     photoUrl: '/uploads/profiles/...-1729468800000.jpg',
     fileSize: 123456
   }
   ✅ Customer photo saved to database: {
     userId: '...',
     photoUrl: '/uploads/profiles/...-1729468800000.jpg',
     hasPhotoUrl: true
   }
   ```

4. **Verify Photo Appears**
   - Photo should show in the profile page immediately
   - Check the sidebar - photo should appear there
   - Refresh the page (F5) - photo should persist

5. **Check in Admin Panel**
   - Logout from customer account
   - Login as admin
   - Go to `/admin/users`
   - Find the "Test Customer" card
   - **Expected**: Profile photo should be visible in the card

6. **Check User Details**
   - Click on the "Test Customer" card
   - Right panel should open
   - **Expected**: Large profile photo should display at the top

### Test 2: Freight Officer Photo Upload

1. **Login as Freight Officer**
   - Email: `testofficer@gofright.com`
   - Check the browser console (F12 → Console tab)

2. **Go to Profile Page**
   - Navigate to `/freight-officer/profile`

3. **Upload Photo**
   - Click "Choose Photo" button
   - Select an image file
   - Click "Upload Photo" button
   - **Expected console logs**:
   ```
   📸 Freight officer photo upload: {
     userId: '...',
     filename: '...-1729468800000.jpg',
     photoUrl: '/uploads/profiles/...-1729468800000.jpg',
     fileSize: 123456
   }
   ✅ Freight officer photo saved to database: {
     userId: '...',
     photoUrl: '/uploads/profiles/...-1729468800000.jpg',
     hasPhotoUrl: true
   }
   ```

4. **Verify Photo Appears**
   - Photo should show in the profile page immediately
   - Check the sidebar - photo should appear there
   - Refresh the page (F5) - photo should persist

5. **Check in Admin Panel**
   - Logout from freight officer account
   - Login as admin
   - Go to `/admin/users`
   - Find the "Test Officer" card
   - **Expected**: Profile photo should be visible in the card

6. **Check User Details**
   - Click on the "Test Officer" card
   - Right panel should open
   - **Expected**: Large profile photo should display at the top

### Test 3: Demographics Saving

1. **Login as Customer or Freight Officer**

2. **Go to Profile Page**

3. **Fill Demographics**
   - Gender: Select any option
   - Date of Birth: Pick a date
   - Nationality: Enter text (e.g., "Nigerian")
   - State of Origin: Enter text (e.g., "Lagos")
   - City: Enter text (e.g., "Lagos")
   - State: Enter text (e.g., "Lagos")

4. **Click "Save Changes"**
   - **Expected console log**:
   ```
   Customer profile updated: {
     userId: '...',
     updatedFields: ['name', 'phone', 'gender', 'dateOfBirth', 'nationality', 'stateOfOrigin', 'city', 'state'],
     hasPhotoUrl: true,
     photoUrl: '/uploads/profiles/...',
     demographics: {
       gender: 'male',
       dateOfBirth: '2000-01-01T00:00:00.000Z',
       nationality: 'Nigerian',
       stateOfOrigin: 'Lagos',
       city: 'Lagos',
       state: 'Lagos'
     }
   }
   ```

5. **Refresh Page**
   - All filled fields should persist

6. **Check in Admin Panel**
   - Login as admin
   - Go to `/admin/users`
   - Click on the user you just updated
   - Scroll down in the right panel
   - **Expected**: You should see a "Demographics" section showing all the data

## 🔍 Troubleshooting

### Photos Not Showing?

1. **Check Console Logs**
   - Open browser console (F12)
   - Look for the 📸 and ✅ emoji logs
   - If you see errors, copy and report them

2. **Check File Upload**
   - Navigate to `/Users/maintenance/Documents/goFright/static/uploads/profiles/`
   - Verify image files are being created
   - File names should match what you see in the console logs

3. **Check Network Tab**
   - Open browser dev tools (F12)
   - Go to Network tab
   - Upload a photo
   - Look for the POST request to `/api/customer/profile/photo` or `/api/freight-officer/profile/photo`
   - Check the response - should include `user` object with `photoUrl`

4. **Hard Refresh**
   - Try Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - This clears the cache and forces reload

5. **Check authStore**
   - In browser console, type: `localStorage`
   - Look for auth-related data
   - Try logging out and logging back in

### Demographics Not Showing in Admin Panel?

1. **Check if data was saved**
   - Look at the console logs when you click "Save Changes"
   - Should see all 6 demographic fields in the log

2. **Check the Demographics section**
   - In admin users panel, scroll down
   - The Demographics section only shows IF the user has at least one demographic field filled
   - If no data, the section won't appear

### Still Having Issues?

**Backend Server Logs**:
Look at the terminal where you ran `bun dev`. You should see:
- `📸 Customer photo upload:` or `📸 Freight officer photo upload:`
- `✅ Customer photo saved to database:` or `✅ Freight officer photo saved to database:`

If you see errors in the terminal, that's where the problem is.

**Common Issues**:
- **Port conflict**: Server running on different port (check terminal)
- **File permissions**: Can't create `/static/uploads/profiles/` directory
- **MongoDB connection**: Database not connected
- **Session expired**: Try logging out and back in

## 📊 Success Criteria

✅ Customer can upload photo  
✅ Photo appears immediately in customer profile  
✅ Photo persists after refresh  
✅ Photo shows in customer sidebar  
✅ Photo visible in admin users list  
✅ Photo visible in admin user details panel  

✅ Freight officer can upload photo  
✅ Photo appears immediately in freight officer profile  
✅ Photo persists after refresh  
✅ Photo shows in freight officer sidebar  
✅ Photo visible in admin users list  
✅ Photo visible in admin user details panel  

✅ Demographics save correctly  
✅ Demographics persist after refresh  
✅ Demographics visible in admin panel  

## 🎯 Files Changed

- ✅ `/routes/api/customer/profile/photo/+server.ts` - Added logging
- ✅ `/routes/api/freight-officer/profile/photo/+server.ts` - Added logging
- ✅ `/routes/api/customer/profile/+server.ts` - Fixed password field, added strict:false
- ✅ `/routes/api/freight-officer/profile/+server.ts` - Fixed password field, added strict:false
- ✅ `/routes/api/admin/users/+server.ts` - Fixed password field, added strict:false
- ✅ `/routes/(admin)/admin/users/+page.svelte` - Fixed photoUrl display in list & details

---

**Ready to test!** Follow the steps above and report any issues you encounter. The console logs will help us debug if something isn't working. 🚀
