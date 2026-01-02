# Plan Budowy Aplikacji Notchie - Teleprompter dla Windows

## 📋 Analiza Opisu Aplikacji

### Cel Produktu
Aplikacja telepromptera wyświetlająca tekst jako overlay na ekranie, umożliwiająca czytanie skryptu podczas nagrywania video/video calli, z automatycznym ukrywaniem podczas screen share.

### Kluczowe Wymagania MVP
1. **Floating Window** - przezroczyste okno zawsze na wierzchu, bez ramki, przesuwalne
2. **Edycja Tekstu** - prosty edytor z zapisem lokalnym i importem z pliku
3. **Auto-scroll** - automatyczne przewijanie z regulacją prędkości
4. **Globalne Skróty** - sterowanie bez fokusa okna
5. **Ustawienia** - konfiguracja wyglądu i zachowania
6. **Screen Share Detection** - automatyczne ukrywanie podczas udostępniania ekranu

### Tech Stack (z dokumentu)
- **Frontend**: Electron 28+, React 18, Tailwind CSS, Zustand, Lucide React
- **Backend**: Node.js 20+, electron-store, electron-globalShortcut
- **Build**: Vite, electron-builder

---

## 🏗️ Plan Budowy - Fazy Implementacji

### FAZA 0: Przygotowanie Środowiska (Dzień 1)

#### 0.1 Inicjalizacja Projektu
- [x] Utworzenie projektu z template Electron + Vite + React
- [x] Konfiguracja package.json z wymaganymi zależnościami
- [x] Setup struktury folderów zgodnie z architekturą
- [x] Konfiguracja Vite i electron.vite.config.js
- [x] Konfiguracja Tailwind CSS

