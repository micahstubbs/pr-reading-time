# PR Reading Time Estimator

A GitHub Action that automatically estimates and displays the reading/review time for pull requests.

## Features

- 🕐 **Automatic Time Estimation**: Calculates review time based on PR complexity
- 📝 **Smart PR Description Updates**: Adds reading time below the first header
- 🎯 **File-Type Aware**: Different reading speeds for code, docs, tests, and config
- 🔄 **Auto-Updates**: Recalculates when PR is updated
- 📊 **Intelligent Calculation**: Considers file complexity and security-critical code

## Setup

1. **Add the workflow to your repository**:

   Copy `.github/workflows/pr-reading-time.yml` to your repository's `.github/workflows/` directory.

2. **Copy the scripts**:

   Copy the `scripts/` directory to your repository root:
   - `calculate-reading-time.js` - Calculates the reading time
   - `update-pr-description.js` - Updates PR description

3. **Ensure permissions**:

   The workflow uses the default `GITHUB_TOKEN` which needs:
   - `contents: read` - To fetch PR diff
   - `pull-requests: write` - To update PR description

## How It Works

The action triggers on PR events (opened, synchronize, reopened) and:

1. Fetches PR statistics (additions, deletions, changed files)
2. Analyzes each file for complexity and type
3. Calculates estimated reading time using:
   - **Code**: ~50 lines/minute
   - **Tests**: ~75 lines/minute
   - **Config**: ~100 lines/minute
   - **Documentation**: ~250 words/minute
   - **Critical files** (auth, security): 1.5x multiplier
4. Updates PR description with the estimate

## Example Output

Your PR description will be updated like this:

```markdown
## Fix authentication flow

**📖 Estimated review time: ~15 minutes**

This PR addresses the critical authentication bug...
```

## Calculation Formula

```
Base Time = (Lines Changed / Reading Speed)
Final Time = Base Time × Complexity Multipliers

Complexity Multipliers:
- Critical files (security, auth): 1.5x
- Large files (>500 lines): 1.2x
- Many files (>10): 1.1x
- File context switching: +0.5 min/file
```

## Customization

### Adjust Reading Speeds

Edit `scripts/calculate-reading-time.js`:

```javascript
const READING_SPEEDS = {
  documentation: 250,  // words per minute
  code: 50,           // lines per minute
  config: 100,        // lines per minute
  test: 75,           // lines per minute
};
```

### Modify File Patterns

Customize which files are considered critical, tests, etc.:

```javascript
const FILE_PATTERNS = {
  critical: /(auth|security|crypto|password)/i,
  test: /\.(test|spec)\./i,
  // Add your patterns...
};
```

### Change Time Format

Modify the `formatReadingTime()` function in `calculate-reading-time.js` to change how time is displayed.

## Testing Locally

Run the test script to verify the scripts work correctly:

```bash
chmod +x test-scripts.sh
./test-scripts.sh
```

## Limitations

- Estimates are approximations based on line counts
- Binary files are excluded from calculation
- Requires Node.js 20+ in the GitHub Action environment

## Contributing

Feel free to submit issues and PRs to improve the estimation accuracy!

## License

MIT