# Notchie dla Windows - Dokument MVP

## 1. ZAŁOŻENIA PRODUKTU

### Problem do rozwiązania
Użytkownicy podczas nagrywania video lub video calli potrzebują czytać skrypt, jednocześnie patrząc w kamerę, aby wyglądać naturalnie i profesjonalnie.

### Rozwiązanie
Teleprompter wyświetlający się jako overlay na ekranie w pozycji kamery, niewidoczny podczas screen share.

---

## 2. CORE FEATURES (MVP)

### Must-have (wersja 1.0):

#### A. Podstawowe okno
- ✅ Floating window zawsze na wierzchu
- ✅ Przezroczyste tło (opacity regulowana)
- ✅ Możliwość zmiany rozmiaru i pozycji
- ✅ Brak ramki okna (frameless)
- ✅ Drag & drop do przesuwania

#### B. Edycja tekstu
- ✅ Prosty edytor tekstu (textarea)
- ✅ Zapisywanie skryptu lokalnie
- ✅ Import tekstu z pliku .txt
- ✅ Regulacja rozmiaru czcionki
- ✅ Wybór czcionki (sans-serif dla czytelności)

#### C. Auto-scroll
- ✅ Automatyczne przewijanie tekstu
- ✅ Regulacja prędkości (Shift + ← / →)
- ✅ Pause on hover (najazd myszką pauzuje)
- ✅ Manual scroll (scroll wheel)
- ✅ Reset do początku (Shift + ↑)

#### D. Globalne skróty klawiszowe
- ✅ Shift + ← = wolniej
- ✅ Shift + → = szybciej
- ✅ Shift + Space = play/pause
- ✅ Shift + ↑ = reset do początku

#### E. Ustawienia
- ✅ Okno settings (osobne)
- ✅ Regulacja szerokości/wysokości okna
- ✅ Regulacja opacity tła
- ✅ Wybór czcionki i rozmiaru
- ✅ Prędkość scrollowania (default)

#### F. Screen Share Detection
- ✅ Wykrywanie gdy użytkownik sharuje ekran
- ✅ Automatyczne ukrywanie okna podczas share
- ✅ Przywracanie po zakończeniu share

### Nice-to-have (wersja 2.0):
- ⏳ Voice-activated scrolling (Web Speech API)
- ⏳ Multiple scripts/tabs
- ⏳ Cloud sync
- ⏳ Markdown support
- ⏳ Dark/Light theme
- ⏳ Analytics (time reading, words per minute)

---

## 3. TECH STACK

### Frontend
```
- Framework: Electron 28+
- UI Library: React 18
- Styling: Tailwind CSS
- State Management: Zustand (lekki i prosty)
- Icons: Lucide React
```

### Backend/System
```
- Runtime: Node.js 20+
- File System: fs/promises (Node.js native)
- Shortcuts: electron-globalShortcut
- Window Management: electron BrowserWindow API
- Screen Capture Detection: electron desktopCapturer
```

### Build & Development
```
- Build Tool: Vite (szybszy niż Webpack)
- Package Manager: npm lub pnpm
- Electron Builder: dla pakowania .exe
- Dev Tools: electron-devtools-installer
```

### Storage
```
- User Settings: electron-store (local JSON)
- Scripts: Local file system (Documents/Notchie/)
```

---

## 4. ARCHITEKTURA APLIKACJI

### Struktura plików:
```
notchie-windows/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.js            # Entry point
│   │   ├── windowManager.js    # Zarządzanie oknami
│   │   ├── shortcuts.js        # Globalne skróty
│   │   └── screenShare.js      # Detekcja screen share
│   │
│   ├── renderer/                # Electron Renderer (UI)
│   │   ├── App.jsx             # Root component
│   │   ├── components/
│   │   │   ├── Prompter.jsx    # Główne okno telepromptera
│   │   │   ├── Editor.jsx      # Edytor tekstu
│   │   │   ├── Settings.jsx    # Okno ustawień
│   │   │   └── Controls.jsx    # Kontrolki (play/pause/speed)
│   │   ├── hooks/
│   │   │   ├── useScroll.js    # Logika auto-scrollu
│   │   │   └── useSettings.js  # Zarządzanie ustawieniami
│   │   └── store/
│   │       └── useStore.js     # Zustand store
│   │
│   └── preload/
│       └── index.js            # Bridge między main i renderer
│
├── public/
│   └── icon.ico                # Ikona aplikacji
│
├── package.json
├── electron.vite.config.js
└── electron-builder.yml
```

