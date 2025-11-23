#!/bin/bash

# GitHub Project Board Setup Script
# Creates all issues for Base Link Military Rideshare project completion
# Run with: bash create-project-issues.sh

set -e

echo "🚀 Creating GitHub Project Board Issues for Base Link"
echo "=================================================="

echo ""
echo "📝 Creating issues by phase..."
echo "   (Labels will be automatically created when used)"
echo ""

# ============================================================================
# PHASE 1: CORE FUNCTIONALITY (2-3 weeks)
# ============================================================================

echo "🔵 Creating Phase 1 issues (Core Functionality)..."

gh issue create \
  --title "Create Firestore database schema for rides collection" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "database" \
  --body "## Description
Create the Firestore database schema for the rides collection.

## Requirements
- Fields: riderId, driverId, pickup, dropoff, status, timestamps
- Proper indexes for queries
- Document structure documentation

## Acceptance Criteria
- [ ] Rides collection schema defined
- [ ] Indexes created for common queries
- [ ] Schema documented in README or docs folder"

gh issue create \
  --title "Create Firestore database schema for drivers collection" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "database" \
  --body "## Description
Create the Firestore database schema for the drivers collection.

## Requirements
- Fields: userId, vehicle, availability, rating, location
- Driver verification status
- Proper indexes

## Acceptance Criteria
- [ ] Drivers collection schema defined
- [ ] Vehicle information structure documented
- [ ] Indexes created"

gh issue create \
  --title "Create Firestore database schema for matches collection" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "database" \
  --body "## Description
Create the Firestore database schema for the ride-driver matches collection.

## Requirements
- Fields: rideId, driverId, status, matchedAt
- Match expiration logic
- Status tracking

## Acceptance Criteria
- [ ] Matches collection schema defined
- [ ] Match lifecycle documented
- [ ] Query patterns optimized"

gh issue create \
  --title "Implement ride creation API - save requests to Firestore" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "api" \
  --label "frontend" \
  --body "## Description
Implement API to save ride requests to Firestore from MilitaryRideShareApp.tsx.

## Current State
Ride requests are currently only stored in UI state and lost on page refresh.

## Requirements
- Create ride document in Firestore on form submission
- Return ride ID to frontend
- Handle errors appropriately
- Add validation

## Acceptance Criteria
- [ ] Ride data persists to Firestore
- [ ] Proper error handling implemented
- [ ] Loading states added to UI
- [ ] Success confirmation to user"

gh issue create \
  --title "Implement ride retrieval API - fetch real history from Firestore" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "api" \
  --label "frontend" \
  --body "## Description
Replace mock ride data with real Firestore queries in profile/page.tsx.

## Current State
Profile page shows hardcoded mock ride history.

## Requirements
- Query user's rides from Firestore
- Sort by date (most recent first)
- Pagination for large datasets
- Loading and error states

## Acceptance Criteria
- [ ] Real ride data displayed
- [ ] Mock data removed
- [ ] Loading spinner during fetch
- [ ] Empty state for users with no rides
- [ ] Error handling for failed queries"

gh issue create \
  --title "Set up Google Maps API key and environment configuration" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "integration" \
  --body "## Description
Set up Google Maps Platform API key and configure in environment variables.

## Requirements
- Enable Google Maps Platform APIs (Maps JavaScript API, Places API, Directions API, Geocoding API)
- Generate API key with proper restrictions
- Add to .env.local
- Document setup process

## Acceptance Criteria
- [ ] Google Cloud Project created
- [ ] APIs enabled
- [ ] API key generated and restricted
- [ ] Environment variable configured
- [ ] Setup documented in README"

gh issue create \
  --title "Install and configure Google Maps React libraries" \
  --label "phase-1-core" \
  --label "priority-medium" \
  --label "integration" \
  --body "## Description
Install @googlemaps/react-wrapper and configure Places API libraries.

## Requirements
- Install @googlemaps/react-wrapper
- Install @googlemaps/js-api-loader
- Configure TypeScript types
- Set up wrapper component

## Acceptance Criteria
- [ ] Dependencies installed
- [ ] TypeScript types configured
- [ ] Wrapper component created
- [ ] Example map renders successfully"

gh issue create \
  --title "Create Map component for ride request screen" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Create an interactive Map component to display on the ride request screen.

## Requirements
- Show current user location
- Display pickup and dropoff markers
- Show route between points
- Responsive design
- Mobile-friendly

## Acceptance Criteria
- [ ] Map component created
- [ ] Integrated into MilitaryRideShareApp.tsx
- [ ] Shows user location
- [ ] Markers for pickup/dropoff
- [ ] Works on mobile devices"

gh issue create \
  --title "Replace location inputs with Google Places Autocomplete" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "frontend" \
  --label "integration" \
  --body "## Description
Replace plain text location inputs with Google Places Autocomplete.

## Location
MilitaryRideShareApp.tsx:284 (TODO comment)

## Requirements
- Autocomplete for pickup location
- Autocomplete for dropoff location
- Restrict to military base areas
- Handle selection and coordinates

## Acceptance Criteria
- [ ] Places Autocomplete integrated
- [ ] Suggestions appear as user types
- [ ] Location coordinates captured
- [ ] Geofencing applied (military bases only)
- [ ] Plain text inputs removed"

gh issue create \
  --title "Implement geocoding service to convert addresses to coordinates" \
  --label "phase-1-core" \
  --label "priority-medium" \
  --label "api" \
  --label "integration" \
  --body "## Description
Create geocoding service to convert addresses to geographic coordinates.

## Requirements
- Use Google Geocoding API
- Handle forward geocoding (address → coords)
- Handle reverse geocoding (coords → address)
- Error handling for invalid addresses
- Caching for performance

## Acceptance Criteria
- [ ] Geocoding service module created
- [ ] Forward geocoding works
- [ ] Reverse geocoding works
- [ ] Error handling implemented
- [ ] Results cached appropriately"

gh issue create \
  --title "Implement route calculation using Google Directions API" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "api" \
  --label "integration" \
  --body "## Description
Get real route directions and time estimates using Google Directions API.

## Location
MilitaryRideShareApp.tsx:275 (TODO comment)