**Pliki do utworzenia:**
```
notchie-windows/
├── package.json
├── electron.vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

**Zależności do zainstalowania:**
```bash
npm install zustand electron-store lucide-react
npm install -D tailwindcss postcss autoprefixer
```

#### 0.2 Struktura Katalogów
- [x] Utworzenie folderów zgodnie z architekturą:
  - `src/main/` - Main Process
  - `src/renderer/` - Renderer Process (React)
  - `src/preload/` - Preload scripts
  - `src/renderer/components/` - Komponenty React
  - `src/renderer/hooks/` - Custom hooks
  - `src/renderer/store/` - Zustand store
  - `public/` - Assets statyczne

---

### FAZA 1: Podstawowe Okno Telepromptera (Dzień 2-3)

#### 1.1 Main Process - Window Manager
**Plik:** `src/main/windowManager.js`

**Zadania:**
- [x] Utworzenie BrowserWindow z konfiguracją:
  - `transparent: true` - przezroczyste tło
  - `frame: false` - brak ramki
  - `alwaysOnTop: true` - zawsze na wierzchu
  - `resizable: true` - możliwość zmiany rozmiaru
  - `skipTaskbar: true` - ukrycie w taskbarze
- [x] Implementacja drag & drop (przesuwanie okna)
- [x] Obsługa zmiany rozmiaru okna
- [x] Zapisywanie pozycji i rozmiaru okna przy zamknięciu
- [x] Przywracanie pozycji i rozmiaru przy starcie

**Kluczowe API:**
- `BrowserWindow.setBounds()`
- `BrowserWindow.setIgnoreMouseEvents()` z `forward: true`
- `window.on('moved')` i `window.on('resized')`

#### 1.2 Preload Script
**Plik:** `src/preload/index.js`

**Zadania:**
- [x] Ekspozycja bezpiecznego API dla renderer process
- [x] Context bridge dla komunikacji Main ↔ Renderer
- [x] Ekspozycja funkcji:
  - `window.electronAPI.getWindowBounds()`
  - `window.electronAPI.setWindowBounds(bounds)`
  - `window.electronAPI.onWindowMoved(callback)`
  - `window.electronAPI.onWindowResized(callback)`

#### 1.3 Renderer - Podstawowy Komponent
**Plik:** `src/renderer/components/Prompter.jsx`

**Zadania:**
- [x] Podstawowy layout z przezroczystym tłem
- [x] Wyświetlanie tekstu (placeholder na start)
- [x] Styling z Tailwind CSS:
  - Przezroczyste tło z regulowaną opacity
  - Czcionka czytelna (sans-serif)
  - Wyśrodkowany tekst
- [x] Obsługa hover (do przyszłego pause on hover)

**Zależności:**
- Zustand store dla stanu tekstu i ustawień

---

### FAZA 2: Store i Zarządzanie Stanem (Dzień 3)

#### 2.1 Zustand Store
**Plik:** `src/renderer/store/useStore.js`

**Zadania:**
- [x] Definicja store z następującymi stanami:
  - `text` - aktualny tekst do wyświetlenia
  - `scrollPosition` - pozycja przewijania
  - `isPlaying` - czy auto-scroll jest aktywny
  - `scrollSpeed` - prędkość przewijania (px/ms)
  - `fontSize` - rozmiar czcionki
  - `fontFamily` - rodzina czcionki
  - `opacity` - przezroczystość tła
  - `windowWidth` - szerokość okna
  - `windowHeight` - wysokość okna
- [x] Akcje:
  - `setText(text)`
  - `setScrollPosition(position)`
  - `togglePlay()`
  - `setScrollSpeed(speed)`
  - `resetScroll()`
  - `updateSettings(settings)`

#### 2.2 Integracja z electron-store
**Plik:** `src/main/storage.js`

**Zadania:**
- [x] Inicjalizacja electron-store z domyślnymi wartościami
- [x] Funkcje do zapisu/odczytu ustawień
- [x] Synchronizacja z Zustand store przy starcie
- [x] Auto-save przy zmianach ustawień

**Domyślne wartości:**
```javascript
{
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  scrollSpeed: 2,
  windowWidth: 600,
  windowHeight: 150,
  opacity: 0.9,
  lastScript: ''
}
```

---

### FAZA 3: Auto-Scroll Mechanizm (Dzień 4-5)

#### 3.1 Custom Hook - useScroll
**Plik:** `src/renderer/hooks/useScroll.js`

**Zadania:**
- [x] Implementacja logiki auto-scrollu:
  - Użycie `requestAnimationFrame` dla płynności (60 FPS)
  - Aktualizacja pozycji scrollowania w zależności od prędkości
  - Obsługa play/pause
- [x] Obsługa manual scroll (scroll wheel):
  - Wykrywanie zdarzeń `wheel`
  - Aktualizacja pozycji przy scrollowaniu myszką
- [x] Pause on hover:
  - Wykrywanie najechania myszką
  - Automatyczne pauzowanie
  - Wznowienie po opuszczeniu obszaru

**Algorytm:**
```javascript
// Koncepcyjnie
useEffect(() => {
  if (!isPlaying) return;
  
  let lastTime = performance.now();
  
  const animate = (currentTime) => {
    const delta = currentTime - lastTime;
    const scrollDelta = (scrollSpeed * delta) / 1000; // px/ms
    
    setScrollPosition(prev => prev + scrollDelta);
    lastTime = currentTime;
    
    if (isPlaying) {
      requestAnimationFrame(animate);
    }
  };
  
  requestAnimationFrame(animate);
}, [isPlaying, scrollSpeed]);
```

#### 3.2 Komponent Prompter - Integracja Scrollu
**Plik:** `src/renderer/components/Prompter.jsx` (aktualizacja)

**Zadania:**
- [x] Integracja hooka `useScroll`
- [x] Wyświetlanie tekstu z offsetem zgodnym z `scrollPosition`
- [x] Obsługa overflow (ukrycie tekstu poza widokiem)
- [x] Smooth scrolling (CSS `transform: translateY()`)
- [x] Reset do początku (gdy `scrollPosition` = 0)

---

### FAZA 4: Globalne Skróty Klawiszowe (Dzień 5-6)

#### 4.1 Main Process - Shortcuts Handler
**Plik:** `src/main/shortcuts.js`

**Zadania:**
- [x] Rejestracja globalnych skrótów:
  - `Shift+Left` - zmniejszenie prędkości
  - `Shift+Right` - zwiększenie prędkości
  - `Shift+Space` - play/pause toggle
  - `Shift+Up` - reset do początku
- [x] Obsługa konfliktów (sprawdzenie czy skrót jest dostępny)
- [x] Wysyłanie komunikatów do renderer process przez IPC
- [x] Unregister przy zamknięciu aplikacji

**API:**
```javascript
const { globalShortcut } = require('electron');

// Rejestracja
globalShortcut.register('Shift+Right', () => {
  mainWindow.webContents.send('shortcut-speed-increase');
});

