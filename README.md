# PR Reading Time Estimator

A GitHub Action that automatically estimates and displays the reading/review time for pull requests.

## 🚀 Quick Start (30 seconds)

### Option 1: One-Line Setup
```bash
curl -fsSL https://raw.githubusercontent.com/micahstubbs/pr-reading-time/main/setup.sh | bash
```

### Option 2: GitHub Action (Recommended)
```yaml
# .github/workflows/pr-reading-time.yml
name: PR Reading Time

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  pull-requests: write

jobs:
  reading-time:
    runs-on: ubuntu-latest
    steps:
      - uses: micahstubbs/pr-reading-time@v1
```

That's it! The action will now automatically add reading time estimates to all PRs.

## Features

- 🕐 **Automatic Time Estimation**: Calculates review time based on PR complexity
- 📝 **Smart PR Description Updates**: Adds reading time below the first header
- 🎯 **File-Type Aware**: Different reading speeds for code, docs, tests, and config
- 🔄 **Auto-Updates**: Recalculates when PR is updated
- 📊 **Intelligent Calculation**: Considers file complexity and security-critical code

## Configuration Options

### Basic Usage
No configuration needed! Just use the action as shown above.

### Advanced Options
```yaml
- uses: micahstubbs/pr-reading-time@v1
  with:
    # Post as comment instead of updating description
    comment-instead: 'true'

    # Use custom GitHub token
    github-token: ${{ secrets.CUSTOM_TOKEN }}

    # Disable description updates
    update-description: 'false'
```

### Manual Setup (if not using the action)

If you prefer to copy the files directly:

1. Copy `.github/workflows/pr-reading-time.yml` to your repository
2. Copy the `scripts/` directory to your repository root
3. Ensure the workflow has `pull-requests: write` permission

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

This PR addresses the critical authentication bug...

**📖 Review time: ~15 minutes**
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

Apache-2.0