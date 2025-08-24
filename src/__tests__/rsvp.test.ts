// Simple test file to validate RSVP logic
// This can be run with: npx tsx src/__tests__/rsvp.test.ts

interface EventSession {
  id: string
  start: string
  end: string
  capacity: number
  reserved: number
}

interface RSVPFormData {
  name: string
  email: string
  phone: string
  seats: number
}

// Test data
const mockSession: EventSession = {
  id: 'test-session-1',
  start: '2025-01-15T18:30:00Z',
  end: '2025-01-15T20:00:00Z',
  capacity: 12,
  reserved: 3
}

const mockFormData: RSVPFormData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+359888123456',
  seats: 2
}

// Test functions
function testSeatAvailability(session: EventSession, requestedSeats: number): boolean {
  const availableSeats = session.capacity - session.reserved
  return requestedSeats <= availableSeats && requestedSeats >= 1
}

function testFormValidation(formData: RSVPFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!formData.name.trim()) {
    errors.push('Name is required')
  }
  
  if (!formData.email.trim()) {
    errors.push('Email is required')
  }
  
  if (formData.seats < 1 || formData.seats > 2) {
    errors.push('Seats must be between 1 and 2')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Run tests
console.log('🧪 Running RSVP Tests...\n')

// Test 1: Seat availability
console.log('Test 1: Seat Availability')
console.log(`Session: ${mockSession.capacity} total, ${mockSession.reserved} reserved, ${mockSession.capacity - mockSession.reserved} available`)
console.log(`Requesting: ${mockFormData.seats} seats`)
console.log(`Result: ${testSeatAvailability(mockSession, mockFormData.seats) ? '✅ PASS' : '❌ FAIL'}\n`)

// Test 2: Form validation
console.log('Test 2: Form Validation')
const validation = testFormValidation(mockFormData)
console.log(`Form data:`, mockFormData)
console.log(`Validation result: ${validation.isValid ? '✅ PASS' : '❌ FAIL'}`)
if (validation.errors.length > 0) {
  console.log(`Errors: ${validation.errors.join(', ')}`)
}
console.log()

// Test 3: Edge cases
console.log('Test 3: Edge Cases')

// Test with 0 seats
console.log(`0 seats: ${testSeatAvailability(mockSession, 0) ? '✅ PASS' : '❌ FAIL'}`)

// Test with 1 seat
console.log(`1 seat: ${testSeatAvailability(mockSession, 1) ? '✅ PASS' : '❌ FAIL'}`)

// Test with 2 seats
console.log(`2 seats: ${testSeatAvailability(mockSession, 2) ? '✅ PASS' : '❌ FAIL'}`)

// Test with 3 seats (should pass if available)
console.log(`3 seats: ${testSeatAvailability(mockSession, 3) ? '✅ PASS' : '❌ FAIL'}`)

// Test with more seats than available
const overCapacitySession = { ...mockSession, reserved: 11 }
console.log(`Over capacity (requesting 2 when only 1 available): ${testSeatAvailability(overCapacitySession, 2) ? '✅ PASS' : '❌ FAIL'}`)

console.log('\n🎯 All tests completed!')