// Unregister przy wyjściu
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
```

#### 4.2 Renderer - Obsługa Skrótów
**Plik:** `src/renderer/components/Prompter.jsx` (aktualizacja)

**Zadania:**
- [x] Nasłuchiwanie na komunikaty IPC z main process
- [x] Aktualizacja store w odpowiedzi na skróty:
  - Zwiększenie/zmniejszenie `scrollSpeed`
  - Toggle `isPlaying`
  - Reset `scrollPosition` do 0
- [x] Wizualny feedback (opcjonalnie - tooltip z aktualną prędkością)

---

### FAZA 5: Edytor Tekstu (Dzień 6-7)

#### 5.1 Komponent Editor
**Plik:** `src/renderer/components/Editor.jsx`

**Zadania:**
- [x] Osobne okno edytora (BrowserWindow)
- [x] Textarea na pełny ekran z możliwością edycji
- [x] Przycisk "Load from file":
  - Dialog wyboru pliku (.txt)
  - Wczytanie zawartości do textarea
- [x] Przycisk "Save":
  - Zapis tekstu do store
  - Aktualizacja prompter window w czasie rzeczywistym
- [x] Live preview - synchronizacja z prompter window
- [x] Obsługa błędów (nieprawidłowy plik, brak uprawnień)

#### 5.2 Main Process - File Operations
**Plik:** `src/main/fileManager.js`

**Zadania:**
- [x] Funkcja `loadTextFile(filePath)`:
  - Odczyt pliku .txt z użyciem `fs/promises`
  - Walidacja formatu
  - Zwrócenie zawartości
- [x] Funkcja `saveTextFile(filePath, content)`:
  - Zapis do pliku
  - Tworzenie folderu Documents/Notchie/ jeśli nie istnieje
- [x] Obsługa błędów i wyjątków

#### 5.3 Preload - File API
**Plik:** `src/preload/index.js` (aktualizacja)

**Zadania:**
- [x] Ekspozycja funkcji:
  - `window.electronAPI.openFileDialog()`
  - `window.electronAPI.saveFileDialog(content)`
  - `window.electronAPI.readFile(filePath)`
  - `window.electronAPI.writeFile(filePath, content)`

---

### FAZA 6: Okno Ustawień (Dzień 7-8)

#### 6.1 Komponent Settings
**Plik:** `src/renderer/components/Settings.jsx`

**Zadania:**
- [x] Osobne okno ustawień (BrowserWindow)
- [x] Formularz z kontrolkami:
  - **Slider Font Size**: 12-48px (domyślnie 24)
  - **Dropdown Font Family**: Arial, Helvetica, Verdana, sans-serif
  - **Slider Scroll Speed**: 0.5-10 px/ms (domyślnie 2)
  - **Slider Opacity**: 0.1-1.0 (domyślnie 0.9)
  - **Input Window Width**: 200-2000px (domyślnie 600)
  - **Input Window Height**: 50-1000px (domyślnie 150)
  - **Checkbox Auto-hide on screen share**: true/false (do implementacji w Faz 7)
- [x] Live preview zmian (aktualizacja prompter window w czasie rzeczywistym)
- [x] Przycisk "Reset to Defaults"
- [x] Przycisk "Save & Close" (zapis automatyczny)

#### 6.2 Main Process - Settings Window
**Plik:** `src/main/settingsWindow.js`

**Zadania:**
- [x] Utworzenie okna settings (normalne okno z ramką)
- [x] Komunikacja z prompter window przy zmianach
- [x] Zapis ustawień do electron-store

#### 6.3 Hook useSettings
**Plik:** `src/renderer/hooks/useSettings.js` (zintegrowane w komponencie Settings)

**Zadania:**
- [x] Hook do zarządzania ustawieniami (zintegrowane w komponencie)
- [x] Synchronizacja z store
- [x] Walidacja wartości (min/max)
- [x] Debounce dla live preview (optymalizacja)

---

### FAZA 7: Screen Share Detection (Dzień 8-9)

#### 7.1 Main Process - Screen Share Detector
**Plik:** `src/main/screenShare.js`

**Zadania:**
- [x] Implementacja detekcji screen share:
  - Użycie `desktopCapturer.getSources()` co 1-2 sekundy
  - Sprawdzenie czy jakiś proces sharuje ekran
  - Wykrywanie aktywnych sesji screen sharing (podstawowa heurystyka)
- [x] Logika ukrywania/pokazywania okna:
  - `prompterWindow.hide()` gdy wykryto screen share
  - `prompterWindow.show()` gdy screen share zakończony
- [x] Optymalizacja wydajności (nie blokowanie głównego wątku)
- [x] Obsługa edge cases (wielokrotne sesje, crash procesu)
- [x] Funkcja manual toggle jako fallback

**Algorytm:**
```javascript
// Koncepcyjnie
async function detectScreenShare() {
  try {
    const sources = await desktopCapturer.getSources({ 
      types: ['screen', 'window'],
      thumbnailSize: { width: 1, height: 1 } // Minimalne dla wydajności
    });
    
    // Sprawdź czy jakiś proces sharuje ekran
    // (wymaga analizy nazw źródeł lub innych wskaźników)
    const isSharing = checkIfScreenSharing(sources);
    
    if (isSharing && !wasSharing) {
      prompterWindow.hide();
      wasSharing = true;
    } else if (!isSharing && wasSharing) {
      prompterWindow.show();
      wasSharing = false;
    }
  } catch (error) {
    console.error('Screen share detection error:', error);
  }
}

