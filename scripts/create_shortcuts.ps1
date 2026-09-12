$wsh = New-Object -ComObject WScript.Shell

$s1 = $wsh.CreateShortcut("C:\Users\balaj\Desktop\JobOS\Start JobOS.lnk")
$s1.TargetPath = "c:\Users\balaj\Antigravity Projects\Job OS\Start-JobOS.cmd"
$s1.WorkingDirectory = "c:\Users\balaj\Antigravity Projects\Job OS"
$s1.IconLocation = "c:\Users\balaj\Antigravity Projects\Job OS\favicon.ico,0"
$s1.Description = "Start JobOS Autonomous Career Command Center"
$s1.Save()

$s2 = $wsh.CreateShortcut("C:\Users\balaj\Desktop\JobOS\Stop JobOS.lnk")
$s2.TargetPath = "c:\Users\balaj\Antigravity Projects\Job OS\Stop-JobOS.cmd"
$s2.WorkingDirectory = "c:\Users\balaj\Antigravity Projects\Job OS"
$s2.IconLocation = "$env:SystemRoot\System32\shell32.dll,27"
$s2.Description = "Safely stop JobOS and release port 3000"
$s2.Save()

Write-Output "Shortcuts created successfully"
