#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : null;
};

const getBoolArg = (name) => {
  return args.includes(`--${name}`);
};

const additions = parseInt(getArg('additions') || '0');
const deletions = parseInt(getArg('deletions') || '0');
const changedFiles = parseInt(getArg('files') || '0');
const fileDetailsPath = getArg('file-details');
const includeDocs = getBoolArg('include-docs');  // Default false

// Reading speed constants (lines per minute)
const READING_SPEEDS = {
  documentation: 250,  // words per minute for docs
  code: 50,           // lines per minute for code review
  config: 100,        // lines per minute for config files
  test: 75,           // lines per minute for test files
  generated: 200,     // lines per minute for generated files
  default: 50         // default lines per minute
};

// File type patterns
const FILE_PATTERNS = {
  documentation: /\.(md|txt|rst|adoc)$/i,
  test: /(\.(test|spec)\.|__(tests|specs)__|\/tests?\/|\/specs?\/).*\.(js|jsx|ts|tsx|py|java|go|rs|cpp|c)$/i,
  config: /\.(json|yaml|yml|toml|ini|cfg|conf|xml|properties)$/i,
  generated: /(\.min\.|\.map$|dist\/|build\/|node_modules\/|vendor\/)$/i,
  lockFiles: /(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|composer\.lock|Gemfile\.lock|Pipfile\.lock|poetry\.lock)$/i,
  dataFiles: /\.(json|csv)$/i,
  critical: /(auth|security|crypto|password|token|secret|key|private)/i,
  frontend: /\.(jsx?|tsx?|vue|svelte)$/i,
  backend: /\.(py|java|go|rs|php|rb|scala|kt)$/i,
  style: /\.(css|scss|sass|less|styl)$/i
};

// Calculate reading time for a specific file
function calculateFileReadingTime(filename, changes, additions, deletions) {
  // Skip lock files entirely
  if (FILE_PATTERNS.lockFiles.test(filename)) {
    return 0;
  }

  let speed = READING_SPEEDS.default;
  let complexity = 1.0;
  let totalLines = additions + deletions;

  // Cap .json and .csv files at 80 lines for reading time calculation
  if (FILE_PATTERNS.dataFiles.test(filename) && totalLines > 80) {
    totalLines = 80;
  }

  // Determine file type and base reading speed
  if (FILE_PATTERNS.documentation.test(filename)) {
    // For docs, estimate words (roughly 10 chars per word)
    const words = (totalLines * 10) / 10;
    return words / READING_SPEEDS.documentation;
  } else if (FILE_PATTERNS.generated.test(filename)) {
    speed = READING_SPEEDS.generated;
  } else if (FILE_PATTERNS.test.test(filename)) {
    speed = READING_SPEEDS.test;
  } else if (FILE_PATTERNS.config.test(filename)) {
    speed = READING_SPEEDS.config;
  } else {
    speed = READING_SPEEDS.code;
  }

  // Apply complexity multipliers
  if (FILE_PATTERNS.critical.test(filename)) {
    complexity *= 1.5;  // Critical files need more careful review
  }

  if (changes > 500) {
    complexity *= 1.2;  // Large files take proportionally longer
  }

  return (totalLines / speed) * complexity;
}

