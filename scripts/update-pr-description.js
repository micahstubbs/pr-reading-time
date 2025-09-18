#!/usr/bin/env node

const fs = require('fs');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

const readingTime = getArg('time') || '~5 minutes';
const descriptionFile = getArg('description-file');

// Reading time badge/indicator
const READING_TIME_INDICATOR = `**📖 Estimated review time: ${readingTime}**`;
const READING_TIME_PATTERN = /\*\*📖 Estimated review time:.*?\*\*/;

// Function to find the position after the first header
function findInsertPosition(description) {
  const lines = description.split('\n');
  let headerFound = false;
  let insertIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a markdown header
    if (/^#{1,6}\s/.test(line.trim())) {
      headerFound = true;

      // Find the next non-empty line after the header
      for (let j = i + 1; j <= lines.length; j++) {
        if (j === lines.length) {
          // End of description, insert here
          insertIndex = j;
          break;
        }

        const nextLine = lines[j].trim();

        // If we find content (not empty line), insert before it
        if (nextLine) {
          // Check if it's already a reading time indicator
          if (READING_TIME_PATTERN.test(nextLine)) {
            // Replace existing indicator
            lines[j] = READING_TIME_INDICATOR;
            return lines.join('\n');
          }
          // Insert before this content
          insertIndex = j;
          break;
        }
      }

      // Insert the reading time indicator
      lines.splice(insertIndex, 0, '', READING_TIME_INDICATOR);
      return lines.join('\n');
    }
  }

  // No header found, check if description already has reading time
  if (READING_TIME_PATTERN.test(description)) {
    // Replace existing
    return description.replace(READING_TIME_PATTERN, READING_TIME_INDICATOR);
  }

  // No header and no existing time, add at the beginning
  if (description.trim()) {
    return `${READING_TIME_INDICATOR}\n\n${description}`;
  } else {
    return READING_TIME_INDICATOR;
  }
}

// Function to update PR description with reading time
function updatePRDescription(currentDescription) {
  // Handle null/undefined description
  const description = currentDescription || '';

  // Check if reading time already exists and update it
  if (READING_TIME_PATTERN.test(description)) {
    return description.replace(READING_TIME_PATTERN, READING_TIME_INDICATOR);
  }

  // Find position and insert
  return findInsertPosition(description);
}

// Main execution
try {
  let currentDescription = '';

  // Read current description from file if provided
  if (descriptionFile && fs.existsSync(descriptionFile)) {
    currentDescription = fs.readFileSync(descriptionFile, 'utf-8');
  }

  // Update the description
  const updatedDescription = updatePRDescription(currentDescription);

  // Output the updated description
  console.log(updatedDescription);

  process.exit(0);
} catch (error) {
  console.error('❌ Error updating PR description:', error.message);
  // Output original description in case of error
  if (descriptionFile && fs.existsSync(descriptionFile)) {
    console.log(fs.readFileSync(descriptionFile, 'utf-8'));
  }
  process.exit(1);
}