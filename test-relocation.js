#!/usr/bin/env node

// Test script to verify correct relocation of reading time estimate
const fs = require('fs');

// Test PR descriptions with reading time in wrong place
const testCase = {
  name: "PR with reading time in wrong position",
  input: `## Overview


**📖 Review time: ~5 minutes**
Major refactoring to establish proper application architecture with separation of concerns, security enhancements, and production-ready patterns.

## Changes Summary`,
  expected: `## Overview

Major refactoring to establish proper application architecture with separation of concerns, security enhancements, and production-ready patterns.

**📖 Review time: ~20 minutes**

## Changes Summary`
};

console.log("Testing PR description relocation...\n");

// Write test input to file
fs.writeFileSync('/tmp/test-desc.txt', testCase.input);

// Run the update script
const { execSync } = require('child_process');
const result = execSync(
  'node scripts/update-pr-description.js --time "~20 minutes" --description-file /tmp/test-desc.txt',
  { encoding: 'utf8' }
).trim();

console.log("Input:");
console.log(testCase.input);
console.log("\nExpected:");
console.log(testCase.expected);
console.log("\nActual:");
console.log(result);

if (result === testCase.expected) {
  console.log("\n✅ PASSED - Reading time relocated correctly!");
} else {
  console.log("\n❌ FAILED - Reading time not relocated properly");
}