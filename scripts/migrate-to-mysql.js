#!/usr/bin/env node

/**
 * Migration script to help transition from Supabase to MySQL
 * This script will help you update your components to use the new database service
 */

const fs = require('fs')
const path = require('path')

const SUPABASE_IMPORTS = [
  "import { supabase } from '@/lib/supabase'",
  "import { supabase } from '../lib/supabase'",
  "import { supabase } from '../../lib/supabase'",
  "import { supabase, gamificationService } from '@/lib/supabase'",
]

const NEW_IMPORTS = [
  "import { db, gamificationService } from '@/lib/database'",
]

const SUPABASE_PATTERNS = [
  {
    pattern: /supabase\.from\('([^']+)'\)\.select\('([^']+)'\)/g,
    replacement: "db.select('$1', '$2')"
  },
  {
    pattern: /supabase\.from\('([^']+)'\)\.select\(\)/g,
    replacement: "db.select('$1')"
  },
  {
    pattern: /supabase\.from\('([^']+)'\)\.insert\(([^)]+)\)/g,
    replacement: "db.insert('$1', $2)"
  },
  {
    pattern: /supabase\.from\('([^']+)'\)\.update\(([^)]+)\)\.eq\('([^']+)',\s*([^)]+)\)/g,
    replacement: "db.update('$1', $2, { $3: $4 })"
  },
  {
    pattern: /supabase\.from\('([^']+)'\)\.delete\(\)\.eq\('([^']+)',\s*([^)]+)\)/g,
    replacement: "db.delete('$1', { $2: $3 })"
  }
]

function findFiles(dir, extension = '.tsx') {
  let results = []
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results = results.concat(findFiles(filePath, extension))
    } else if (file.endsWith(extension) || file.endsWith('.ts')) {
      results.push(filePath)
    }
  }
  
  return results
}

function migrateFile(filePath) {
  console.log(`Processing: ${filePath}`)
  
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false
  
  // Replace imports
  SUPABASE_IMPORTS.forEach(oldImport => {
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, NEW_IMPORTS[0])
      modified = true
      console.log(`  ✓ Updated import`)
    }
  })
  
  // Replace Supabase patterns
  SUPABASE_PATTERNS.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement)
      modified = true
      console.log(`  ✓ Updated Supabase query pattern`)
    }
  })
  
  // Handle .single() calls
  if (content.includes('.single()')) {
    content = content.replace(/\.single\(\)/g, '')
    console.log(`  ✓ Removed .single() calls (handled by db.findOne)`)
    modified = true
  }
  
  // Handle .eq() chains
  const eqPattern = /\.eq\('([^']+)',\s*([^)]+)\)/g
  if (eqPattern.test(content)) {
    // This is more complex and might need manual review
    console.log(`  ⚠️  Found .eq() chains - may need manual review`)
  }
  
  if (modified) {
    // Create backup
    fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath))
    fs.writeFileSync(filePath, content)
    console.log(`  ✓ File updated (backup created)`)
  }
}

function main() {
  console.log('🚀 Starting Supabase to MySQL migration...\n')
  
  // Check if database.ts exists
  if (!fs.existsSync('lib/database.ts')) {
    console.error('❌ lib/database.ts not found. Please ensure the migration files are in place.')
    process.exit(1)
  }
  
  // Find all TypeScript/React files
  const files = [
    ...findFiles('components'),
    ...findFiles('app'),
    ...findFiles('lib'),
    ...findFiles('contexts'),
    ...findFiles('hooks')
  ].filter(file => !file.includes('.backup'))
  
  console.log(`Found ${files.length} files to process\n`)
  
  files.forEach(migrateFile)
  
  console.log('\n✅ Migration complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Install MySQL driver: npm install mysql2')
  console.log('2. Set up your .env.local with database credentials')
  console.log('3. Import mysql-schema.sql to your database')
  console.log('4. Test your application thoroughly')
  console.log('5. Review files marked with ⚠️  for manual updates')
  console.log('\n💡 Backup files (.backup) have been created for modified files')
}

if (require.main === module) {
  main()
}

module.exports = { migrateFile, findFiles }