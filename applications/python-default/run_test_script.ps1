Param (
    [String] [Parameter (Mandatory = $true)] [ValidateNotNullOrEmpty()]
    $Version,
    [String] [Parameter (Mandatory = $true)] [ValidateNotNullOrEmpty()]
    $SourcesDirectory,
    [String] 
    $Arch
)

function InvokePythonCode {
    Param (
      [String] [Parameter (Mandatory = $true)] [ValidateNotNullOrEmpty()]
      $Command
    )
  
    Invoke-Expression -Command $Command
  
    if ($LASTEXITCODE -eq 0) {
      Write-Output "$Command ran successfully"
    } else {
      Write-Output "$Command failed"
      exit $LASTEXITCODE
    }
  }

if ($Version -match 'pypy'){
    Write-Host "PyInstaller is not supported by PyPy"
    exit
}

$PyVersion = [Version]$Version
$Major = $PyVersion.Major
$Minor = $PyVersion.Minor

Set-Location "$SourcesDirectory/src/python/python-default"
Write-Host "----------Execute test app----------"
python ./simple_app.py
InvokePythonCode -Command "./check_tkinter.py"

if ($PyVersion.Minor -eq 8) {
    Write-Host "Python 3.8 is not supported by PyInstaller at the moment https://github.com/pyinstaller/pyinstaller/issues/4311"
} else {
    if ($env:OS -match "Windows") {
        if ($Arch -eq 'x86') {
            $Bit = "-32"
        } else {
            $Bit = ""
        }
    
        #workaround for VS2019 issue with NativeCommandError is to use cmd /c 
        Write-Host "----------PyLauncher Version----------"
        $Result = py "-$Major.$Minor$Bit" -c "from sys import version_info;import struct;print('py {}.{}.{}-{}bit'.format(version_info.major, version_info.minor, version_info.micro, 8*struct.calcsize('P')))"
        $MatchError = "not found!"
        if ($Result -match $MatchError){
            Write-Output "Py Launcher was unable to find the specific version of python: $Major.$Minor$Bit"
            return 1;
        }
        Write-Host "----------Install PyInstaller----------"
        & cmd /c 'pip install pyinstaller 2>&1'
        Write-Host "----------Create onefile app with PyInstaller----------"
        & cmd /c 'pyinstaller --onefile ./simple_app.py 2>&1'
        Write-Host "----------Execute onefile app----------"
        ./dist/simple_app.exe
    } else {
        Write-Host "Python 3.8 is not supported by PyInstaller at the moment https://github.com/pyinstaller/pyinstaller/issues/4311"
        Write-Host "----------Install PyInstaller----------"
        pip install pyinstaller
        Write-Host "----------Create onefile app with PyInstaller----------"
        pyinstaller --onefile ./simple_app.py
        Write-Host "----------Execute onefile app----------"
        ./dist/simple_app 
    }
}