## Requirements
- Calculate route between pickup and dropoff
- Get distance and duration
- Display route on map
- Replace hardcoded '15-20 min' estimate

## Acceptance Criteria
- [ ] Directions API integrated
- [ ] Real distance calculated
- [ ] Real duration calculated
- [ ] Route displayed on map
- [ ] Hardcoded values removed"

gh issue create \
  --title "Add geofencing logic to restrict pickups/dropoffs to military bases" \
  --label "phase-1-core" \
  --label "priority-medium" \
  --label "api" \
  --body "## Description
Implement geofencing to ensure pickups and dropoffs only occur on/near military bases.

## Requirements
- Define geofence boundaries for military bases
- Validate location selections
- User-friendly error messages
- Support for multiple bases

## Acceptance Criteria
- [ ] Geofence boundaries defined
- [ ] Validation on location selection
- [ ] Error message for invalid locations
- [ ] Supports Fort Liberty and other bases"

gh issue create \
  --title "Create basic ride matching algorithm to pair riders with drivers" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "api" \
  --body "## Description
Develop algorithm to match ride requests with available drivers.

## Requirements
- Find available drivers near pickup location
- Consider driver rating and distance
- Create match record in Firestore
- Notify driver of request

## Acceptance Criteria
- [ ] Matching algorithm implemented
- [ ] Considers driver availability
- [ ] Distance-based matching
- [ ] Match record created
- [ ] Handles case of no available drivers"

gh issue create \
  --title "Implement ride status state machine (Requested → Matched → In Progress → Completed)" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "api" \
  --body "## Description
Create state machine for ride lifecycle management.

## Requirements
- States: Requested, Matched, Accepted, En Route, In Progress, Completed, Cancelled
- Valid transitions between states
- Timestamp each state change
- Update UI based on current state

## Acceptance Criteria
- [ ] State machine logic implemented
- [ ] All states defined
- [ ] Valid transitions enforced
- [ ] Timestamps recorded
- [ ] UI reflects current state"

gh issue create \
  --title "Replace window.alert() with toast notifications in AuthForm.tsx:53" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Replace window.alert() calls with proper toast notifications in AuthForm component.

## Location
AuthForm.tsx:53 (TODO comment)

## Requirements
- Use existing Snackbar context
- User-friendly error messages
- Success messages for registration/login

## Acceptance Criteria
- [ ] All alert() calls removed from AuthForm
- [ ] Toast notifications implemented
- [ ] Error messages clear and helpful
- [ ] Success feedback provided"

gh issue create \
  --title "Replace window.alert() with toast in handleAuthError.tsx:30" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Replace window.alert() with toast notification in handleAuthError utility.

## Location
handleAuthError.tsx:30 (TODO comment)

## Requirements
- Use Snackbar/toast system
- Map Firebase error codes to friendly messages
- Different toast styles for different error types

## Acceptance Criteria
- [ ] alert() removed from handleAuthError
- [ ] Toast notification implemented
- [ ] Error messages user-friendly
- [ ] Toast styling appropriate"

gh issue create \
  --title "Replace window.alert() with toast in authHelpers.ts:30" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Replace window.alert() with toast notifications in authHelpers utilities.

## Location
authHelpers.ts:30 (TODO comment)

## Requirements
- Use consistent toast system
- Apply across all auth helper functions
- Proper error categorization

## Acceptance Criteria
- [ ] All alert() calls removed from authHelpers
- [ ] Toast system consistent across helpers
- [ ] Error handling improved"

gh issue create \
  --title "Add proper error handling in handleGoogleSignIn.tsx:13" \
  --label "phase-1-core" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Add comprehensive error handling to Google Sign-In flow.

## Location
handleGoogleSignIn.tsx:13 (TODO comment)

## Requirements
- Handle popup blocked errors
- Handle user cancellation
- Handle network errors
- User-friendly error messages

## Acceptance Criteria
- [ ] Try-catch block implemented
- [ ] Specific error cases handled
- [ ] Toast notifications for errors
- [ ] User can retry after error"

gh issue create \
  --title "Add form validation for ride request inputs (pickup, dropoff, datetime)" \
  --label "phase-1-core" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Implement validation for ride request form fields.

## Requirements
- Validate pickup location is not empty
- Validate dropoff location is not empty
- Validate locations are different
- Validate datetime is in future
- Show inline validation errors

## Acceptance Criteria
- [ ] All fields validated before submission
- [ ] Inline error messages displayed
- [ ] Submit button disabled if invalid
- [ ] Clear validation state on changes"

gh issue create \
  --title "Add loading states for async operations (ride creation, matching)" \
  --label "phase-1-core" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Add loading indicators for all asynchronous operations.

## Requirements
- Loading spinner during ride creation
- Loading state during matching
- Disable buttons during loading
- Prevent double-submission

## Acceptance Criteria
- [ ] Loading indicators on all async operations
- [ ] Buttons disabled during loading
- [ ] User cannot double-submit
- [ ] Loading states clear on completion/error"

echo "✅ Phase 1 issues created (21 issues)"

# ============================================================================
# PHASE 2: VERIFICATION & SECURITY (2 weeks)
# ============================================================================

echo ""
echo "🟢 Creating Phase 2 issues (Verification & Security)..."

gh issue create \
  --title "Register for ID.me developer account and obtain credentials" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "integration" \
  --body "## Description
Set up ID.me developer account for military verification.

## Requirements
- Register at developer.id.me
- Complete developer verification
- Obtain client ID and client secret
- Configure OAuth redirect URIs

## Acceptance Criteria
- [ ] Developer account created
- [ ] Application registered
- [ ] Client ID obtained
- [ ] Client secret obtained
- [ ] Redirect URIs configured"

gh issue create \
  --title "Configure ID.me OAuth integration" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "integration" \
  --label "security" \
  --body "## Description
Integrate ID.me OAuth flow into authentication system.

## Requirements
- Configure OAuth 2.0 flow
- Handle authorization callback
- Exchange code for tokens
- Store tokens securely
- Handle token refresh

## Acceptance Criteria
- [ ] OAuth flow implemented
- [ ] Callback endpoint created
- [ ] Token exchange working
- [ ] Tokens stored securely in Firestore
- [ ] Refresh token handling implemented"

