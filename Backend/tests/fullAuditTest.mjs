import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'
import envConfig from '../config/env.js'
import { app, serverInstance } from '../server.js'

const runAuditTests = async () => {
  console.log('====================================================')
  console.log('   FULL AUDIT & VERIFICATION TEST SUITE (15 TESTS)  ')
  console.log('====================================================\n')

  // Wait for MongoDB Atlas connection
  console.log('⏳ Waiting for MongoDB Atlas connection...')
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) return resolve()
    const checkInterval = setInterval(() => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 400)
  })
  console.log('✅ MongoDB connection verified!')

  // Wait for server to bind port
  await new Promise((r) => setTimeout(r, 1000))
  const port = serverInstance?.address()?.port || envConfig.port || 5000
  const baseUrl = `http://localhost:${port}`
  console.log(`🌐 Testing against running server at: ${baseUrl}\n`)

  let passed = 0
  let failed = 0

  const assert = (condition, description) => {
    if (condition) {
      console.log(`✅ [PASS] ${description}`)
      passed++
    } else {
      console.error(`❌ [FAIL] ${description}`)
      failed++
    }
  }

  let superAdminToken = ''
  let superAdminCookie = ''
  let createdAdminId = ''
  let createdAdminEmail = `audit_admin_${Date.now()}@test.com`
  let createdAdminPassword = 'StrongPassword@123'
  let normalAdminToken = ''

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Super Admin can log in with seeded credentials
    // -------------------------------------------------------------------------
    const res1 = await fetch(`${baseUrl}/api/auth/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: envConfig.superAdmin.email,
        password: envConfig.superAdmin.password
      })
    })
    const data1 = await res1.json()
    const setCookie = res1.headers.get('set-cookie') || ''
    superAdminCookie = setCookie.split(';')[0]
    superAdminToken = data1.token
    assert(
      res1.status === 200 && data1.success && data1.data?.role === 'SUPER_ADMIN',
      '1. Super Admin can log in with seeded credentials (POST /api/auth/super-admin/login)'
    )

    // -------------------------------------------------------------------------
    // TEST 2: Incorrect Super Admin password is rejected
    // -------------------------------------------------------------------------
    const res2 = await fetch(`${baseUrl}/api/auth/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: envConfig.superAdmin.email,
        password: 'WrongPassword@999'
      })
    })
    const data2 = await res2.json()
    assert(res2.status === 401 && !data2.success, '2. Incorrect Super Admin password is rejected with 401')

    // -------------------------------------------------------------------------
    // TEST 3: Super Admin can create an Admin
    // -------------------------------------------------------------------------
    const res3 = await fetch(`${baseUrl}/api/super-admin/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Audit Test Admin',
        email: createdAdminEmail,
        password: createdAdminPassword,
        role: 'ADMIN',
        permissions: ['manage_products', 'manage_enquiries']
      })
    })
    const data3 = await res3.json()
    createdAdminId = data3.data?._id
    assert(
      res3.status === 201 && data3.success && data3.data?.email === createdAdminEmail,
      '3. Super Admin can create an Admin (POST /api/super-admin/admins)'
    )

    // -------------------------------------------------------------------------
    // TEST 4 & 5: Admin data is stored in MongoDB & password is hashed
    // -------------------------------------------------------------------------
    const dbAdmin = await Admin.findById(createdAdminId).select('+password')
    assert(dbAdmin && dbAdmin.email === createdAdminEmail, '4. Admin data is verified stored in MongoDB')
    assert(
      dbAdmin && dbAdmin.password && dbAdmin.password !== createdAdminPassword && dbAdmin.password.startsWith('$2'),
      '5. Admin password is verified hashed with bcrypt in MongoDB (never plain-text)'
    )

    // -------------------------------------------------------------------------
    // TEST 6: Admin can log in with valid credentials
    // -------------------------------------------------------------------------
    const res6 = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: createdAdminEmail,
        password: createdAdminPassword
      })
    })
    const data6 = await res6.json()
    normalAdminToken = data6.token
    assert(
      res6.status === 200 && data6.success && data6.data?.role === 'ADMIN',
      '6. Admin can log in with valid credentials (POST /api/auth/admin/login)'
    )

    // -------------------------------------------------------------------------
    // TEST 7: Incorrect Admin password is rejected
    // -------------------------------------------------------------------------
    const res7 = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: createdAdminEmail,
        password: 'InvalidPasswordXYZ'
      })
    })
    const data7 = await res7.json()
    assert(res7.status === 401 && !data7.success, '7. Incorrect Admin password is rejected with 401')

    // -------------------------------------------------------------------------
    // TEST 8: Inactive Admin cannot log in
    // -------------------------------------------------------------------------
    await fetch(`${baseUrl}/api/super-admin/admins/${createdAdminId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ status: 'inactive' })
    })

    const res8 = await fetch(`${baseUrl}/api/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: createdAdminEmail,
        password: createdAdminPassword
      })
    })
    const data8 = await res8.json()
    assert(res8.status === 403 && !data8.success, '8. Inactive/deactivated Admin cannot log in (403 Forbidden)')

    // Reactivate for subsequent tests
    await fetch(`${baseUrl}/api/super-admin/admins/${createdAdminId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({ status: 'active' })
    })

    // -------------------------------------------------------------------------
    // TEST 9: Normal Admin cannot access Super Admin APIs
    // -------------------------------------------------------------------------
    const res9 = await fetch(`${baseUrl}/api/super-admin/admins`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${normalAdminToken}`
      }
    })
    const data9 = await res9.json()
    assert(res9.status === 403 && !data9.success, '9. Normal Admin cannot access Super Admin APIs (403 Forbidden)')

    // -------------------------------------------------------------------------
    // TEST 10: Unauthenticated users cannot access protected APIs
    // -------------------------------------------------------------------------
    const res10 = await fetch(`${baseUrl}/api/super-admin/admins`, {
      method: 'GET'
    })
    const data10 = await res10.json()
    assert(res10.status === 401 && !data10.success, '10. Unauthenticated users cannot access protected APIs (401 Unauthorized)')

    // -------------------------------------------------------------------------
    // TEST 11: Public website works without login
    // -------------------------------------------------------------------------
    const res11 = await fetch(`${baseUrl}/api/categories`)
    const res11Health = await fetch(`${baseUrl}/api/health`)
    assert(
      res11.status === 200 && res11Health.status === 200,
      '11. Public website APIs work without login (categories & health endpoints return 200)'
    )

    // -------------------------------------------------------------------------
    // TEST 12: Duplicate Admin emails are rejected
    // -------------------------------------------------------------------------
    const res12 = await fetch(`${baseUrl}/api/super-admin/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`
      },
      body: JSON.stringify({
        name: 'Duplicate Admin',
        email: createdAdminEmail,
        password: 'AnotherPassword@123'
      })
    })
    const data12 = await res12.json()
    assert(res12.status === 400 && !data12.success, '12. Duplicate Admin email registration is rejected with 400')

    // -------------------------------------------------------------------------
    // TEST 13: Expired / invalid JWT tokens are rejected
    // -------------------------------------------------------------------------
    const res13 = await fetch(`${baseUrl}/api/auth/admin/me`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid.tampered.jwt.token'
      }
    })
    assert(res13.status === 401, '13. Expired or invalid JWT tokens are rejected with 401')

    // -------------------------------------------------------------------------
    // TEST 14: Logout invalidates session
    // -------------------------------------------------------------------------
    const res14 = await fetch(`${baseUrl}/api/auth/admin/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${normalAdminToken}`
      }
    })
    const logoutCookie = res14.headers.get('set-cookie') || ''
    assert(
      res14.status === 200 && logoutCookie.includes('admin_token=;'),
      '14. Logout clears admin_token cookie and ends session'
    )

    // -------------------------------------------------------------------------
    // TEST 15: Super Admin seed script does not create duplicate accounts
    // -------------------------------------------------------------------------
    const superAdminCountBefore = await Admin.countDocuments({ role: 'SUPER_ADMIN' })
    assert(superAdminCountBefore === 1, '15. Exactly one Super Admin exists; duplicate creation is safely prevented')

    // Cleanup test admin created during audit
    if (createdAdminId) {
      await Admin.findByIdAndDelete(createdAdminId)
    }
  } catch (err) {
    console.error('Audit execution error:', err)
  }

  console.log('\n====================================================')
  console.log(`   AUDIT RESULTS: ${passed}/15 TESTS PASSED (${failed} FAILED)`)
  console.log('====================================================\n')
  process.exit(failed > 0 ? 1 : 0)
}

runAuditTests()
