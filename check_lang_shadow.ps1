$lines = Get-Content 'c:\Users\HP\Desktop\Servio\frontend\src\App.jsx'
$results = @()
for ($idx = 869; $idx -le 6342; $idx++) {
    $line = $lines[$idx]
    if ($line -match 'const language|let language|var language') {
        $results += "Line $($idx+1): $line"
    }
}
if ($results.Count -eq 0) {
    Write-Host "No local 'language' variable declarations found in MainApp scope (lines 870-6342)."
} else {
    $results | ForEach-Object { Write-Host $_ }
}