// Main calculation
function calculateTotalReadingTime() {
  let totalMinutes = 0;
  let docsMinutes = 0;
  let skippedFiles = [];
  const fileStats = [];
  const docsStats = [];

  // Read file details if provided
  if (fileDetailsPath && fs.existsSync(fileDetailsPath)) {
    const fileDetails = fs.readFileSync(fileDetailsPath, 'utf-8').split('\n').filter(Boolean);

    for (const line of fileDetails) {
      const [filename, changes, adds, dels] = line.split(':');
      const fileChanges = parseInt(changes || '0');
      const fileAdds = parseInt(adds || '0');
      const fileDels = parseInt(dels || '0');

      // Skip lock files
      if (FILE_PATTERNS.lockFiles.test(filename)) {
        skippedFiles.push(filename);
        continue;
      }

      const fileTime = calculateFileReadingTime(filename, fileChanges, fileAdds, fileDels);

      const fileStat = {
        filename,
        changes: fileChanges,
        additions: fileAdds,
        deletions: fileDels,
        minutes: fileTime
      };

      // Note if file was capped
      if (FILE_PATTERNS.dataFiles.test(filename) && (fileAdds + fileDels) > 80) {
        fileStat.capped = true;
        fileStat.originalLines = fileAdds + fileDels;
      }

      // Separate markdown files from code files
      if (FILE_PATTERNS.documentation.test(filename) && filename.endsWith('.md')) {
        docsMinutes += fileTime;
        docsStats.push(fileStat);
        if (includeDocs) {
          totalMinutes += fileTime;
          fileStats.push(fileStat);
        }
      } else {
        totalMinutes += fileTime;
        fileStats.push(fileStat);
      }
    }
  } else {
    // Fallback to simple calculation if no file details
    const totalLines = additions + deletions;
    totalMinutes = totalLines / READING_SPEEDS.code;
  }

  // Apply overall complexity multipliers
  if (changedFiles > 20) {
    totalMinutes *= 1.2;  // Many files multiplier
  } else if (changedFiles > 10) {
    totalMinutes *= 1.1;
  }

  // Add base overhead for context switching between files
  if (changedFiles > 1) {
    totalMinutes += changedFiles * 0.5;  // 30 seconds per file for context
  }

  return {
    totalMinutes,
    docsMinutes,
    fileStats,
    docsStats,
    skippedFiles,
    summary: {
      totalFiles: changedFiles,
      totalAdditions: additions,
      totalDeletions: deletions,
      totalChanges: additions + deletions,
      docsExcluded: !includeDocs && docsStats.length > 0,
      filesSkipped: skippedFiles.length
    }
  };
}

// Format the reading time for display
function formatReadingTime(minutes) {
  if (minutes < 1) {
    return '< 1 minute';
  } else if (minutes <= 5) {
    return `~${Math.round(minutes)} minute${Math.round(minutes) > 1 ? 's' : ''}`;
  } else if (minutes <= 60) {
    const rounded = Math.round(minutes / 5) * 5;  // Round to nearest 5
    return `~${rounded} minutes`;
  } else {
    // Always show actual time, no matter how large
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round((minutes % 60) / 15) * 15;  // Round to nearest 15
    if (remainingMinutes === 0) {
      return `~${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `~${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
  }
}

// Generate detailed breakdown (for logging)
function generateBreakdown(result) {
  const lines = [];
  lines.push('📊 Reading Time Breakdown:');
  lines.push(`   Total changes: ${result.summary.totalChanges} lines across ${result.summary.totalFiles} files`);
  lines.push(`   Additions: +${result.summary.totalAdditions}`);
  lines.push(`   Deletions: -${result.summary.totalDeletions}`);

  // Show skipped files if any
  if (result.skippedFiles.length > 0) {
    lines.push(`   Lock files excluded: ${result.skippedFiles.length} file${result.skippedFiles.length > 1 ? 's' : ''}`);
  }

  // Show documentation time separately if excluded
  if (result.summary.docsExcluded && result.docsStats.length > 0) {
    const docsTime = formatReadingTime(result.docsMinutes);
    lines.push(`   Documentation (${result.docsStats.length} .md files): ${docsTime} [excluded from total]`);
  }

  if (result.fileStats.length > 0 && result.fileStats.length <= 10) {
    lines.push('   Top files by review time:');
    const topFiles = result.fileStats
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);

    for (const file of topFiles) {
      const time = formatReadingTime(file.minutes);
      let label = path.basename(file.filename);
      if (file.capped) {
        label += ` (capped from ${file.originalLines} lines)`;
      }
      lines.push(`   • ${label}: ${time}`);
    }
  }

  return lines.join('\n');
}

// Main execution
try {
  const result = calculateTotalReadingTime();
  const formattedTime = formatReadingTime(result.totalMinutes);

  // Write the formatted time to file for the workflow to read
  fs.writeFileSync('reading-time.txt', formattedTime);

  // Log detailed breakdown to console
  console.log(generateBreakdown(result));
  console.log(`\n✅ Estimated reading time: ${formattedTime}`);
  if (!includeDocs && result.docsStats.length > 0) {
    console.log(`   (Excluding ${result.docsStats.length} markdown file${result.docsStats.length > 1 ? 's' : ''})`);
  }

  // Also save detailed stats for potential future use
  fs.writeFileSync('reading-stats.json', JSON.stringify(result, null, 2));

  process.exit(0);
} catch (error) {
  console.error('❌ Error calculating reading time:', error.message);
  // Write a default time in case of error
  fs.writeFileSync('reading-time.txt', '~5 minutes');
  process.exit(1);
}