gh issue create \
  --title "Implement ID.me verification flow to replace mock verification" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "frontend" \
  --label "integration" \
  --body "## Description
Replace mock setIdMeVerified(true) with real ID.me verification.

## Requirements
- Trigger ID.me OAuth on button click
- Handle verification callback
- Update user verification status
- Show verification badge when complete

## Acceptance Criteria
- [ ] Mock verification removed
- [ ] Real ID.me flow initiated
- [ ] User verification status updated in Firestore
- [ ] Verification badge shows real status
- [ ] Error handling for failed verification"

gh issue create \
  --title "Add military status validation (service branch, rank, status)" \
  --label "phase-2-security" \
  --label "priority-medium" \
  --label "api" \
  --label "security" \
  --body "## Description
Validate and store military status from ID.me verification.

## Requirements
- Extract service branch from ID.me response
- Extract rank/status information
- Validate data integrity
- Store in user profile
- Update UI to show real military info

## Acceptance Criteria
- [ ] Service branch extracted from ID.me
- [ ] Rank/status captured
- [ ] Data validated
- [ ] Stored in Firestore user document
- [ ] Profile page shows real data (not hardcoded)"

gh issue create \
  --title "Store verification tokens and expiration in Firestore" \
  --label "phase-2-security" \
  --label "priority-medium" \
  --label "database" \
  --label "security" \
  --body "## Description
Securely store ID.me verification tokens in Firestore.

## Requirements
- Store access token (encrypted if possible)
- Store refresh token
- Store expiration timestamp
- Store verification date
- Handle token cleanup on expiration

## Acceptance Criteria
- [ ] Tokens stored in user document
- [ ] Expiration tracked
- [ ] Old tokens cleaned up
- [ ] Token retrieval implemented for refresh"

gh issue create \
  --title "Implement access control - restrict app to verified users only" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "security" \
  --label "frontend" \
  --body "## Description
Enforce verification requirement to access app features.

## Requirements
- Check verification status on protected routes
- Redirect unverified users to verification page
- Show verification prompt
- Allow profile/account access but not ride features

## Acceptance Criteria
- [ ] Route protection implemented
- [ ] Unverified users redirected
- [ ] Clear messaging about verification requirement
- [ ] Verified users have full access"

gh issue create \
  --title "Update verification badge to show real status instead of hardcoded value" \
  --label "phase-2-security" \
  --label "priority-low" \
  --label "frontend" \
  --body "## Description
Update verification badge to reflect actual verification status from Firestore.

## Requirements
- Read verification status from user document
- Show verified badge when verified
- Show pending/unverified state otherwise
- Update in real-time

## Acceptance Criteria
- [ ] Badge reflects real status
- [ ] Verified state shows check icon
- [ ] Unverified shows appropriate state
- [ ] Updates when verification completes"

gh issue create \
  --title "Add email verification requirement for new user registrations" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "security" \
  --label "frontend" \
  --body "## Description
Require email verification for new user accounts.

## Requirements
- Send verification email on registration
- Block access until email verified
- Provide resend verification option
- Clear user instructions

## Acceptance Criteria
- [ ] Verification email sent on signup
- [ ] Access restricted until verified
- [ ] Resend email option available
- [ ] User sees verification status
- [ ] Verified users can proceed"

gh issue create \
  --title "Send verification emails via Firebase Auth sendEmailVerification()" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "api" \
  --body "## Description
Implement email verification sending using Firebase Auth.

## Requirements
- Call sendEmailVerification() after registration
- Customize email template
- Handle verification callback
- Update user emailVerified status

## Acceptance Criteria
- [ ] Verification emails sent
- [ ] Email template customized
- [ ] Callback handled
- [ ] User status updated on verification"

gh issue create \
  --title "Create Firebase security rules for Firestore collections" \
  --label "phase-2-security" \
  --label "priority-high" \
  --label "security" \
  --label "database" \
  --body "## Description
Implement Firestore security rules for users, rides, and drivers collections.

## Requirements
- Users can only read/write their own user document
- Only verified users can create rides
- Drivers can update their own driver document
- Match records protected appropriately

## Acceptance Criteria
- [ ] Security rules defined in firestore.rules
- [ ] Rules tested with Firebase Emulator
- [ ] Users collection protected
- [ ] Rides collection protected
- [ ] Drivers collection protected
- [ ] Matches collection protected
- [ ] Rules deployed to Firebase"

gh issue create \
  --title "Create Firebase Storage security rules for profile images" \
  --label "phase-2-security" \
  --label "priority-medium" \
  --label "security" \
  --body "## Description
Implement Firebase Storage security rules for profile images.

## Requirements
- Users can only upload to their own folder
- File size limits enforced
- Only image files allowed
- Public read access for profile images

## Acceptance Criteria
- [ ] Storage rules defined in storage.rules
- [ ] Upload restricted to user's folder
- [ ] File type validation (images only)
- [ ] Size limits enforced (e.g., 5MB max)
- [ ] Rules deployed to Firebase"

gh issue create \
  --title "Implement rate limiting for API operations (ride creation, profile updates)" \
  --label "phase-2-security" \
  --label "priority-medium" \
  --label "security" \
  --label "api" \
  --body "## Description
Add rate limiting to prevent abuse of API endpoints.

## Requirements
- Limit ride creation requests per user
- Limit profile update frequency
- Implement exponential backoff
- Clear error messages when rate limited

## Acceptance Criteria
- [ ] Rate limiting implemented for ride creation
- [ ] Rate limiting for profile updates
- [ ] User-friendly error messages
- [ ] Limits documented"

gh issue create \
  --title "Separate dev and production Firebase configs (auth.tsx:7)" \
  --label "phase-2-security" \
  --label "priority-medium" \
  --label "security" \
  --body "## Description
Create separate Firebase configurations for development and production.

## Location
auth.tsx:7 (TODO comment)

## Requirements
- Create devConfig and prodConfig
- Use environment variable to switch
- Separate Firebase projects for dev/prod
- Document setup process

## Acceptance Criteria
- [ ] devConfig created
- [ ] prodConfig created
- [ ] Environment-based switching implemented
- [ ] Separate Firebase projects configured
- [ ] Setup documented in README"

