$file = 'c:\Users\HP\Desktop\Servio\frontend\src\App.jsx'
$content = Get-Content $file -Raw

$old = "                                  style={{`r`n                                    padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',`r`n                                    border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',`r`n                                    color: 'var(--text-main)', cursor: 'pointer', minHeight: 'unset', boxShadow: 'none', transition: 'all 0.2s'`r`n                                  }}`r`n                                >"

$new = "                                  className=`"glass`"`r`n                                  style={{`r`n                                    padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '600',`r`n                                    border: '1px solid var(--border-color)', background: 'var(--bg-card)',`r`n                                    color: 'var(--text-main)', cursor: 'pointer', minHeight: 'unset', boxShadow: 'none', transition: 'all 0.2s'`r`n                                  }}`r`n                                >"

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
    Write-Host "SUCCESS: Button styling fixed."
} else {
    Write-Host "NOT FOUND: Trying alternate indentation..."
    # Try with 34 spaces (what output shows)
    $lines = $content -split "`r`n"
    Write-Host "Lines 3379-3388:"
    $lines[3378..3388] | ForEach-Object { Write-Host "[$_]" }
}
