@echo off
echo ================================================================
echo Starting Google Chrome in Silent Kiosk Printing mode...
echo ================================================================
echo.
echo IMPORTANT REQUIREMENT:
echo Please make sure your thermal printer name in Windows Settings
echo is set as the Windows DEFAULT PRINTER.
echo.
echo Operating Site URL: http://localhost:5173/admin/orders
echo.
echo Press any key to launch Chrome...
pause > nul
start chrome --kiosk-printing "http://localhost:5173/admin/orders"
