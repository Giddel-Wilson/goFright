# ✅ Quick Testing Checklist

**Date:** January 19, 2025  
**Status:** Ready to Test  
**URL:** http://localhost:5173/

---

## 🎯 QUICK START - Test in This Order

### ⏱️ ~30 Minutes: Registration & Authentication

**Step 1: Register Admin**
- Go to: http://localhost:5173/login
- Register with:
  - Email: testadmin@gofright.com
  - Password: Admin@2024
  - Role: admin
- ✅ Check: Redirects to /admin dashboard

**Step 2: Register Freight Officer**
- Logout, then register:
  - Email: testofficer@gofright.com
  - Password: Officer@2024
  - Role: freight_officer
- ✅ Check: Redirects to /freight-officer dashboard

**Step 3: Register Customer**
- Logout, then register:
  - Email: testcustomer@gofright.com
  - Password: Customer@2024
  - Role: customer
- ✅ Check: Redirects to /customer dashboard

**Step 4: Test Login**
- ✅ Login with each account
- ✅ Test wrong password (should fail)
- ✅ Test session persistence (close/reopen browser)

**Step 5: Test Role Access**
- ✅ Customer trying /admin should be blocked
- ✅ Officer trying /admin should be blocked
- ✅ Admin can access all dashboards

---

### ⏱️ ~30 Minutes: Admin Dashboard

**Login:** testadmin@gofright.com / Admin@2024

1. **Dashboard** (/admin)
   - ✅ Stats cards display
   - ✅ Recent activities load

2. **Packages** (/admin/packages)
   - ✅ Create new package
   - ✅ Edit package status
   - ✅ Delete package
   - ✅ Search and filter work

3. **Users** (/admin/users)
   - ✅ Create new user
   - ✅ Edit user details
   - ✅ Toggle user active status
   - ✅ Delete user

4. **Reports** (/admin/reports)
   - ✅ View analytics
   - ✅ Date filter works

5. **Settings** (/admin/settings)
   - ✅ Update company info
   - ✅ Save settings
   - ✅ Settings persist on reload

6. **Profile** (/admin/profile)
   - ✅ Upload photo
   - ✅ Photo shows in nav
   - ✅ Change password
   - ✅ Update personal info

---

### ⏱️ ~30 Minutes: Freight Officer Dashboard

**Login:** testofficer@gofright.com / Officer@2024

1. **Dashboard** (/freight-officer)
   - ✅ Stats display
   - ✅ Recent shipments load

2. **Shipments** (/freight-officer/shipments)
   - ✅ Create new shipment (3-step form)
   - ✅ Tracking number auto-generated
   - ✅ Edit shipment status
   - ✅ Search and filter work

3. **Tracking** (/freight-officer/tracking)
   - ✅ Google Maps loads
   - ✅ Markers display on map
   - ✅ Click marker shows details
   - ✅ Marker colors correct (yellow/blue/green)
   - ✅ Map zoom works

4. **Reports** (/freight-officer/reports)
   - ✅ Select report type
   - ✅ Generate report
   - ✅ Stats display
   - ✅ Date filter works

5. **Profile** (/freight-officer/profile)
   - ✅ Upload photo
   - ✅ Update info
   - ✅ Change password

---

### ⏱️ ~30 Minutes: Customer Dashboard

**Login:** testcustomer@gofright.com / Customer@2024

1. **Dashboard** (/customer)
   - ✅ Stats cards display
   - ✅ Quick track search works
   - ✅ Recent items load

2. **Book Cargo** (/customer/book)
   - ✅ Step 1: Sender info
   - ✅ Step 2: Receiver info
   - ✅ Step 3: Cargo details
   - ✅ Step 4: Pickup scheduling
   - ✅ Step 5: Review & confirm
   - ✅ Price calculated correctly (₦5000 + weight × ₦500)
   - ✅ Tracking number generated
   - ✅ Redirects to My Shipments

3. **My Shipments** (/customer/shipments)
   - ✅ All shipments display
   - ✅ Search works
   - ✅ Status filter works
   - ✅ View details modal
   - ✅ Cancel booking (for pending)

4. **Track** (/customer/track)
   - ✅ Enter tracking number
   - ✅ Google Maps loads
   - ✅ Orange marker displays
   - ✅ Timeline shows milestones
   - ✅ Share button works
   - ✅ Try URL: ?number=TRK-XXX

5. **Invoices** (/customer/invoices)
   - ✅ All invoices display
   - ✅ Stats cards show
   - ✅ Search and filter work
   - ✅ Download button present
   - ✅ Pay Now button present

6. **Profile** (/customer/profile)
   - ✅ Upload photo
   - ✅ Update info
   - ✅ Change password

---

### ⏱️ ~20 Minutes: Integration Tests

1. **Cross-Role: Officer Creates, Customer Tracks**
   - Login as Officer
   - Create shipment with customer email
   - Logout, login as Customer
   - ✅ Customer can see and track shipment

2. **Cross-Role: Customer Books, Officer Updates**
   - Login as Customer
   - Book cargo
   - Note tracking number
   - Logout, login as Officer
   - Find booking, update status
   - Logout, login as Customer
   - ✅ Status updated in customer view

3. **Admin Full Access**
   - Login as Admin
   - ✅ Can view all shipments
   - ✅ Can edit any shipment
   - ✅ Can view all users
   - ✅ Can edit any user

4. **File Uploads**
   - Upload photos for all 3 users
   - ✅ Files saved to static/uploads/profiles/
   - ✅ Photos display in navigation
   - ✅ Logout and login - photos persist

5. **Database Verification**
   - Open MongoDB Compass/Atlas
   - Check `users` collection
   - Check `cargos` collection
   - ✅ Data saved correctly
   - ✅ Passwords hashed
   - ✅ Tracking numbers formatted correctly

---

## 🐛 Issue Tracking

**Found Issues:**
[Document any issues here as you test]

**Example:**
- [ ] Issue #1: [Description]
- [ ] Issue #2: [Description]

---

## ✅ Completion Status

- [ ] All authentication tests passed
- [ ] All admin tests passed
- [ ] All freight officer tests passed
- [ ] All customer tests passed
- [ ] All integration tests passed
- [ ] Google Maps working everywhere
- [ ] File uploads working
- [ ] Database operations verified
- [ ] No critical bugs

---

## 📝 Final Steps

Once all tests pass:

1. ✅ Update TESTING_EXECUTION_REPORT.md with results
2. ✅ Update PROGRESS.md testing section
3. ✅ Document any bugs found
4. ✅ Mark testing phase complete
5. ✅ Move to next phase (PDF generation, payments)

---

**Estimated Total Time:** 2-3 hours  
**Priority:** Test systematically in order  
**Report:** Use TESTING_EXECUTION_REPORT.md for detailed notes
