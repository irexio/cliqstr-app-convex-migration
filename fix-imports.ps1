# Fix Convex import paths
$files = @(
    "src/components/cliqs/CliqMembersContentConvex.tsx",
    "src/components/SetUpProfileClientConvex.tsx", 
    "src/components/CreateProfileFormConvex.tsx",
    "src/components/server/ProfilePageServerConvex.tsx",
    "src/components/cliqs/MyCliqsPageConvex.tsx",
    "src/components/cliqs/CreateCliqFormConvex.tsx",
    "src/components/cliqs/CliqFeedConvex.tsx",
    "src/components/cliqs/CliqPageConvex.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace '@/convex/_generated/api', '../../../convex/_generated/api'
        $content = $content -replace '@/convex/_generated/dataModel', '../../../convex/_generated/dataModel'
        Set-Content $file $content
        Write-Host "Fixed: $file"
    }
}