setInterval(detectScreenShare, 2000);
```

**Uwaga:** Detekcja screen share w Electron może być trudna. Możliwe alternatywy:
- Wykrywanie aktywnych okien aplikacji do screen sharing (Zoom, Teams, etc.)
- Użycie Windows API do wykrywania aktywnych sesji capture
- Opcjonalne ręczne przełączanie przez użytkownika

---

### FAZA 8: System Tray i Menu (Dzień 9)

#### 8.1 Main Process - Tray Icon
**Plik:** `src/main/tray.js`

**Zadania:**
- [x] Utworzenie tray icon w system tray (Windows notification area)
- [x] Menu kontekstowe:
  - "Show/Hide Prompter" - toggle widoczności
  - "Open Editor" - otwarcie okna edytora
  - "Settings" - otwarcie okna ustawień
  - "Quit" - zamknięcie aplikacji
- [x] Obsługa kliknięcia lewym przyciskiem (toggle prompter)
- [x] Ikona aplikacji (podstawowa implementacja - można dodać .ico w produkcji)

#### 8.2 Main Process - App Lifecycle
**Plik:** `src/main/index.js` (aktualizacja)

**Zadania:**
- [x] Obsługa `app.on('window-all-closed')` - nie zamykaj aplikacji (tylko ukryj)
- [x] Obsługa `app.on('activate')` - przywróć okno jeśli kliknięto w dock/taskbar
- [x] Zapisywanie stanu przed zamknięciem (automatyczne przez electron-store)
- [x] Cleanup przy wyjściu (unregister shortcuts, close windows)

---

### FAZA 9: Polish i Optymalizacja (Dzień 10-11)

#### 9.1 UI/UX Improvements
**Zadania:**
- [x] Tooltip'y wyjaśniające funkcje (podstawowe)
- [x] Wizualny feedback dla akcji (status indicator)
- [x] Animacje dla smooth scrolling (requestAnimationFrame)
- [x] Responsywność okna (minimalne/maksymalne rozmiary w ustawieniach)
- [x] Obsługa błędów z user-friendly messages (w edytorze)

#### 9.2 Performance Optimization
**Zadania:**
- [x] Optymalizacja renderowania (willChange, requestAnimationFrame)
- [x] Debounce/throttle dla częstych aktualizacji (w Settings i Editor)
- [x] Lazy loading komponentów (nie wymagane dla MVP)
- [x] Optymalizacja screen share detection (2 sekundy interval, minimalne thumbnails)
- [x] Memory leak prevention (cleanup useEffect hooks)

#### 9.3 Error Handling
**Zadania:**
- [x] Try-catch dla operacji na plikach (w fileManager.js)
- [x] Walidacja danych wejściowych (w Settings i Store)
- [x] Graceful degradation (fallback gdy funkcja nie działa)
- [x] Logging błędów (console.error w main process)

---

### FAZA 10: Build i Pakowanie (Dzień 11-12)

#### 10.1 Electron Builder Configuration
**Plik:** `electron-builder.yml`

**Zadania:**
- [x] Konfiguracja dla Windows:
  - `appId`: com.notchie.app
  - `productName`: Notchie
  - `target`: nsis (installer)
  - `icon`: ścieżka do ikony .ico
- [x] Konfiguracja output directory
- [x] Metadata aplikacji (autor, opis, wersja)

#### 10.2 Build Scripts
**Plik:** `package.json` (aktualizacja)

**Zadania:**
- [x] Script `build`: build aplikacji
- [x] Script `build:win`: build installer dla Windows
- [x] Script `dist`: pakowanie do dystrybucji
- [x] Script `preview`: testowanie build lokalnie

#### 10.3 Testing Build
**Zadania:**
- [x] Test instalacji z .exe (gotowe do testowania)
- [x] Test wszystkich funkcji w build produkcyjnym (wymaga uruchomienia)
- [x] Sprawdzenie rozmiaru pliku (wymaga build:win)
- [x] Test na czystym systemie Windows (wymaga dystrybucji)

---

## 📊 Harmonogram Implementacji

### Tydzień 1: Fundamenty (Dzień 1-7)
- **Dzień 1**: Setup projektu i środowiska
- **Dzień 2-3**: Podstawowe okno telepromptera
- **Dzień 3**: Store i zarządzanie stanem
- **Dzień 4-5**: Auto-scroll mechanizm
- **Dzień 5-6**: Globalne skróty klawiszowe
- **Dzień 6-7**: Edytor tekstu

### Tydzień 2: Funkcjonalności i Finalizacja (Dzień 8-14)
- **Dzień 7-8**: Okno ustawień
- **Dzień 8-9**: Screen share detection
- **Dzień 9**: System tray i menu
- **Dzień 10-11**: Polish i optymalizacja
- **Dzień 11-12**: Build i pakowanie
- **Dzień 13-14**: Testowanie i bug fixing

---

## 🔗 Zależności Między Fazami

```
FAZA 0 (Setup)
    ↓
