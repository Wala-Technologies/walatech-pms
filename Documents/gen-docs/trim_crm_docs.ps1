$filePath = 'd:\1_Software\wala-pms\gen-docs\WalaTech_crm_schema_documentation.md'
$content = Get-Content -Path $filePath -Raw

# Find the conclusion section and keep everything up to it
$conclusionIndex = $content.IndexOf('## 3. Conclusion')
if ($conclusionIndex -ge 0) {
    $endIndex = $content.IndexOf('For more detailed information about specific features or configurations, please refer to the official WalaTech documentation or consult with your system administrator.', $conclusionIndex)
    if ($endIndex -ge 0) {
        $endIndex = $content.IndexOf("`n", $endIndex) + 1
        $newContent = $content.Substring(0, $endIndex)
        $newContent | Set-Content -Path $filePath -NoNewline
        Write-Host "Successfully removed content after the conclusion section."
    } else {
        Write-Host "Could not find the end of the conclusion section."
    }
} else {
    Write-Host "Could not find the conclusion section in the file."
}
