# Installation Guide

## 🚀 Quick Install (Recommended)

### Using the GitHub Action Marketplace

1. Go to your repository
2. Create `.github/workflows/pr-reading-time.yml`
3. Add this content:

```yaml
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

4. Commit and push
5. That's it! ✨

## 🔧 Alternative Installation Methods

### Method 1: Automated Setup Script

Run this command in your repository root:

```bash
curl -fsSL https://raw.githubusercontent.com/micahstubbs/pr-reading-time/main/setup.sh | bash
```

The script will:
- Create the workflow file
- Ask about configuration preferences
- Optionally commit and push changes

### Method 2: GitHub CLI

```bash
# Clone just the workflow file
gh repo clone micahstubbs/pr-reading-time -- --depth=1 --filter=blob:none --sparse
cd pr-reading-time
git sparse-checkout set .github/workflows/example-simple.yml

# Copy to your repo
cp .github/workflows/example-simple.yml /path/to/your/repo/.github/workflows/pr-reading-time.yml
```

### Method 3: Direct Download

```bash
# Create workflows directory
mkdir -p .github/workflows

# Download the workflow
curl -o .github/workflows/pr-reading-time.yml \
  https://raw.githubusercontent.com/micahstubbs/pr-reading-time/main/.github/workflows/example-simple.yml
```

## 🎯 Configuration Examples

### Post as Comment Instead of Updating Description

```yaml
- uses: micahstubbs/pr-reading-time@v1
  with:
    comment-instead: 'true'
```

### Use Custom Token

```yaml
- uses: micahstubbs/pr-reading-time@v1
  with:
    github-token: ${{ secrets.CUSTOM_TOKEN }}
```

### Get Output Values

```yaml
- uses: micahstubbs/pr-reading-time@v1
  id: reading-time

- name: Use the reading time
  run: |
    echo "Reading time: ${{ steps.reading-time.outputs.reading-time }}"
    echo "Total changes: ${{ steps.reading-time.outputs.total-changes }}"
```

## 📝 Manual Installation (Copy Files)

If you prefer to host the scripts yourself:

1. **Copy workflow file:**
   - Source: `.github/workflows/pr-reading-time.yml`
   - Destination: Your repo's `.github/workflows/`

2. **Copy scripts:**
   - Source: `scripts/` directory
   - Destination: Your repo's root directory

3. **Update workflow** to use local scripts instead of the action

## 🔍 Verify Installation

After installation, create a test PR to verify it's working:

1. Create a new branch
2. Make some changes
3. Open a pull request
4. Check for the reading time estimate in the PR description

## 🆘 Troubleshooting

### Reading time not appearing?

1. Check Actions tab for any errors
2. Verify workflow has `pull-requests: write` permission
3. Ensure the PR event triggered the workflow

### Need help?

- Check the [README](README.md) for detailed documentation
- Open an issue on [GitHub](https://github.com/micahstubbs/pr-reading-time/issues)