$file = 'c:\Users\HP\Desktop\Servio\frontend\src\App.jsx'
$bytes = [System.IO.File]::ReadAllBytes($file)
$found = 0
for ($i = 0; $i -lt ($bytes.Length - 6); $i++) {
    if ($bytes[$i] -eq 0xF0 -and $bytes[$i+1] -eq 0x9F) {
        $hex = ($bytes[$i..($i+3)] | ForEach-Object { $_.ToString('X2') }) -join ' '
        Write-Host "Found 4-byte UTF-8 seq at offset $i : $hex"
        $found++
        if ($found -ge 5) { break }
    }
}
if ($found -eq 0) {
    Write-Host "NO 4-byte UTF-8 emoji sequences found - emojis are still corrupted!"
    # Show bytes around 'English' label
    $utf8 = [System.Text.Encoding]::UTF8
    $content = $utf8.GetString($bytes)
    $idx = $content.IndexOf("'en', label:")
    if ($idx -ge 0) {
        Write-Host "Context around 'en' label:"
        Write-Host $content.Substring($idx, 100)
        # Show hex bytes for that area
        $hexBytes = ($bytes[$idx..($idx+30)] | ForEach-Object { $_.ToString('X2') }) -join ' '
        Write-Host "Hex: $hexBytes"
    }
} else {
    Write-Host "Emojis restored successfully! Found $found emoji sequences."
}
