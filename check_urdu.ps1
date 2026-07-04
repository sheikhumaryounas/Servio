$file = 'c:\Users\HP\Desktop\Servio\frontend\src\App.jsx'
$utf8 = [System.Text.Encoding]::UTF8
$content = [System.IO.File]::ReadAllText($file, $utf8)

# Check around line 259 where ur translations start
$idx = $content.IndexOf("ur: {")
if ($idx -ge 0) {
    Write-Host "Found ur: { block. Content sample:"
    Write-Host $content.Substring($idx, 500)
} else {
    Write-Host "ur: { block NOT found!"
}

# Also check if Arabic/Urdu characters exist (U+0600-U+06FF range)
# In UTF-8 they are encoded as D8-DB xx
$bytes = [System.IO.File]::ReadAllBytes($file)
$arabicCount = 0
for ($i = 0; $i -lt ($bytes.Length - 1); $i++) {
    if ($bytes[$i] -ge 0xD8 -and $bytes[$i] -le 0xDB) {
        $arabicCount++
        if ($arabicCount -le 3) {
            $hex = ($bytes[$i..($i+1)] | ForEach-Object { $_.ToString('X2') }) -join ' '
            Write-Host "Arabic char bytes at $i : $hex"
        }
    }
}
Write-Host "Total Arabic-range UTF-8 sequences: $arabicCount"
