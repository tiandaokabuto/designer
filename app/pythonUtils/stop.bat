@echo off
::调用vbs获取PID
rem @echo %1
rem start %~dp0/getPID.vbs %1
rem 开启延迟变量
rem @setlocal enableextensions enabledelayedexpansion
set CurrentDirectory=%~dp0
set GetPIDFileName=getPID.vbs
set blank=  
set getPIDpath=%CurrentDirectory%%GetPIDFileName%%blank%%1
rem @echo %getPIDpath%
for /f "delims=" %%a in ('cscript /nologo %getPIDpath%') do set "d=%%a"
@echo %d%

rem 调用停止脚本
cd %~dp0/../../Python/python3_lib
python.exe %~dp0/_stop_process_.py %d%