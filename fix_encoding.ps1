$file = 'c:\Users\HP\Desktop\Servio\frontend\src\App.jsx'

# Step 1: Read the CORRUPTED file CORRECTLY as UTF-8
$utf8 = [System.Text.Encoding]::UTF8
$content = [System.IO.File]::ReadAllText($file, $utf8)

# Step 2: Re-encode as Windows-1252 to reverse the damage
# (Original file was read as Windows-1252 by mistake and re-written as UTF-8.
#  To undo: re-encode the current UTF-8 string back to Windows-1252 bytes = original UTF-8 bytes)
$w1252 = [System.Text.Encoding]::GetEncoding(1252,
    [System.Text.EncoderReplacementFallback]::new(''),
    [System.Text.DecoderReplacementFallback]::new(''))
$originalBytes = $w1252.GetBytes($content)

# Step 3: Decode those bytes as UTF-8 to recover original content
$restoredContent = $utf8.GetString($originalBytes)

# Step 4: Verify restoration by checking for emoji presence
$hasEmoji = $restoredContent -match '[\uD83C-\uDBFF]'
Write-Host "Emoji present after restoration: $hasEmoji"
$idx = $restoredContent.IndexOf("Select App Language")
if ($idx -ge 0) {
    Write-Host "Sample near language selector:"
    Write-Host $restoredContent.Substring($idx - 10, 300)
}

# Step 5: Write back as UTF-8 WITHOUT BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file, $restoredContent, $utf8NoBom)
Write-Host "`nFile successfully restored and written as UTF-8."
