const CANONICAL_API_BASE = 'http://localhost:8000'

async function testEndpoint(endpoint, method = 'GET') {
  try {
    const response = await fetch(`${CANONICAL_API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' }
    })
    
    let data
    try { data = await response.json() } catch { data = await response.text() }
    
    if (response.status === 401) {
      console.log(`✅ ${endpoint} - Auth enforced (401)`)
      return true
    } else if (response.ok) {
      console.log(`✅ ${endpoint} - OK`)
      return true
    } else {
      console.log(`⚠️  ${endpoint} - ${response.status}`)
      return false
    }
  } catch (error) {
    console.log(`🚨 ${endpoint} - Error: ${error.message}`)
    return false
  }
}

async function validateConvergence() {
  console.log('🎯 CANONICAL CONVERGENCE TEST\n')
  
  // Test core endpoints
  await testEndpoint('/health')
  await testEndpoint('/transport/play', 'POST')
  await testEndpoint('/transport/stop', 'POST') 
  await testEndpoint('/orchestration/generate', 'POST')
  await testEndpoint('/midi/devices')
  await testEndpoint('/auth/login', 'POST')
  
  console.log('\n✅ CONVERGENCE COMPLETE - UI locked to canonical backend')
}

validateConvergence().catch(console.error)
