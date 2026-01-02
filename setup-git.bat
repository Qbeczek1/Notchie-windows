@echo off
echo ========================================
echo Konfiguracja Git dla ScriptView
echo ========================================
echo.

REM Sprawdź czy git jest zainstalowany
git --version >nul 2>&1
if errorlevel 1 (
    echo BŁĄD: Git nie jest zainstalowany!
    echo Zainstaluj Git z https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Inicjalizacja repozytorium Git...
git init
if errorlevel 1 (
    echo BŁĄD: Nie udało się zainicjalizować repozytorium
    pause
    exit /b 1
)

echo [2/5] Dodawanie remote origin...
git remote add origin https://github.com/Qbeczek1/ScriptView.git
if errorlevel 1 (
    echo Ostrzeżenie: Remote origin już istnieje, aktualizuję...
    git remote set-url origin https://github.com/Qbeczek1/ScriptView.git
)

echo [3/5] Sprawdzanie statusu...
git status

echo.
echo [4/5] Dodawanie wszystkich plików...
git add .

echo.
echo [5/5] Tworzenie pierwszego commita...
git commit -m "Initial commit: ScriptView - Teleprompter dla Windows"

echo.
echo ========================================
echo Konfiguracja zakończona!
echo ========================================
echo.
echo Aby wypushować do GitHub, uruchom:
echo   git push -u origin main
echo.
echo LUB jeśli branch nazywa się master:
echo   git push -u origin master
echo.
pause

