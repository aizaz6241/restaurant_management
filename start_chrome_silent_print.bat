@echo off
echo ================================================================
echo Starting Google Chrome in Silent Kiosk Printing mode...
echo ================================================================
echo.
echo IMPORTANT REQUIREMENTS:
echo 1. Please ensure your thermal printer (BILL) is set as the Windows DEFAULT PRINTER.
echo 2. Chrome will launch in a dedicated printing profile so it ignores other running Chrome processes.
echo.
echo Operating Site URL: https://restaurant-management-mkrr.onrender.com/admin/orders
echo.
echo Press any key to launch Chrome...
pause > nul
start chrome --kiosk-printing --user-data-dir="%temp%\ChromeSilentPrintProfile" "https://restaurant-management-mkrr.onrender.com/admin/orders"