### Procesy Electrona:

**Main Process** (Node.js):
- Zarządza oknami
- Obsługuje globalne skróty
- Zapisuje/odczytuje pliki
- Wykrywa screen share

**Renderer Process** (Chromium):
- Wyświetla UI
- Obsługuje interakcje użytkownika
- Animacje i scrolling

**Preload Script**:
- Bezpieczny bridge między Main i Renderer
- Eksponuje tylko potrzebne API

---

## 5. KLUCZOWE FUNKCJONALNOŚCI - IMPLEMENTACJA

### A. Floating Overlay Window

**Main Process:**
```javascript
// windowManager.js - koncepcyjnie
const prompterWindow = new BrowserWindow({
  width: 600,
  height: 150,
  transparent: true,        // Przezroczyste tło
  frame: false,             // Bez ramki
  alwaysOnTop: true,        // Zawsze na wierzchu
  resizable: true,          // Można zmieniać rozmiar
  skipTaskbar: true,        // Nie pokazuj w taskbarze
  webPreferences: {
    preload: path.join(__dirname, 'preload.js')
  }
});

// Ignoruj kliknięcia myszki poza tekstem
prompterWindow.setIgnoreMouseEvents(true, { forward: true });
```

### B. Auto-Scroll

**Renderer (React):**
```javascript
// useScroll.js - koncepcyjnie
const useScroll = (text, speed) => {
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setPosition(prev => prev + speed);
    }, 16); // 60 FPS
    
    return () => clearInterval(interval);
  }, [isPlaying, speed]);
  
  return { position, isPlaying, setIsPlaying };
};
```

### C. Globalne Skróty

**Main Process:**
```javascript
// shortcuts.js - koncepcyjnie
const { globalShortcut } = require('electron');

globalShortcut.register('Shift+Right', () => {
  // Zwiększ prędkość
  prompterWindow.webContents.send('speed-increase');
});

globalShortcut.register('Shift+Left', () => {
  // Zmniejsz prędkość
  prompterWindow.webContents.send('speed-decrease');
});

globalShortcut.register('Shift+Space', () => {
  // Play/Pause
  prompterWindow.webContents.send('toggle-play');
});
```

### D. Screen Share Detection

**Main Process:**
```javascript
// screenShare.js - koncepcyjnie
const { desktopCapturer } = require('electron');

async function detectScreenShare() {
  const sources = await desktopCapturer.getSources({ 
    types: ['screen', 'window'] 
  });
  
  // Sprawdź czy jakiś proces sharuje ekran
  // (wymaga sprawdzania co 1-2 sekundy)
  const isSharing = sources.some(source => 
    source.name.includes('Screen') && source.thumbnail
  );
  
  if (isSharing) {
    prompterWindow.hide(); // Ukryj okno
  } else {
    prompterWindow.show(); // Pokaż okno
  }
}

setInterval(detectScreenShare, 2000);
```

### E. Local Storage

**Main Process:**
```javascript
// settings.js - używając electron-store
const Store = require('electron-store');

const store = new Store({
  defaults: {
    fontSize: 24,
    fontFamily: 'Arial',
    scrollSpeed: 2,
    windowWidth: 600,
    windowHeight: 150,
    opacity: 0.9,
    lastScript: ''
  }
});

// Zapisz
store.set('fontSize', 28);

// Odczytaj
const fontSize = store.get('fontSize');
```

---

## 6. UI/UX FLOW

### Pierwsze uruchomienie:
1. Aplikacja otwiera się z domyślnym tekstem (tutorial)
2. Pokazuje tooltip "Przeciągnij mnie do kamery"
3. Użytkownik może od razu testować scroll

### Normalny flow:
1. **Okno główne (Prompter)**:
   - Zawsze widoczne
   - Minimalistyczne (tylko tekst)
   - Hover pokazuje mini-kontrolki (play/pause icon)

2. **Tray icon** (w zasobniku systemowym):
   - Klik: Pokaż/Ukryj prompter
   - Prawy klik: Menu
     - Open Editor
     - Settings
     - Quit

3. **Editor** (osobne okno):
   - Textarea na cały ekran
   - Przycisk "Load from file"
   - Przycisk "Save"
   - Live preview zmian w prompterze

4. **Settings** (osobne okno):
   - Slidery: Font size, Speed, Opacity
   - Dropdown: Font family
   - Input: Window dimensions
   - Checkbox: Auto-hide podczas screen share