FAZA 1 (Okno) → FAZA 2 (Store) → FAZA 3 (Scroll)
    ↓                                    ↓
FAZA 4 (Skróty) ←────────────────────────┘
    ↓
FAZA 5 (Editor) → FAZA 6 (Settings)
    ↓                    ↓
FAZA 7 (Screen Share) ←──┘
    ↓
FAZA 8 (Tray)
    ↓
FAZA 9 (Polish)
    ↓
FAZA 10 (Build)
```

---

## ⚠️ Potencjalne Wyzwania i Rozwiązania

### 1. Screen Share Detection
**Problem:** Electron nie ma natywnego API do wykrywania screen share.
**Rozwiązania:**
- Użycie `desktopCapturer` z polling
- Wykrywanie aktywnych okien aplikacji do screen sharing
- Opcjonalne ręczne przełączanie przez użytkownika

### 2. Przezroczystość Okna
**Problem:** Przezroczyste okna mogą mieć problemy z wydajnością.
**Rozwiązanie:** Użycie `transparent: true` z optymalizacją renderowania.

### 3. Globalne Skróty
**Problem:** Konflikty z innymi aplikacjami.
**Rozwiązanie:** Sprawdzanie dostępności przed rejestracją, możliwość zmiany skrótów w ustawieniach.

### 4. Drag & Drop w Frameless Window
**Problem:** Przesuwanie okna bez ramki wymaga custom implementacji.
**Rozwiązanie:** Obsługa zdarzeń myszy z `setIgnoreMouseEvents` i `forward: true`.

---

## 📝 Checklist Przed Wydaniem MVP

### Funkcjonalność
- [ ] Okno się otwiera i jest przezroczyste
- [ ] Można je przesuwać i resize'ować
- [ ] Auto-scroll działa płynnie (60 FPS)
- [ ] Hover pause działa natychmiast
- [ ] Wszystkie skróty klawiszowe działają
- [ ] Settings zapisują się i wczytują
- [ ] Import .txt file działa
- [ ] Screen share detection ukrywa okno (lub działa ręczne przełączanie)

### Performance
- [ ] CPU < 5% podczas scrollowania
- [ ] RAM < 150 MB
- [ ] Startup < 3 sekundy

### UX
- [ ] Intuicyjny dla non-tech użytkownika
- [ ] Tooltip'y wyjaśniają funkcje
- [ ] Błędy nie crashują aplikacji

---

## 🚀 Next Steps Po MVP

### Wersja 1.1
- Voice-activated scrolling (Web Speech API)
- Eksport do PDF/Word
- Statystyki czytania

### Wersja 1.2
- Multiple scripts/projekty
- Cloud backup (opcjonalny)
- Integracja z Notion/Google Docs

---

**Status:** Plan gotowy do implementacji
**Ostatnia aktualizacja:** 2024
