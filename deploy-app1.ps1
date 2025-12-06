# Quelle und Ziel definieren
$source = "D:\GitRepo\app1"
$target = "D:\nodeApps\app1"

# Zielordner erstellen, falls nicht vorhanden
if (!(Test-Path $target)) {
    New-Item -ItemType Directory -Path $target
}

# Alles kopieren, außer .git und node_modules optional
robocopy $source $target /MIR /XD ".git" "node_modules" /XF "*.log" 

# node_modules ggf. aktualisieren
cd $target
npm install
