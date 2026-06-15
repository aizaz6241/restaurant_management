@echo off
echo ================================================================
echo Starting Microsoft Edge in Silent Kiosk Printing mode...
echo ================================================================
echo.
echo IMPORTANT REQUIREMENTS:
echo 1. Please ensure your thermal printer (BILL) is set as the Windows DEFAULT PRINTER.
echo 2. Edge will run as a dedicated print server in the background. You can continue
echo    using Google Chrome normally for your daily browsing.
echo.
echo Operating Site URL: https://restaurant-management-mkrr.onrender.com/admin/orders
echo.
echo Press any key to launch Edge...
pause > nul
start msedge --kiosk-printing --no-first-run --no-default-browser-check --user-data-dir="%temp%\EdgeSilentPrintProfile" "https://restaurant-management-mkrr.onrender.com/admin/orders?isPrinter=true"
