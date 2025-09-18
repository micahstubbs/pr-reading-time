#!/usr/bin/env node

// Test script to verify correct placement of reading time estimate
const fs = require('fs');

// Test PR descriptions
const testCases = [
  {
    name: "Standard PR with Overview header",
    input: `## Overview

Major refactoring to establish proper application architecture with separation of concerns, security enhancements, and production-ready patterns.

### Changes Summary`,
    expected: `## Overview

Major refactoring to establish proper application architecture with separation of concerns, security enhancements, and production-ready patterns.

**📖 Review time: ~20 minutes**

### Changes Summary`
  },
  {
    name: "PR with Summary header",
    input: `## Summary

This PR fixes the authentication bug that was causing users to be logged out.

### What's Changed`,
    expected: `## Summary

This PR fixes the authentication bug that was causing users to be logged out.

**📖 Review time: ~20 minutes**

### What's Changed`
  },
  {
    name: "PR with single line after header",
    input: `## Description
Fixed a small typo in the documentation.`,
    expected: `## Description
Fixed a small typo in the documentation.

**📖 Review time: ~20 minutes**`
  },
  {
    name: "Update existing reading time",
    input: `## Overview

Major refactoring to establish proper application architecture.

**📖 Review time: ~5 minutes**

### Changes`,
    expected: `## Overview

Major refactoring to establish proper application architecture.

**📖 Review time: ~20 minutes**

### Changes`
  }
];

// Run tests
console.log("Testing PR description placement...\n");

testCases.forEach((test, index) => {
  console.log(`Test ${index + 1}: ${test.name}`);

  // Write test input to file
  fs.writeFileSync('/tmp/test-desc.txt', test.input);

  // Run the update script
  const { execSync } = require('child_process');
  const result = execSync(
    'node scripts/update-pr-description.js --time "~20 minutes" --description-file /tmp/test-desc.txt',
    { encoding: 'utf8' }
  ).trim();

  if (result === test.expected) {
    console.log("✅ PASSED\n");
  } else {
    console.log("❌ FAILED");
    console.log("Expected:");
    console.log(test.expected);
    console.log("\nActual:");
    console.log(result);
    console.log("\n");
  }
});

console.log("Testing complete!");