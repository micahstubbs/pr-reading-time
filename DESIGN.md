# PR Reading Time Estimator - Design Document

## Overview
This GitHub Action estimates the reading/review time for pull requests and automatically updates the PR description with the estimated time.

## Architecture

### Components

1. **GitHub Workflow** (`.github/workflows/pr-reading-time.yml`)
   - Triggers on PR events (opened, synchronize, edited)
   - Fetches PR diff and metadata
   - Calls reading time estimation script
   - Updates PR description via GitHub API

2. **Reading Time Calculator** (`scripts/calculate-reading-time.js`)
   - Analyzes PR diff statistics
   - Calculates estimated reading time based on:
     - Lines of code changed (additions + deletions)
     - Number of files modified
     - File complexity (language-specific weights)
     - Comments and documentation changes

### Calculation Formula

```
Base calculation:
- Code changes: ~50 lines per minute for reviewing
- Documentation/markdown: ~250 words per minute
- Configuration files: ~100 lines per minute
- Test files: ~75 lines per minute

Complexity multipliers:
- Critical files (e.g., security, auth): 1.5x
- Large files (>500 lines): 1.2x
- Many files (>10): 1.1x

Final time = Base time * Complexity multiplier
```

### PR Description Update Strategy

The action will:
1. Parse existing PR description
2. Find the first header (# or ##)
3. Insert reading time estimate on the line immediately after the header
4. Preserve all other content

Format:
```markdown
## Pull Request Title

**📖 Estimated review time: ~5 minutes**

Rest of the PR description...
```

## Implementation Details

### GitHub Workflow Configuration

```yaml
name: PR Reading Time
on:
  pull_request:
    types: [opened, synchronize, edited]

permissions:
  contents: read
  pull-requests: write

jobs:
  estimate-reading-time:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: node scripts/calculate-reading-time.js
      - update PR description via GitHub API
```

### Security Considerations

- Use GitHub's built-in `GITHUB_TOKEN` with minimal permissions
- Only modify PR description, no code changes
- Validate input to prevent injection attacks
- Rate limit API calls to avoid GitHub limits

### Edge Cases

1. **Empty PRs**: Display "< 1 minute"
2. **Very large PRs**: Cap at "60+ minutes" with warning
3. **Binary files**: Exclude from calculation
4. **Already has reading time**: Update existing estimate
5. **No header in description**: Add estimate at the beginning

## Benefits

1. **Improved PR Review Planning**: Reviewers know time commitment upfront
2. **Better PR Sizing**: Encourages smaller, focused PRs
3. **Team Metrics**: Track review time estimates vs actual
4. **Transparency**: Clear expectations for review turnaround

## Future Enhancements

1. Machine learning model based on historical review times
2. Team-specific calibration settings
3. Integration with project management tools
4. Breakdown by file type or component
5. Reviewer expertise consideration