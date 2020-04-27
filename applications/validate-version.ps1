param (
    [Parameter(Mandatory = $True)]
    [string]$ExpectedVersion
)

if ($ExpectedVersion.StartsWith("pypy")) {
    $ExpectedVersion = $ExpectedVersion.Substring(4)
}

$ErrorActionPreference = "SilentlyContinue"

# Trick to avoid script failure
# because `python --version` produces exit code 1 and stderr output on Python 2.x
$ActualVersion = $(pwsh -Command "python --version 2>&1")

Write-Host "Expected version is '${ExpectedVersion}'"
Write-Host "Actual version is '${ActualVersion}'"

if ($ActualVersion -like "Python ${ExpectedVersion}.*") {
    Write-Host "Toolcache version is correct"
    exit 0
} else {
    Write-Host "Toolcache version is incorrect"
    exit 1
}