---

## 7. INSTALACJA I SETUP

### Krok 1: Wymagania
```bash
# Zainstaluj Node.js 20+ z nodejs.org
node --version  # Sprawdź wersję
```

### Krok 2: Stwórz projekt
```bash
# Użyj template Electron + Vite + React
npm create @quick-start/electron@latest notchie-windows

# Wybierz opcje:
# - Framework: React
# - Variant: JavaScript (lub TypeScript jeśli wolisz)
```

### Krok 3: Zainstaluj zależności
```bash
cd notchie-windows

# Podstawowe
npm install

# Dodatkowe
npm install zustand              # State management
npm install electron-store       # Local storage
npm install lucide-react         # Icons
npm install tailwindcss          # Styling
```

### Krok 4: Konfiguracja Tailwind
```bash
npx tailwindcss init

# W tailwind.config.js dodaj:
# content: ['./src/renderer/**/*.{js,jsx}']
```

### Krok 5: Struktura początkowa
```bash
# Stwórz foldery
mkdir -p src/renderer/components
mkdir -p src/renderer/hooks
mkdir -p src/renderer/store
mkdir -p src/main
```

---

## 8. DEVELOPMENT WORKFLOW

### Uruchomienie dev mode:
```bash
npm run dev
# Aplikacja uruchomi się z hot-reload
```

### Build produkcyjny:
```bash
npm run build        # Zbuduj aplikację
npm run preview      # Testuj build lokalnie
```

### Pakowanie .exe:
```bash
# Dodaj do package.json:
npm install --save-dev electron-builder

# Konfiguracja w electron-builder.yml:
# - appId: com.notchie.app
# - productName: Notchie
# - directories: output: dist
# - win: target: nsis

npm run build:win    # Generuje installer .exe
```

---

## 9. TESTOWANIE MVP

### Checklist przed wydaniem:

**Funkcjonalność:**
- [ ] Okno się otwiera i jest przezroczyste
- [ ] Można je przesuwać i resize'ować
- [ ] Auto-scroll działa płynnie (60 FPS)
- [ ] Hover pause działa natychmiast
- [ ] Wszystkie skróty klawiszowe działają
- [ ] Settings zapisują się i wczytują
- [ ] Import .txt file działa
- [ ] Screen share detection ukrywa okno

**Performance:**
- [ ] CPU < 5% podczas scrollowania
- [ ] RAM < 150 MB
- [ ] Startup < 3 sekundy

**UX:**
- [ ] Intuicyjny dla non-tech użytkownika
- [ ] Tooltip'y wyjaśniają funkcje
- [ ] Błędy nie crashują aplikacji

---

## 10. ROADMAP PO MVP

### Wersja 1.1 (2-4 tygodnie):
- Voice-activated scrolling
- Eksport do PDF/Word
- Statystyki czytania

### Wersja 1.2 (1-2 miesiące):
- Multiple scripts/projekty
- Cloud backup (opcjonalny)
- Integracja z Notion/Google Docs

### Wersja 2.0 (3-6 miesięcy):
- Mobile app (iOS/Android)
- AI script generator
- Collaboration features

---

## 11. MONETYZACJA (OPCJONALNIE)

### Model MVP:
- **$29.99 one-time payment**
- Sprzedaż przez Gumroad lub Lemon Squeezy
- Activation key system (electron-license)

### Free Trial:
- 7-day trial, potem wymaga licencji
- Watermark na "unlicensed" wersji

---

## 12. MARKETING & LAUNCH

### Pre-launch:
1. Landing page (jak w przykładzie)
2. Product Hunt submission
3. Reddit (r/SideProject, r/Entrepreneur)
4. Twitter/X launch thread

### Post-launch:
1. YouTube demo video
2. Cold email do YouTuberów
3. Indie Hackers case study

---

## GOTOWY DO STARTU?

### Next Steps:
1. **Dzień 1-2**: Setup projektu, podstawowe okno
2. **Dzień 3-4**: Auto-scroll i kontrolki
3. **Dzień 5-6**: Settings i storage
4. **Dzień 7**: Screen share detection
5. **Dzień 8-10**: Polish UI, testowanie
6. **Dzień 11-14**: Landing page, payment, launch

### Potrzebna pomoc z:
- Konkretnym kodem?
- Architekturą konkretnej funkcji?
- Debugowaniem?
- Deployment?

**Daj znać od czego chcesz zacząć, a dostarczę szczegółowy kod!** 🚀
