/**
 * Simple API Test Script
 * Use this to verify the backend is working correctly
 */

import { cmaApi } from './cma-api-client'

export async function testBackendAPI() {
  console.log('🧪 Testing CMA Backend API...\n')

  const results = {
    passed: 0,
    failed: 0,
    tests: [] as Array<{ name: string; status: 'PASS' | 'FAIL'; message: string }>
  }

  // Test 1: Get Applications
  try {
    console.log('Test 1: GET /api/cma/applications')
    const { data, error } = await cmaApi.getApplications()
    if (error) {
      results.tests.push({ name: 'Get Applications', status: 'FAIL', message: error })
      results.failed++
    } else {
      results.tests.push({ name: 'Get Applications', status: 'PASS', message: `Found ${data?.applications?.length || 0} applications` })
      results.passed++
    }
  } catch (e: any) {
    results.tests.push({ name: 'Get Applications', status: 'FAIL', message: e.message })
    results.failed++
  }

  // Test 2: Get IB Advisors
  try {
    console.log('Test 2: GET /api/cma/ib-advisors')
    const { data, error } = await cmaApi.getIBAdvisors()
    if (error) {
      results.tests.push({ name: 'Get IB Advisors', status: 'FAIL', message: error })
      results.failed++
    } else {
      results.tests.push({ name: 'Get IB Advisors', status: 'PASS', message: `Found ${data?.advisors?.length || 0} advisors` })
      results.passed++
    }
  } catch (e: any) {
    results.tests.push({ name: 'Get IB Advisors', status: 'FAIL', message: e.message })
    results.failed++
  }

  // Test 3: Get Notifications
  try {
    console.log('Test 3: GET /api/cma/notifications')
    const { data, error } = await cmaApi.getNotifications()
    if (error) {
      results.tests.push({ name: 'Get Notifications', status: 'FAIL', message: error })
      results.failed++
    } else {
      results.tests.push({ name: 'Get Notifications', status: 'PASS', message: `Found ${data?.notifications?.length || 0} notifications` })
      results.passed++
    }
  } catch (e: any) {
    results.tests.push({ name: 'Get Notifications', status: 'FAIL', message: e.message })
    results.failed++
  }

  // Print Results
  console.log('\n📊 Test Results:')
  console.log('================')
  results.tests.forEach(test => {
    const icon = test.status === 'PASS' ? '✅' : '❌'
    console.log(`${icon} ${test.name}: ${test.message}`)
  })
  console.log('\n================')
  console.log(`Total: ${results.passed + results.failed} tests`)
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log('================\n')

  return results
}

// Usage in a component:
// import { testBackendAPI } from '@/lib/api/test-api'
// 
// function TestButton() {
//   const handleTest = async () => {
//     const results = await testBackendAPI()
//     console.log('Test completed:', results)
//   }
//   
//   return <button onClick={handleTest}>Test Backend API</button>
// }