echo "✅ Phase 2 issues created (13 issues)"

# ============================================================================
# PHASE 3: REAL-TIME & ADVANCED FEATURES (2-3 weeks)
# ============================================================================

echo ""
echo "🟡 Creating Phase 3 issues (Real-time & Advanced Features)..."

gh issue create \
  --title "Create driver signup/registration flow" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Build driver registration flow separate from rider signup.

## Requirements
- Driver application form
- Vehicle information collection
- License upload
- Insurance verification
- Background check consent

## Acceptance Criteria
- [ ] Driver signup page created
- [ ] Form collects all required info
- [ ] Documents uploaded to Storage
- [ ] Driver document created in Firestore
- [ ] Pending approval status set"

gh issue create \
  --title "Build driver profile page with vehicle registration" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Create driver profile page showing vehicle and driver info.

## Requirements
- Display driver information
- Show vehicle details
- Rating display
- Edit vehicle info
- Upload vehicle photos

## Acceptance Criteria
- [ ] Driver profile page created
- [ ] Vehicle information displayed
- [ ] Rating shown
- [ ] Edit functionality works
- [ ] Vehicle photos uploadable"

gh issue create \
  --title "Add driver availability toggle (online/offline status)" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Implement driver availability toggle to go online/offline.

## Requirements
- Toggle switch on driver dashboard
- Update availability in Firestore
- Only available drivers matched to rides
- Show current status clearly

## Acceptance Criteria
- [ ] Toggle switch implemented
- [ ] Status updates in Firestore
- [ ] Matching algorithm respects availability
- [ ] Current status visible to driver"

gh issue create \
  --title "Create driver dashboard showing pending ride requests" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Build driver dashboard to view and manage ride requests.

## Requirements
- List pending ride requests
- Show ride details (pickup, dropoff, rider info)
- Accept/reject buttons
- Real-time updates

## Acceptance Criteria
- [ ] Dashboard page created
- [ ] Ride requests listed
- [ ] Ride details visible
- [ ] Accept/reject functionality works
- [ ] Updates in real-time"

gh issue create \
  --title "Implement driver acceptance/rejection of ride requests" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "api" \
  --label "frontend" \
  --body "## Description
Allow drivers to accept or reject matched ride requests.

## Requirements
- Accept button updates ride status
- Reject button releases match
- Notify rider of acceptance
- Timeout for unanswered requests

## Acceptance Criteria
- [ ] Accept updates ride to 'Accepted'
- [ ] Reject releases match and finds new driver
- [ ] Rider notified on acceptance
- [ ] Timeout logic implemented"

gh issue create \
  --title "Set up Firebase Realtime Database or Firestore onSnapshot for live updates" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "database" \
  --body "## Description
Configure real-time listeners for live data updates.

## Requirements
- Set up Firestore onSnapshot listeners
- Listen to ride status changes
- Listen to driver location updates
- Handle listener cleanup

## Acceptance Criteria
- [ ] onSnapshot listeners configured
- [ ] Ride status updates in real-time
- [ ] Driver location streams
- [ ] Listeners properly cleaned up on unmount"

gh issue create \
  --title "Implement live ride status tracking (driver accepted, en route, arrived, in progress)" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Display live ride status updates to rider.

## Requirements
- Show current ride status
- Update automatically as status changes
- Progress indicator
- Estimated times for each stage

## Acceptance Criteria
- [ ] Status displayed on rider screen
- [ ] Updates automatically via Firestore listener
- [ ] Progress visualization (stepper/timeline)
- [ ] ETAs shown for each stage"

gh issue create \
  --title "Add driver GPS location streaming to Firestore" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "api" \
  --body "## Description
Stream driver GPS location to Firestore during active rides.

## Requirements
- Get driver's current location
- Update location in Firestore every 5-10 seconds
- Only stream during active rides
- Handle location permissions

## Acceptance Criteria
- [ ] Geolocation API used
- [ ] Location updates every 5-10 seconds
- [ ] Only streams when ride active
- [ ] Location permission requested
- [ ] Graceful handling of permission denial"

gh issue create \
  --title "Create live tracking map showing driver location approaching rider" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "frontend" \
  --body "## Description
Build live tracking map for riders to see driver approaching.

## Requirements
- Map showing driver's current location
- Driver marker moves in real-time
- Route from driver to pickup shown
- ETA updates

## Acceptance Criteria
- [ ] Tracking map component created
- [ ] Driver location updates in real-time
- [ ] Route drawn on map
- [ ] ETA calculated and displayed
- [ ] Map centers on driver location"

gh issue create \
  --title "Implement Firebase Cloud Messaging (FCM) for push notifications" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "integration" \
  --body "## Description
Set up Firebase Cloud Messaging for push notifications.

## Requirements
- Configure FCM in Firebase Console
- Request notification permissions
- Register device tokens
- Handle foreground/background messages

## Acceptance Criteria
- [ ] FCM configured
- [ ] Permission requested on app load
- [ ] Device token stored in Firestore
- [ ] Foreground notifications handled
- [ ] Background notifications handled"

gh issue create \
  --title "Add notification triggers (ride accepted, driver arriving, ride completed)" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "api" \
  --body "## Description
Implement notification sending for key ride events.

## Requirements
- Notify rider when driver accepts
- Notify when driver is arriving
- Notify when ride completed
- Notify driver of new requests

## Acceptance Criteria
- [ ] Notifications sent on ride acceptance
- [ ] Notifications sent when driver arriving
- [ ] Notifications sent on completion
- [ ] Drivers notified of requests
- [ ] Notification content clear and actionable"

gh issue create \
  --title "Create in-app messaging system for rider-driver communication" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --label "database" \
  --body "## Description
Build messaging system for riders and drivers to communicate during rides.

## Requirements
- Chat interface
- Send/receive messages
- Message persistence in Firestore
- Real-time message delivery
- Notification on new message

## Acceptance Criteria
- [ ] Messaging data structure in Firestore
- [ ] Chat UI component created
- [ ] Messages send successfully
- [ ] Messages received in real-time
- [ ] Notification on new message
- [ ] Message history persisted"

gh issue create \
  --title "Build chat UI component for ride messages" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Create chat interface UI for in-ride messaging.

