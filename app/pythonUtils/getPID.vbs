'Gets the parameters passed into VBS
'This parameter is used to find the python process
Set args = WScript.Arguments
If args.Count = 1 Then
	argument = WScript.Arguments(0)
End If

'Find the process by specifying parameters
Function CurrProcessId
    Dim oShell, sCmd, oWMI, oChldPrcs, oCols, lOut
    lOut = 1
    Set oShell  = CreateObject("WScript.Shell")
    Set oWMI    = GetObject(_
        "winmgmts:{impersonationLevel=impersonate}!\\.\root\cimv2")
    sCmd = "/K " & Left(CreateObject("Scriptlet.TypeLib").Guid, 38)
    oShell.Run "%comspec% " & sCmd, 0
    
    'rem WScript.Sleep 100 'For healthier skin, get some sleep
	'msgbox argument
    Set oChldPrcs = oWMI.ExecQuery("Select * From Win32_Process Where CommandLine Like '%" & argument & "'",,32)
	'Set oChldPrcs = oWMI.ExecQuery("Select * From Win32_Process Where Name = 'python.exe'",,32)
    For Each oCols In oChldPrcs
		'oCols.Terminate
		lOut = oCols.ProcessId
        Exit For
    Next
    CurrProcessId = lOut
End Function
WScript.Echo(CurrProcessId)
'msgbox CurrProcessId



	