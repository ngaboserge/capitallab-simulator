/**
 * Test file for Application Service
 * 
 * This file demonstrates how to use the application service
 * Run this in a Next.js API route or server component to test
 */

import { applicationService } from './application-service'

export async function testApplicationService() {
  console.log('Testing Application Service...')

  try {
    // Test 1: Create application
    console.log('\n1. Creating application...')
    const newApp = await applicationService.createApplication('test-company-id', {
      target_amount: 1000000,
      expected_listing_date: '2025-12-31'
    })
    console.log('✓ Application created:', newApp.id)
    console.log('  Status:', newApp.status)
    console.log('  Completion:', newApp.completion_percentage + '%')

    // Test 2: Get application by ID
    console.log('\n2. Fetching application...')
    const fetchedApp = await applicationService.getApplicationById(newApp.id)
    console.log('✓ Application fetched:', fetchedApp?.id)
    console.log('  Sections:', fetchedApp?.application_sections?.length)

    // Test 3: Update application
    console.log('\n3. Updating application...')
    const updatedApp = await applicationService.updateApplication(newApp.id, {
      status: 'IN_PROGRESS',
      priority: 'HIGH'
    })
    console.log('✓ Application updated')
    console.log('  New status:', updatedApp.status)
    console.log('  Priority:', updatedApp.priority)

    // Test 4: Calculate completion
    console.log('\n4. Calculating completion...')
    const completion = await applicationService.calculateCompletionPercentage(newApp.id)
    console.log('✓ Completion calculated:', completion + '%')

    // Test 5: Check access
    console.log('\n5. Checking access...')
    const hasAccess = await applicationService.checkAccess(
      newApp.id,
      'test-user-id',
      'ISSUER',
      'test-company-id'
    )
    console.log('✓ Access check:', hasAccess ? 'Granted' : 'Denied')

    console.log('\n✅ All tests passed!')
    return { success: true, applicationId: newApp.id }
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    return { success: false, error }
  }
}

/**
 * Example usage in API route:
 * 
 * // app/api/test-application-service/route.ts
 * import { testApplicationService } from '@/lib/api/test-application-service'
 * 
 * export async function GET() {
 *   const result = await testApplicationService()
 *   return Response.json(result)
 * }
 */
