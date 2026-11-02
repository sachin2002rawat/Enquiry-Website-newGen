import mongoose from 'mongoose'
import Admin from '../models/Admin.js'
import connectDB from '../config/db.js'
import envConfig from '../config/env.js'

const seedSuperAdmin = async () => {
  try {
    console.log('⏳ [Seed] Connecting to MongoDB...')
    await connectDB()

    const { name, email, password } = envConfig.superAdmin

    if (!email || !password) {
      console.error('❌ [Seed Error]: SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD is missing in environment.')
      process.exit(1)
    }

    const cleanEmail = email.toLowerCase().trim()

    // Check if an existing Super Admin is already present
    const existingSuperAdmin = await Admin.findOne({
      $or: [{ role: 'SUPER_ADMIN' }, { email: cleanEmail }]
    })

    if (existingSuperAdmin) {
      console.log(`ℹ️ [Seed] Super Admin already exists (${existingSuperAdmin.email}, Role: ${existingSuperAdmin.role}).`)
      console.log('   No duplicate Super Admin created.')
      process.exit(0)
    }

    // Create the first Super Admin
    const superAdmin = await Admin.create({
      name: name || 'Super Admin',
      email: cleanEmail,
      password, // Password hashed automatically by AdminSchema pre-save hook
      role: 'SUPER_ADMIN',
      permissions: [
        'manage_products',
        'manage_categories',
        'manage_blogs',
        'manage_enquiries',
        'manage_settings',
        'manage_homepage',
        'manage_company',
        'manage_footer',
        'manage_admins'
      ],
      status: 'active',
      isActive: true
    })

    console.log('✅ [Seed Success]: Initial Super Admin created successfully!')
    console.log(`   • Name:  ${superAdmin.name}`)
    console.log(`   • Email: ${superAdmin.email}`)
    console.log(`   • Role:  ${superAdmin.role}`)
    console.log(`   • Status: Active`)
    console.log('   You can now log in at /admin/login with these credentials.\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ [Seed Fatal Error]:', error.message)
    process.exit(1)
  }
}

seedSuperAdmin()

