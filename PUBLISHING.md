# Publishing Instructions for Minecraft MCP Server

This guide will walk you through publishing your MCP server to GitHub and npm.

## Prerequisites

1. **GitHub Account**: Create one at <https://github.com> if you don't have one
2. **npm Account**: Create one at <https://www.npmjs.com/signup>
3. **Node.js**: Ensure you have Node.js 18+ installed

## Step 1: Prepare the Package

1. Update the package.json in `minecraft-client/mcp-server/package.json`:
   - Replace `YOUR_USERNAME` with your GitHub username (already done: FundamentalLabs)
   - Replace `Your Name` with your actual name (already done: Fundamental Labs, Inc.)
   - Update the version if needed

2. Update the LICENSE file:
   - Replace `[Your Name]` with your actual name (already done: Fundamental Labs, Inc.)

3. Build the project:

   ```bash
   cd minecraft-client
   npm install
   npm run build
   
   cd mcp-server
   npm install
   npm run build
   ```

## Step 2: Create GitHub Repository

1. Go to <https://github.com/new>
2. Name your repository `minecraft-mcp` (or your preferred name)
3. Make it public
4. Don't initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

## Step 3: Upload to GitHub

In your terminal, from the `minecraft-client` directory:

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Minecraft MCP server"

# Add your GitHub repository as origin
git remote add origin https://github.com/FundamentalLabs/minecraft-mcp.git

# Push to GitHub
git push -u origin main
```

## Step 4: Publish to npm

1. **Login to npm** (from the mcp-server directory):

   ```bash
   cd mcp-server
   npm login
   ```

   Enter your npm username, password, and email.

2. **Verify package contents** (optional but recommended):

   ```bash
   npm pack --dry-run
   ```

   This shows what files will be included in the package.

3. **Publish the package**:

   ```bash
   npm publish
   ```

   Note: If you're using a scoped package name (like `@fundamentallabs/minecraft-mcp`), and this is your first time publishing under that scope, you'll need to use:

   ```bash
   npm publish --access public
   ```

## Step 5: Test Your Package

After publishing, test that it works:

```bash
# Test with npx (may take a minute for npm to update)
npx FundamentalLabs/minecraft-mcp --help

# Or install globally and test
npm install -g FundamentalLabs/minecraft-mcp
fl-minecraft --help
```

## Updating the Package

When you make changes and want to publish a new version:

1. Update the version in `package.json`:

   ```bash
   npm version patch  # for bug fixes (0.1.0 -> 0.1.1)
   npm version minor  # for new features (0.1.0 -> 0.2.0)
   npm version major  # for breaking changes (0.1.0 -> 1.0.0)
   ```

2. Push to GitHub:

   ```bash
   git push && git push --tags
   ```

3. Publish to npm:

   ```bash
   npm publish
   ```

## Package Name Considerations

The current package name `FundamentalLabs/minecraft-mcp` is not a valid npm package name. You have a few options:

1. **Use a scoped name**: `@fundamentallabs/minecraft-mcp`
2. **Use an unscoped name**: `fundamentallabs-minecraft-mcp` or similar
3. **Create your own organization** on npm to get a scope

Update the package.json name field accordingly before publishing.

## Troubleshooting

### "Invalid package name"

- npm package names cannot contain uppercase letters or slashes (except for scopes)
- Change `FundamentalLabs/minecraft-mcp` to something like `@fundamentallabs/minecraft-mcp` or `fundamentallabs-minecraft-mcp`

### "You do not have permission to publish to @fundamentallabs"

- You need to either own the @fundamentallabs scope or choose a different package name
- Use your own username as the scope: `@yourusername/minecraft-mcp`

### "Package name too similar to existing package"

- npm may reject names too similar to existing packages
- Try a more unique name like `minecraft-bot-mcp` or add your username

### "Cannot find module" errors when running

- Make sure you've run `npm run build` before publishing
- Check that the `dist` directory exists and contains the compiled files

## Best Practices

1. **Semantic Versioning**: Follow semver.org guidelines
2. **Changelog**: Keep a CHANGELOG.md file to track changes
3. **Testing**: Test locally with `npm link` before publishing
4. **Documentation**: Keep README up to date with new features
5. **Git Tags**: npm version automatically creates git tags

## Security Notes

- Never commit your `.env` file with real credentials
- Use npm's 2FA for additional security
- Regularly update dependencies for security patches
