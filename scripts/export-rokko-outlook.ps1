param(
  [string]$OutputRoot = "$env:USERPROFILE\Desktop\Rokko correos",
  [string]$SenderEmail = "contacto.rokko@gmail.com",
  [string]$SenderName = "Rokko Vestuario corporativo"
)

$ErrorActionPreference = "Stop"

function Convert-ToSafeName {
  param([string]$Text, [string]$Fallback = "Sin categoria")
  if ([string]::IsNullOrWhiteSpace($Text)) { $Text = $Fallback }
  $invalid = [System.IO.Path]::GetInvalidFileNameChars()
  foreach ($ch in $invalid) { $Text = $Text.Replace($ch, "_") }
  $Text = ($Text -replace "\s+", " ").Trim()
  if ($Text.Length -gt 80) { $Text = $Text.Substring(0, 80).Trim() }
  if ([string]::IsNullOrWhiteSpace($Text)) { return $Fallback }
  return $Text
}

function Get-CategoryFromText {
  param([string]$Text)
  $subject = ([string]$Text).ToLowerInvariant()
  $rules = @(
    @{ Name = "Poleras"; Terms = @("polera", "poleras", "t-shirt", "playera") },
    @{ Name = "Camisas"; Terms = @("camisa", "camisas", "blusa", "blusas") },
    @{ Name = "Polerones"; Terms = @("poleron", "polerones", "hoodie", "sweater") },
    @{ Name = "Chaquetas"; Terms = @("chaqueta", "chaquetas", "cortaviento", "softshell", "parka", "parkas") },
    @{ Name = "Pantalones"; Terms = @("pantalon", "pantalones") },
    @{ Name = "Gorros"; Terms = @("gorro", "gorros", "jockey", "jockeys") },
    @{ Name = "Delantales"; Terms = @("delantal", "delantales") },
    @{ Name = "Uniformes"; Terms = @("uniforme", "uniformes", "vestuario corporativo") },
    @{ Name = "Bordados y estampados"; Terms = @("bordado", "bordados", "estampado", "estampados", "logo") },
    @{ Name = "Cotizaciones"; Terms = @("cotizacion", "cotizaciones", "presupuesto", "valor", "precio") },
    @{ Name = "Catalogos"; Terms = @("catalogo", "catalogos", "catalogue") }
  )

  foreach ($rule in $rules) {
    foreach ($term in $rule.Terms) {
      if ($subject.Contains($term)) { return $rule.Name }
    }
  }
  return "General"
}

function Get-Category {
  param($Mail)
  if (-not [string]::IsNullOrWhiteSpace($Mail.Categories)) {
    return Convert-ToSafeName (($Mail.Categories -split ",")[0].Trim())
  }
  return Get-CategoryFromText ([string]$Mail.Subject)
}

function Get-SmtpAddress {
  param($Mail)
  $schemas = @(
    "http://schemas.microsoft.com/mapi/proptag/0x5D01001F",
    "http://schemas.microsoft.com/mapi/proptag/0x0065001F"
  )
  foreach ($schema in $schemas) {
    try {
      $value = $Mail.PropertyAccessor.GetProperty($schema)
      if (-not [string]::IsNullOrWhiteSpace($value)) { return $value }
    } catch {}
  }
  return [string]$Mail.SenderEmailAddress
}

function Get-MailFolders {
  param($Folder)
  $Folder
  foreach ($child in $Folder.Folders) {
    Get-MailFolders $child
  }
}

function Get-UniquePath {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { return $Path }
  $dir = [System.IO.Path]::GetDirectoryName($Path)
  $stem = [System.IO.Path]::GetFileNameWithoutExtension($Path)
  $ext = [System.IO.Path]::GetExtension($Path)
  $i = 2
  do {
    $candidate = Join-Path $dir ("{0}_{1}{2}" -f $stem, $i, $ext)
    $i++
  } while (Test-Path -LiteralPath $candidate)
  return $candidate
}

$imageExtensions = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".tif", ".tiff", ".svg")
$imageRoot = Join-Path $OutputRoot "imagenes"
$docsRoot = Join-Path $OutputRoot "documentos"
New-Item -ItemType Directory -Force -Path $imageRoot, $docsRoot | Out-Null

$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")
$messages = @()

