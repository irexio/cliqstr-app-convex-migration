# Claude Commands for Windows VSCode

## Basic Commands

### File Operations
- **Read file**: `Read the file at <path>`
- **Edit file**: `Edit <filename> and change X to Y`
- **Create file**: `Create a new file called <filename>`
- **Search files**: `Search for files containing <pattern>`

### Code Navigation
- **Find function**: `Find the function <name> in the codebase`
- **Find references**: `Show me where <function/variable> is used`
- **Search pattern**: `Search for <pattern> in all TypeScript files`

### Code Analysis
- **Explain code**: `Explain what this code does`
- **Review code**: `Review this code for issues`
- **Find bugs**: `Check for potential bugs in <file>`

### Development Tasks
- **Run command**: `Run npm install`
- **Build project**: `Build the project`
- **Run tests**: `Run the test suite`
- **Check types**: `Run TypeScript type checking`

### Git Operations
- **Git status**: `Show git status`
- **Git diff**: `Show git diff`
- **Create commit**: `Create a git commit with these changes`

### Project-Specific (Cliqstr)
- **Check auth flow**: `Review the authentication flow`
- **Verify APA compliance**: `Check if this follows APA rules`
- **Test invite flow**: `Test the invite flow for child accounts`

## Tips for Windows VSCode
- Use absolute paths: `C:\cli\cliqstr-final\src\file.ts`
- Escape backslashes in regex: `Search for "pattern\\with\\backslash"`
- Run PowerShell commands: `Run powershell -Command "Get-ChildItem"`