## Requirements
- Message bubbles (sent/received)
- Input field and send button
- Scrollable message history
- Timestamp display
- Typing indicators (optional)

## Acceptance Criteria
- [ ] Chat UI component built
- [ ] Sent/received messages styled differently
- [ ] Auto-scroll to latest message
- [ ] Timestamps shown
- [ ] Mobile responsive"

gh issue create \
  --title "Set up Stripe account and obtain API keys" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "integration" \
  --body "## Description
Create Stripe account for payment processing.

## Requirements
- Register at stripe.com
- Complete account verification
- Obtain test API keys
- Obtain production API keys
- Configure webhooks

## Acceptance Criteria
- [ ] Stripe account created
- [ ] Account verified
- [ ] Test keys obtained
- [ ] Production keys obtained
- [ ] Webhook endpoint URL configured"

gh issue create \
  --title "Integrate Stripe Payment Element for payment method collection" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "frontend" \
  --label "integration" \
  --body "## Description
Integrate Stripe Payment Element to collect payment methods.

## Requirements
- Install @stripe/stripe-js and @stripe/react-stripe-js
- Create payment method form
- Save payment method to Stripe customer
- Store default payment method ID

## Acceptance Criteria
- [ ] Stripe libraries installed
- [ ] Payment Element rendered
- [ ] Payment method saved successfully
- [ ] Default payment method stored
- [ ] Error handling for failed saves"

gh issue create \
  --title "Implement fare calculation algorithm (base fare + distance + time)" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "api" \
  --body "## Description
Create algorithm to calculate ride fares.

## Requirements
- Base fare amount
- Price per mile
- Price per minute
- Surge pricing (optional)
- Military discount

## Acceptance Criteria
- [ ] Fare calculation function created
- [ ] Uses distance and duration from Directions API
- [ ] Base fare + per-mile + per-minute calculated
- [ ] Military discount applied
- [ ] Fare shown to rider before booking"

gh issue create \
  --title "Create payment processing flow for completed rides" \
  --label "phase-3-advanced" \
  --label "priority-high" \
  --label "api" \
  --label "integration" \
  --body "## Description
Process payments when rides are completed.

## Requirements
- Charge customer's payment method
- Handle payment success
- Handle payment failure
- Store transaction record
- Send receipt

## Acceptance Criteria
- [ ] Payment charged on ride completion
- [ ] Success updates ride status to 'Paid'
- [ ] Failures handled gracefully
- [ ] Transaction record in Firestore
- [ ] Receipt sent via email"

gh issue create \
  --title "Add transaction history page showing past payments" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Create transaction history page for users to view past payments.

## Requirements
- List all transactions
- Show date, amount, ride details
- Filter by date range
- Download receipt

## Acceptance Criteria
- [ ] Transaction history page created
- [ ] Transactions listed with details
- [ ] Date filters work
- [ ] Receipt download available
- [ ] Mobile responsive"

gh issue create \
  --title "Implement split fare functionality for shared rides" \
  --label "phase-3-advanced" \
  --label "priority-low" \
  --label "api" \
  --label "frontend" \
  --body "## Description
Allow riders to split fares for shared rides.

## Requirements
- Add co-riders to ride
- Split amount calculation
- Request payment from each rider
- Track payment status

## Acceptance Criteria
- [ ] Add co-riders UI
- [ ] Split amount calculated
- [ ] Payment requests sent
- [ ] Payment status tracked
- [ ] Ride completes when all paid"

gh issue create \
  --title "Create edit profile form for name, email, phone (profile/page.tsx:117)" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Build profile editing form to update user information.

## Location
profile/page.tsx:117 (TODO comment)

## Requirements
- Form fields for name, email, phone
- Validation
- Save to Firestore
- Update Firebase Auth profile
- Success/error feedback

## Acceptance Criteria
- [ ] Edit form created
- [ ] Name field editable
- [ ] Email field editable (with re-auth if needed)
- [ ] Phone field editable
- [ ] Validation applied
- [ ] Changes saved to Firestore and Auth
- [ ] Success message shown"

gh issue create \
  --title "Add military branch dropdown selection (profile/page.tsx:121)" \
  --label "phase-3-advanced" \
  --label "priority-low" \
  --label "frontend" \
  --body "## Description
Add dropdown for military branch selection in profile.

## Location
profile/page.tsx:121 (TODO comment)

## Requirements
- Dropdown with military branches (Army, Navy, Air Force, Marines, Coast Guard, Space Force)
- Save selection to Firestore
- Replace hardcoded 'U.S. Army - Active Duty'

## Acceptance Criteria
- [ ] Branch dropdown added
- [ ] All branches listed
- [ ] Selection saved
- [ ] Hardcoded value removed
- [ ] Branch displayed correctly"

gh issue create \
  --title "Add user preferences section (favorite locations, notification settings)" \
  --label "phase-3-advanced" \
  --label "priority-low" \
  --label "frontend" \
  --body "## Description
Create preferences section for user settings.

## Requirements
- Favorite/saved locations
- Notification preferences (push, email, SMS)
- Default payment method
- Privacy settings

## Acceptance Criteria
- [ ] Preferences section in profile
- [ ] Save favorite locations
- [ ] Notification toggles work
- [ ] Default payment method selectable
- [ ] Settings saved to Firestore"

gh issue create \
  --title "Implement profile completion progress indicator" \
  --label "phase-3-advanced" \
  --label "priority-low" \
  --label "frontend" \
  --body "## Description
Add progress indicator showing profile completion percentage.

## Requirements
- Calculate completion based on filled fields
- Show progress bar
- List missing items
- Encourage completion

## Acceptance Criteria
- [ ] Progress percentage calculated
- [ ] Progress bar displayed
- [ ] Missing fields listed
- [ ] Updates in real-time as profile filled"

gh issue create \
  --title "Build recommendation algorithm for Sarge AI based on ride history" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "api" \
  --body "## Description
Create algorithm to generate smart location recommendations.

## Requirements
- Analyze user's ride history
- Identify frequent destinations
- Consider time of day patterns
- Consider day of week patterns
- Generate personalized suggestions

## Acceptance Criteria
- [ ] Algorithm analyzes ride history
- [ ] Frequent destinations identified
- [ ] Time/day patterns considered
- [ ] Recommendations generated
- [ ] Results ranked by relevance"