foreach ($store in $namespace.Stores) {
  $root = $store.GetRootFolder()
  foreach ($folder in (Get-MailFolders $root)) {
    try {
      try {
        if ($folder.DefaultItemType -ne 0) { continue }
      } catch {}
      $items = $folder.Items
      try { $items.Sort("[ReceivedTime]", $true) } catch {}
      for ($itemIndex = 1; $itemIndex -le $items.Count; $itemIndex++) {
        try {
        $item = $items.Item($itemIndex)
        if ($null -eq $item -or $item.Class -ne 43) { continue }
        $senderNameValue = [string]$item.SenderName
        $senderEmailValue = [string]$item.SenderEmailAddress
        $smtp = $senderEmailValue
        $senderMatches = $false
        if ($smtp -and $smtp.ToLower() -eq $SenderEmail.ToLower()) { $senderMatches = $true }
        if (-not $senderMatches -and $senderNameValue -eq $SenderName) { $senderMatches = $true }
        if (-not $senderMatches -and $senderNameValue.ToLower().Contains("rokko")) { $senderMatches = $true }
        if (-not $senderMatches -and $senderEmailValue.ToLower().Contains("rokko")) { $senderMatches = $true }
        if ($senderMatches) {
          $resolvedSmtp = Get-SmtpAddress $item
          if (-not [string]::IsNullOrWhiteSpace($resolvedSmtp)) { $smtp = $resolvedSmtp }
        }
        if (-not $senderMatches) { continue }

        $category = Get-Category $item
        $safeCategory = Convert-ToSafeName $category

        $safeSubject = Convert-ToSafeName $item.Subject "Sin asunto"
        $receivedDate = Get-Date
        try { $receivedDate = [datetime]$item.ReceivedTime } catch {}
        $datePrefix = $receivedDate.ToString("yyyyMMdd-HHmm")
        $savedAttachments = @()

        try {
          for ($i = 1; $i -le $item.Attachments.Count; $i++) {
            try {
            $attachment = $item.Attachments.Item($i)
            $originalName = Convert-ToSafeName $attachment.FileName ("adjunto_$i")
            $ext = [System.IO.Path]::GetExtension($originalName).ToLowerInvariant()
            if ($imageExtensions -notcontains $ext) { continue }

            $attachmentCategory = Convert-ToSafeName (Get-CategoryFromText ("{0} {1}" -f $item.Subject, $attachment.FileName))
            $categoryDir = Join-Path $imageRoot $attachmentCategory
            New-Item -ItemType Directory -Force -Path $categoryDir | Out-Null
            $fileName = Convert-ToSafeName ("{0}_{1}_{2}" -f $datePrefix, $safeSubject, $originalName)
            $target = Get-UniquePath (Join-Path $categoryDir $fileName)
            $attachment.SaveAsFile($target)
            $savedAttachments += [pscustomobject]@{
              file_name = [System.IO.Path]::GetFileName($target)
              original_name = $attachment.FileName
              path = $target
              category = $attachmentCategory
              size_bytes = (Get-Item -LiteralPath $target).Length
            }
            } catch {
              Write-Warning ("No se pudo guardar adjunto en {0}: {1}" -f $folder.FolderPath, $_.Exception.Message)
            }
          }
        } catch {
          Write-Warning ("No se pudieron leer adjuntos en {0}: {1}" -f $folder.FolderPath, $_.Exception.Message)
        }

        $bodyText = ""
        try { $bodyText = [string]$item.Body } catch { $bodyText = "" }
        $subjectText = ""
        $senderNameText = ""
        $folderText = ""
        try { $subjectText = [string]$item.Subject } catch {}
        try { $senderNameText = [string]$item.SenderName } catch {}
        try { $folderText = [string]$folder.FolderPath } catch {}
        $receivedText = Get-Date -Date $receivedDate -Format "s"

        $messages += [pscustomobject]@{
          subject = $subjectText
          sender_name = $senderNameText
          sender_email = [string]$smtp
          received_time = $receivedText
          folder = $folderText
          category = $safeCategory
          body = $bodyText
          attachments = @($savedAttachments)
        }
        } catch {
          Write-Warning ("No se pudo leer un mensaje en {0} (linea {1}): {2}" -f $folder.FolderPath, $_.InvocationInfo.ScriptLineNumber, $_.Exception.Message)
        }
      }
    } catch {
      Write-Warning ("No se pudo leer carpeta {0}: {1}" -f $folder.FolderPath, $_.Exception.Message)
    }
  }
}

$messages = @($messages | Sort-Object received_time -Descending)
$exportPath = Join-Path $OutputRoot "rokko-correos-export.json"
$messages | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $exportPath -Encoding UTF8

[pscustomobject]@{
  export_path = $exportPath
  output_root = $OutputRoot
  message_count = $messages.Count
  image_count = (@($messages.attachments) | Measure-Object).Count
  categories = @($messages | Group-Object category | ForEach-Object { [pscustomobject]@{ category = $_.Name; messages = $_.Count } })
} | ConvertTo-Json -Depth 6
