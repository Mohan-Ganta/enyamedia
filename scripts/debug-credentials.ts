#!/usr/bin/env tsx

/**
 * Debug AWS Credentials
 * This script examines the credentials character by character to identify issues
 */

import { config } from 'dotenv'

config()

function debugCredentials() {
  console.log('🔍 AWS Credentials Debug\n')
  
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
  
  console.log('Access Key ID Analysis:')
  if (accessKeyId) {
    console.log(`  Length: ${accessKeyId.length}`)
    console.log(`  Value: "${accessKeyId}"`)
    console.log(`  Char codes: [${accessKeyId.split('').map(c => c.charCodeAt(0)).join(', ')}]`)
    console.log(`  Starts with AKIA: ${accessKeyId.startsWith('AKIA')}`)
  } else {
    console.log('  ❌ Missing')
  }
  
  console.log('\nSecret Access Key Analysis:')
  if (secretAccessKey) {
    console.log(`  Length: ${secretAccessKey.length}`)
    console.log(`  First 10 chars: "${secretAccessKey.substring(0, 10)}"`)
    console.log(`  Last 10 chars: "${secretAccessKey.substring(secretAccessKey.length - 10)}"`)
    console.log(`  Contains only valid chars: ${/^[A-Za-z0-9+/]+$/.test(secretAccessKey)}`)
    console.log(`  Char codes (first 10): [${secretAccessKey.substring(0, 10).split('').map(c => c.charCodeAt(0)).join(', ')}]`)
  } else {
    console.log('  ❌ Missing')
  }
  
  // Test basic AWS SDK credential validation
  console.log('\n🧪 Testing credential object creation:')
  try {
    const credentials = {
      accessKeyId: accessKeyId || '',
      secretAccessKey: secretAccessKey || ''
    }
    
    // Basic validation
    if (!credentials.accessKeyId || !credentials.secretAccessKey) {
      console.log('❌ Missing required credentials')
    } else if (credentials.accessKeyId.length !== 20) {
      console.log('❌ Access Key ID wrong length')
    } else if (credentials.secretAccessKey.length !== 40) {
      console.log('❌ Secret Access Key wrong length')
    } else {
      console.log('✅ Credential object structure looks valid')
    }
    
  } catch (error) {
    console.log('❌ Error creating credential object:', error)
  }
}

debugCredentials()