gh issue create \
  --title "Implement handleSelect logic in SargeReccomendations.tsx:39" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Add logic when user selects a Sarge recommendation.

## Location
SargeReccomendations.tsx:39 (TODO comment)

## Requirements
- Fill pickup/dropoff from selected recommendation
- Navigate to ride request form
- Pre-populate fields
- Show confirmation

## Acceptance Criteria
- [ ] Selection populates ride form
- [ ] User navigated to request screen
- [ ] Fields pre-filled
- [ ] User can modify before submitting"

gh issue create \
  --title "Replace mock Sarge data with real recommendations (MilitaryRideShareApp.tsx:318)" \
  --label "phase-3-advanced" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Replace hardcoded Sarge recommendations with real algorithm-generated data.

## Location
MilitaryRideShareApp.tsx:318 (TODO comment)

## Requirements
- Query user's ride history
- Call recommendation algorithm
- Display personalized suggestions
- Remove mock data

## Acceptance Criteria
- [ ] Mock data removed
- [ ] Real recommendations fetched
- [ ] Personalized to user
- [ ] Updates based on new rides
- [ ] Empty state if no history"

echo "✅ Phase 3 issues created (25 issues)"

# ============================================================================
# PHASE 4: POLISH & LAUNCH (1-2 weeks)
# ============================================================================

echo ""
echo "🟣 Creating Phase 4 issues (Polish & Launch)..."

gh issue create \
  --title "Create backend endpoint for waitlist email collection (LandingPage.tsx:75)" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "api" \
  --body "## Description
Implement backend to save waitlist email signups.

## Location
LandingPage.tsx:75 (TODO comment)

## Requirements
- API endpoint to receive email
- Store in Firestore waitlist collection
- Email validation
- Duplicate prevention

## Acceptance Criteria
- [ ] API endpoint created
- [ ] Emails stored in Firestore
- [ ] Validation applied
- [ ] Duplicates prevented
- [ ] Error handling implemented"

gh issue create \
  --title "Set up email service (SendGrid/Mailgun) for confirmation emails" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "integration" \
  --body "## Description
Configure email service for sending confirmation emails.

## Requirements
- Choose email provider (SendGrid or Mailgun)
- Set up account and API key
- Create email templates
- Send confirmation on waitlist signup

## Acceptance Criteria
- [ ] Email service configured
- [ ] API key stored securely
- [ ] Email template created
- [ ] Confirmation email sends
- [ ] Unsubscribe link included"

gh issue create \
  --title "Build waitlist management dashboard for admins" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "frontend" \
  --body "## Description
Create admin dashboard to manage waitlist signups.

## Requirements
- List all waitlist signups
- Search and filter
- Export to CSV
- Send bulk emails

## Acceptance Criteria
- [ ] Admin dashboard page created
- [ ] Waitlist displayed
- [ ] Search/filter works
- [ ] CSV export available
- [ ] Bulk email sending possible"

gh issue create \
  --title "Implement emergency contact system in user profiles" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "frontend" \
  --label "security" \
  --body "## Description
Allow users to add emergency contacts to their profile.

## Requirements
- Add emergency contact fields
- Name and phone number
- Multiple contacts support
- Auto-notify on SOS

## Acceptance Criteria
- [ ] Emergency contact form added
- [ ] Store in Firestore user profile
- [ ] Support multiple contacts
- [ ] Contacts notified on SOS"

gh issue create \
  --title "Add SOS button with emergency services integration" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "frontend" \
  --label "security" \
  --body "## Description
Implement SOS/emergency button for safety.

## Requirements
- SOS button on active ride screen
- Confirm before activating
- Notify emergency contacts
- Send location to contacts
- Optional: call 911 integration

## Acceptance Criteria
- [ ] SOS button added to ride screen
- [ ] Confirmation dialog shown
- [ ] Emergency contacts notified
- [ ] Location shared
- [ ] Admin/support notified"

gh issue create \
  --title "Implement trip sharing (share ride details with emergency contacts)" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Allow users to share live ride details with trusted contacts.

## Requirements
- Share button on active ride
- Generate shareable link
- Link shows driver info, route, ETA
- No login required to view

## Acceptance Criteria
- [ ] Share button added
- [ ] Link generated
- [ ] Shared page shows ride details
- [ ] Updates in real-time
- [ ] Expires after ride completes"

gh issue create \
  --title "Create driver background check verification workflow" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "api" \
  --label "security" \
  --body "## Description
Implement background check verification for driver applicants.

## Requirements
- Integrate with background check service (Checkr, etc.)
- Trigger check on driver application
- Store verification status
- Admin review/approval
- Notify driver of status

## Acceptance Criteria
- [ ] Background check service integrated
- [ ] Check triggered on application
- [ ] Status stored in Firestore
- [ ] Admin approval workflow
- [ ] Driver notified of results"

gh issue create \
  --title "Add driver and rider rating system after ride completion" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Implement mutual rating system for drivers and riders.

## Requirements
- Rating prompt after ride completion
- 5-star rating
- Optional comment
- Store in Firestore
- Update user/driver average rating

## Acceptance Criteria
- [ ] Rating UI shown after ride
- [ ] Stars selectable
- [ ] Comment optional
- [ ] Rating saved
- [ ] Average rating calculated and displayed"

gh issue create \
  --title "Create driver earnings dashboard showing trip history and payouts" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Build earnings dashboard for drivers to track income.

## Requirements
- Total earnings display
- Earnings by time period (day/week/month)
- Trip history with fares
- Payout status
- Charts/graphs

## Acceptance Criteria
- [ ] Earnings dashboard created
- [ ] Total earnings displayed
- [ ] Filter by time period
- [ ] Trip list with fares
- [ ] Payout status shown
- [ ] Charts for visualization"

gh issue create \
  --title "Set up Jest and React Testing Library for unit tests" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "testing" \
  --body "## Description
Configure testing framework for unit and component tests.

## Requirements
- Install Jest and React Testing Library
- Configure for Next.js
- Set up test scripts
- Create example tests

## Acceptance Criteria
- [ ] Jest installed and configured
- [ ] React Testing Library installed
- [ ] npm test script works
- [ ] Example test passes
- [ ] Coverage reporting configured"

gh issue create \
  --title "Write unit tests for auth utilities and helpers" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "testing" \
  --body "## Description
Create unit tests for authentication utilities.

## Requirements
- Test handleAuthError
- Test authHelpers functions
- Test handleGoogleSignIn
- Mock Firebase Auth
- Aim for 80%+ coverage

## Acceptance Criteria
- [ ] Tests written for auth utilities
- [ ] Firebase mocked appropriately
- [ ] All edge cases covered
- [ ] 80%+ test coverage
- [ ] Tests pass"

gh issue create \
  --title "Write integration tests for authentication flow" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "testing" \
  --body "## Description
Create integration tests for complete auth flow.

## Requirements
- Test registration flow
- Test login flow
- Test Google OAuth
- Test logout
- Test error scenarios

## Acceptance Criteria
- [ ] Registration flow tested end-to-end
- [ ] Login flow tested
- [ ] Google OAuth tested
- [ ] Logout tested
- [ ] Error scenarios covered
- [ ] Tests pass consistently"

gh issue create \
  --title "Set up Playwright or Cypress for E2E testing" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "testing" \
  --body "## Description
Configure end-to-end testing framework.

## Requirements
- Choose between Playwright and Cypress
- Install and configure
- Set up test environment
- Create example E2E test

## Acceptance Criteria
- [ ] E2E framework chosen and installed
- [ ] Configuration complete
- [ ] Test environment set up
- [ ] Example test runs successfully
- [ ] CI integration (optional)"

gh issue create \
  --title "Write E2E tests for ride request flow" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "testing" \
  --body "## Description
Create end-to-end tests for complete ride request flow.

## Requirements
- Test login → request ride → confirmation
- Test location selection
- Test ride matching
- Test ride completion

## Acceptance Criteria
- [ ] Login to ride request tested
- [ ] Location selection tested
- [ ] Matching tested
- [ ] Completion flow tested
- [ ] Tests pass reliably"

gh issue create \
  --title "Add React Error Boundary components for graceful error handling" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Implement Error Boundary components to catch React errors.

## Requirements
- Create ErrorBoundary component
- Wrap app sections in boundaries
- Log errors to monitoring service
- Show fallback UI
- Reset mechanism

## Acceptance Criteria
- [ ] ErrorBoundary component created
- [ ] Applied to main app sections
- [ ] Errors logged
- [ ] User-friendly fallback UI shown
- [ ] Reset/retry option available"

gh issue create \
  --title "Implement offline mode detection and user notifications" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "frontend" \
  --body "## Description
Detect offline mode and notify users.

## Requirements
- Listen to online/offline events
- Show notification when offline
- Queue actions when offline
- Retry when back online

## Acceptance Criteria
- [ ] Offline detection implemented
- [ ] User notified when offline
- [ ] Actions queued appropriately
- [ ] Auto-retry when online
- [ ] Clear status indication"

gh issue create \
  --title "Add network error recovery and retry logic" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "api" \
  --body "## Description
Implement automatic retry for failed network requests.

## Requirements
- Detect network failures
- Exponential backoff retry
- Max retry attempts
- User notification of failures

## Acceptance Criteria
- [ ] Network errors detected
- [ ] Automatic retry with backoff
- [ ] Max 3-5 retry attempts
- [ ] User notified after max retries
- [ ] Works across all API calls"

gh issue create \
  --title "Run accessibility audit with axe-core or Lighthouse" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "testing" \
  --body "## Description
Audit application for accessibility issues.

## Requirements
- Run Lighthouse audit
- Run axe-core checks
- Document findings
- Prioritize issues

## Acceptance Criteria
- [ ] Lighthouse audit run
- [ ] axe-core scan completed
- [ ] Issues documented
- [ ] Priority assigned to each issue
- [ ] Action plan created"

gh issue create \
  --title "Fix accessibility issues (keyboard navigation, ARIA labels, color contrast)" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Fix accessibility issues identified in audit.

## Requirements
- Fix keyboard navigation issues
- Add missing ARIA labels
- Fix color contrast problems
- Ensure screen reader compatibility
- Test with assistive technologies

## Acceptance Criteria
- [ ] All keyboard navigation works
- [ ] ARIA labels added where needed
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested
- [ ] Re-audit shows improvement"

gh issue create \
  --title "Create API documentation for all endpoints and services" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "documentation" \
  --body "## Description
Document all API endpoints and services.

## Requirements
- List all endpoints
- Document request/response formats
- Include examples
- Document error codes
- Authentication requirements

## Acceptance Criteria
- [ ] All endpoints documented
- [ ] Request/response schemas defined
- [ ] Examples provided
- [ ] Error codes listed
- [ ] Published in docs folder or README"

gh issue create \
  --title "Document Firestore database schema and collections" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "documentation" \
  --label "database" \
  --body "## Description
Create comprehensive database schema documentation.

## Requirements
- Document all collections
- Field descriptions
- Data types
- Indexes
- Relationships
- Sample documents

## Acceptance Criteria
- [ ] All collections documented
- [ ] Field descriptions complete
- [ ] Data types specified
- [ ] Indexes listed
- [ ] Relationships explained
- [ ] Examples provided"

gh issue create \
  --title "Write deployment guide for production environment" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "documentation" \
  --body "## Description
Create step-by-step deployment guide.

## Requirements
- Environment setup steps
- Firebase configuration
- Environment variables
- Build process
- Deployment commands
- Rollback procedure

## Acceptance Criteria
- [ ] Deployment guide written
- [ ] All steps documented
- [ ] Environment variables listed
- [ ] Build process explained
- [ ] Rollback procedure included
- [ ] Tested by following guide"

gh issue create \
  --title "Create contributing guidelines for developers" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "documentation" \
  --body "## Description
Write CONTRIBUTING.md with development guidelines.

## Requirements
- Code style guidelines
- Git workflow
- PR process
- Testing requirements
- Development setup

## Acceptance Criteria
- [ ] CONTRIBUTING.md created
- [ ] Code style documented
- [ ] Git workflow explained
- [ ] PR template created
- [ ] Testing requirements listed"

gh issue create \
  --title "Build user manual/help center with FAQs" \
  --label "phase-4-launch" \
  --label "priority-low" \
  --label "documentation" \
  --body "## Description
Create user-facing documentation and help center.

## Requirements
- How-to guides
- FAQ section
- Troubleshooting
- Safety tips
- Contact support info

## Acceptance Criteria
- [ ] User manual written
- [ ] FAQ section created
- [ ] Troubleshooting guide included
- [ ] Safety information provided
- [ ] Support contact listed"

gh issue create \
  --title "Set up production deployment pipeline (Vercel/Firebase Hosting)" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "infrastructure" \
  --body "## Description
Configure production deployment pipeline.

## Requirements
- Choose hosting (Vercel or Firebase Hosting)
- Set up automatic deployments
- Configure environment variables
- Set up staging environment
- CI/CD pipeline

## Acceptance Criteria
- [ ] Hosting platform configured
- [ ] Auto-deploy on main branch
- [ ] Environment variables set
- [ ] Staging environment created
- [ ] Build checks in CI"

gh issue create \
  --title "Configure custom domain and SSL certificates" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "infrastructure" \
  --body "## Description
Set up custom domain with SSL.

## Requirements
- Purchase/configure domain
- Point DNS to hosting
- Configure SSL certificate
- Force HTTPS
- Set up www redirect

## Acceptance Criteria
- [ ] Domain configured
- [ ] DNS pointing correctly
- [ ] SSL certificate installed
- [ ] HTTPS enforced
- [ ] www redirect working"

gh issue create \
  --title "Set up error tracking and monitoring (Sentry/LogRocket)" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "infrastructure" \
  --body "## Description
Implement error tracking and monitoring.

## Requirements
- Choose service (Sentry or LogRocket)
- Install and configure SDK
- Set up error alerts
- Configure source maps
- Test error reporting

## Acceptance Criteria
- [ ] Monitoring service configured
- [ ] SDK installed
- [ ] Errors being tracked
- [ ] Alerts configured
- [ ] Source maps uploaded
- [ ] Test error captured"

gh issue create \
  --title "Set up analytics (Google Analytics/Mixpanel) for user behavior tracking" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "integration" \
  --body "## Description
Implement analytics tracking.

## Requirements
- Choose analytics platform
- Install tracking code
- Set up key events (signups, rides, etc.)
- Configure goals/conversions
- Privacy compliance

## Acceptance Criteria
- [ ] Analytics platform configured
- [ ] Tracking code installed
- [ ] Key events tracked
- [ ] Goals/conversions set up
- [ ] Privacy policy updated
- [ ] GDPR/CCPA compliant"

gh issue create \
  --title "Conduct user acceptance testing (UAT) with beta testers" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "testing" \
  --body "## Description
Run UAT with real users before launch.

## Requirements
- Recruit beta testers (military members)
- Create test scenarios
- Collect feedback
- Track issues
- Iterate on feedback

## Acceptance Criteria
- [ ] Beta testers recruited (10-20 users)
- [ ] Test scenarios created
- [ ] Testing conducted
- [ ] Feedback collected
- [ ] Issues logged
- [ ] Critical issues addressed"

gh issue create \
  --title "Fix bugs and issues identified during UAT" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "testing" \
  --body "## Description
Address all critical bugs found in UAT.

## Requirements
- Prioritize UAT bugs
- Fix critical issues
- Retest after fixes
- Get user confirmation

## Acceptance Criteria
- [ ] All critical bugs fixed
- [ ] High priority bugs addressed
- [ ] Retested and verified
- [ ] Beta testers confirm fixes"

gh issue create \
  --title "Perform security audit and penetration testing" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "security" \
  --label "testing" \
  --body "## Description
Conduct security audit before launch.

## Requirements
- Review Firebase security rules
- Test authentication flows
- Check for common vulnerabilities (OWASP Top 10)
- Test API endpoints
- Review data encryption

## Acceptance Criteria
- [ ] Security audit completed
- [ ] Vulnerabilities identified
- [ ] Critical issues fixed
- [ ] Penetration test passed
- [ ] Security report documented"

gh issue create \
  --title "Optimize performance (code splitting, lazy loading, image optimization)" \
  --label "phase-4-launch" \
  --label "priority-medium" \
  --label "frontend" \
  --body "## Description
Optimize application performance for production.

## Requirements
- Implement code splitting
- Lazy load components
- Optimize images
- Minimize bundle size
- Improve Lighthouse scores

## Acceptance Criteria
- [ ] Code splitting implemented
- [ ] Route-based lazy loading
- [ ] Images optimized (WebP, sizing)
- [ ] Bundle size reduced
- [ ] Lighthouse score >90 performance"

gh issue create \
  --title "Create launch checklist and go-live plan" \
  --label "phase-4-launch" \
  --label "priority-high" \
  --label "documentation" \
  --body "## Description
Create comprehensive launch checklist.

## Requirements
- Pre-launch checklist
- Launch day tasks
- Post-launch monitoring
- Rollback plan
- Communication plan

## Acceptance Criteria
- [ ] Launch checklist created
- [ ] All team members reviewed
- [ ] Rollback plan documented
- [ ] Monitoring dashboards ready
- [ ] Support team briefed
- [ ] Communication plan ready"

echo "✅ Phase 4 issues created (14 issues)"

echo ""
echo "=================================================="
echo "✨ GitHub Project Board Setup Complete!"
echo ""
echo "📊 Summary:"
echo "   Phase 1 (Core Functionality):        21 issues"
echo "   Phase 2 (Verification & Security):   13 issues"
echo "   Phase 3 (Real-time & Advanced):      25 issues"
echo "   Phase 4 (Polish & Launch):           14 issues"
echo "   ────────────────────────────────────────────"
echo "   Total:                               73 issues"
echo ""
echo "🎯 Next Steps:"
echo "   1. Go to your GitHub repository"
echo "   2. Create a new Project Board"
echo "   3. Add filters by labels (phase-1-core, phase-2-security, etc.)"
echo "   4. Add issues to the board"
echo "   5. Start working through Phase 1!"
echo ""
echo "💡 Tip: Use GitHub's automation to automatically add issues"
echo "   with specific labels to your project board."
echo ""
