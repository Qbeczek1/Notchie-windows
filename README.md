# 🎬 Notchie - Teleprompter dla Windows

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-39.2-blue.svg)
![React](https://img.shields.io/badge/React-19.2-blue.svg)

**Teleprompter wyświetlający tekst jako overlay na ekranie**

[Features](#-funkcjonalności) • [Installation](#-instalacja) • [Usage](#-użycie) • [Development](#-rozwój) • [Contributing](#-współpraca)

</div>

---

## 📖 O Projekcie

**Notchie** to aplikacja telepromptera dla Windows, która wyświetla tekst jako przezroczysty overlay na ekranie. Idealna do nagrywania video, prowadzenia video calli i prezentacji, gdzie potrzebujesz czytać skrypt patrząc jednocześnie w kamerę.

### ✨ Kluczowe Cechy

- 🎯 **Zawsze na wierzchu** - Okno zawsze widoczne nad innymi aplikacjami
- 👻 **Przezroczyste tło** - Regulowana przezroczystość dla lepszej czytelności
- 🎬 **Auto-scroll** - Automatyczne przewijanie tekstu z regulacją prędkości
- ⌨️ **Globalne skróty** - Sterowanie bez fokusa okna
- 🎨 **Pełna personalizacja** - Rozmiar czcionki, rodzina, prędkość scrollowania
- 📁 **Import/Eksport** - Wczytuj i zapisuj skrypty z plików .txt
- 🎛️ **System Tray** - Minimalistyczna kontrola przez tray icon
- ℹ️ **Okno About** - Informacje o aplikacji dostępne z paska kontrolnego

---

## 🚀 Funkcjonalności

### MVP (v1.0)

#### Podstawowe Okno

- ✅ Floating window zawsze na wierzchu
- ✅ Przezroczyste tło z regulowaną opacity (0.1-1.0)
- ✅ Zmiana rozmiaru i pozycji okna
- ✅ Brak ramki (frameless window)
- ✅ Drag & drop do przesuwania

#### Edycja Tekstu

- ✅ Prosty edytor tekstu (textarea)
- ✅ Zapisywanie skryptu lokalnie
- ✅ Import tekstu z pliku .txt
- ✅ Eksport do pliku .txt
- ✅ Live preview zmian w prompterze

#### Auto-Scroll

- ✅ Automatyczne przewijanie tekstu (60 FPS)
- ✅ Regulacja prędkości (0.5-10 px/frame)
- ✅ Pause on hover (najazd myszką pauzuje)
- ✅ Manual scroll (scroll wheel)
- ✅ Reset do początku

#### Globalne Skróty Klawiszowe

- ✅ `Shift + ←` - Zmniejszenie prędkości
- ✅ `Shift + →` - Zwiększenie prędkości
- ✅ `Shift + Space` - Play/Pause toggle
- ✅ `Shift + ↑` - Reset do początku

#### Ustawienia

- ✅ Okno settings (osobne)
- ✅ Regulacja szerokości/wysokości okna (200-2000px / 50-1000px)
- ✅ Regulacja opacity tła (0.1-1.0)
- ✅ Wybór czcionki (Arial, Helvetica, Verdana, Segoe UI, Roboto)
- ✅ Regulacja rozmiaru czcionki (12-48px)
- ✅ Prędkość scrollowania (default: 2 px/frame)

#### TODO: Screen Share Detection

- Wykrywanie gdy użytkownik sharuje ekran
- Automatyczne ukrywanie okna podczas share
- Przywracanie po zakończeniu share

#### System Tray

- ✅ Tray icon w notification area
- ✅ Menu kontekstowe (Show/Hide, Editor, Settings, About, Quit)
- ✅ Kliknięcie lewym przyciskiem - toggle widoczności

#### Okno About

- ✅ Informacje o aplikacji i wersji
- ✅ Dostępne z paska kontrolnego (ikona Info)
- ✅ Dostępne z menu tray

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Electron](https://www.electronjs.org/) 39.2.7
- **UI Library**: [React](https://react.dev/) 19.2.3
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 4.1.18
- **PostCSS Plugin**: [@tailwindcss/postcss](https://tailwindcss.com/) 4.1.18
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) 5.0.9
- **Icons**: [Lucide React](https://lucide.dev/) 0.562.0

### Backend/System

- **Runtime**: Node.js 20+
- **File System**: `fs/promises` (Node.js native)
- **Shortcuts**: `electron-globalShortcut`
- **Window Management**: Electron BrowserWindow API
- **Screen Capture**: `electron-desktopCapturer`
- **Storage**: [electron-store](https://github.com/sindresorhus/electron-store) 11.0.2

### Build & Development

- **Build Tool**: [Vite](https://vitejs.dev/) 7.3.0
- **Electron Vite**: [electron-vite](https://github.com/alex8088/electron-vite) 5.0.0
- **React Plugin**: [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) 5.1.2
- **Electron Builder**: [electron-builder](https://www.electron.build/) 26.0.12
- **Package Manager**: npm

---

## 📦 Instalacja

### Wymagania

- **OS**: Windows 10/11
- **Node.js**: 20+ (tylko do development)
- **npm**: 9+ lub pnpm 8+

### Development Setup

1. **Sklonuj repozytorium**

   ```bash
   git clone https://github.com/Qbeczek1/notchie-windows.git
   cd notchie-windows
   ```

2. **Zainstaluj zależności**

   ```bash
   npm install
   ```

3. **Uruchom w trybie deweloperskim**
   ```bash
   npm run dev
   ```

### Build Produkcyjny

1. **Zbuduj aplikację**

   ```bash
   npm run build
   ```

2. **Utwórz installer dla Windows**

   ```bash
   npm run build:win
   ```

   Instalator znajdziesz w folderze `release/`.

---

## 💻 Użycie

### Pierwsze Uruchomienie

1. Uruchom aplikację - otworzy się okno telepromptera
2. Kliknij prawym przyciskiem na tray icon → **"Otwórz Edytor"**
3. Wpisz lub wklej swój skrypt
4. Przeciągnij okno telepromptera do pozycji kamery
5. Użyj `Shift + Space` aby rozpocząć auto-scroll

### Podstawowe Operacje

#### Edycja Tekstu

- **Otwórz Edytor**: Tray icon → "Otwórz Edytor" lub `Ctrl + E` (w przyszłości)
- **Wczytaj z pliku**: Przycisk "Wczytaj z pliku" w edytorze
- **Zapisz do pliku**: Przycisk "Zapisz do pliku" w edytorze
- **Live Preview**: Zmiany w edytorze są widoczne natychmiast w prompterze

#### Sterowanie Scrollowaniem

- **Play/Pause**: `Shift + Space`
- **Zwiększ prędkość**: `Shift + →`
- **Zmniejsz prędkość**: `Shift + ←`
- **Reset**: `Shift + ↑`
- **Manual scroll**: Scroll wheel myszy
- **Pause on hover**: Najedź myszką na okno

#### Ustawienia

- **Otwórz Ustawienia**: Tray icon → "Ustawienia" lub ikona Settings w pasku kontrolnym
- **Font Size**: Slider 12-48px
- **Font Family**: Dropdown z dostępnymi czcionkami
- **Scroll Speed**: Slider 0.2-1.8 px/frame
- **Opacity**: Slider 0.1-1.0 (10%-100%)
- **Window Size**: Inputy dla szerokości i wysokości

#### Okno About

- **Otwórz About**: Tray icon → "O aplikacji" lub ikona Info w pasku kontrolnym
- Wyświetla informacje o wersji aplikacji i technologiach

### Skróty Klawiszowe

| Skrót           | Akcja                          |
| --------------- | ------------------------------ |
| `Shift + ←`     | Zmniejsz prędkość scrollowania |
| `Shift + →`     | Zwiększ prędkość scrollowania  |
| `Shift + Space` | Play/Pause toggle              |
| `Shift + ↑`     | Reset do początku              |

> **Uwaga**: Skróty działają globalnie, nawet gdy okno nie ma fokusa.

---

## ⚙️ Konfiguracja

### Pliki Konfiguracyjne

Ustawienia aplikacji są przechowywane w:

- **Windows**: `%APPDATA%\notchie-windows\config.json`
- **Skrypty**: `%USERPROFILE%\Documents\Notchie\`

### Struktura Ustawień

```json
{
  "lastScript": "",
  "scrollSpeed": 2,
  "fontSize": 24,
  "fontFamily": "Arial, sans-serif",
  "opacity": 0.9,
  "windowWidth": 600,
  "windowHeight": 150,
  "windowX": undefined,
  "windowY": undefined
}
```

### Zmiana Domyślnych Ustawień

Edytuj plik `src/main/constants.js`:

```javascript
export const DEFAULT_SETTINGS = {
  fontSize: 24, // Zmień domyślny rozmiar czcionki
  fontFamily: "Arial, sans-serif",
  scrollSpeed: 2, // Zmień domyślną prędkość
  opacity: 0.9,
  windowWidth: 600,
  windowHeight: 150,
};
```

---

## 🔧 Rozwój

### Struktura Projektu

```
notchie-windows/
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.js            # Entry point
│   │   ├── windowManager.js    # Zarządzanie oknami
│   │   ├── shortcuts.js        # Globalne skróty
│   │   ├── screenShare.js      # Detekcja screen share
│   │   ├── fileManager.js      # Operacje na plikach
│   │   ├── editorWindow.js     # Okno edytora
│   │   ├── settingsWindow.js   # Okno ustawień
│   │   ├── aboutWindow.js      # Okno About
│   │   ├── tray.js             # System tray
│   │   ├── storage.js          # electron-store
│   │   ├── constants.js        # Stałe aplikacji
│   │   └── utils/              # Narzędzia pomocnicze
│   │       ├── logger.js       # Logging
│   │       ├── validators.js   # Walidacja danych
│   │       └── errorHandler.js # Error handling
│   │
│   ├── renderer/                # Electron Renderer (React)
│   │   ├── App.jsx             # Root component
│   │   ├── components/
│   │   │   ├── Prompter.jsx    # Główne okno telepromptera
│   │   │   ├── Editor.jsx      # Edytor tekstu
│   │   │   ├── Settings.jsx    # Okno ustawień
│   │   │   └── About.jsx       # Okno About
│   │   ├── hooks/
│   │   │   └── useScroll.js    # Logika auto-scrollu
│   │   ├── store/
│   │   │   └── useStore.js     # Zustand store
│   │   └── main.jsx            # Entry point
│   │
│   └── preload/
│       └── index.js            # Bridge między main i renderer
│
├── public/                      # Assets statyczne
├── docs/                        # Dokumentacja
├── package.json
├── electron.vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── electron-builder.yml
```

### Skrypty NPM

```bash
# Development
npm run dev              # Uruchom w trybie deweloperskim z hot-reload

# Build
npm run build            # Zbuduj aplikację
npm run preview          # Testuj build lokalnie

# Distribution
npm run build:win        # Utwórz installer dla Windows
npm run dist             # Build + pakowanie
```

### Najlepsze Praktyki

Projekt stosuje najlepsze praktyki programistyczne:

- ✅ **Bezpieczeństwo**: Context Isolation, walidacja danych, safe IPC
- ✅ **Wydajność**: React.memo, useCallback, useMemo, debouncing
- ✅ **Utrzymywalność**: Modularna struktura, JSDoc, structured logging
- ✅ **Niezawodność**: Comprehensive error handling, fallback values
- ✅ **Developer Experience**: Structured logging, debugging tools

### Debugging

#### Main Process

Logi są wyświetlane w konsoli terminala. W development mode wszystkie poziomy są widoczne.

#### Renderer Process

Otwórz DevTools:

- Automatycznie w development mode
- Lub dodaj `prompterWindow.webContents.openDevTools()` w kodzie

#### Logging

```javascript
import { createLogger } from "./utils/logger.js";
const logger = createLogger("MyModule");

logger.info("Informacja");
logger.warn("Ostrzeżenie");
logger.error("Błąd", error);
logger.debug("Debug info");
```

---

## 🐛 Troubleshooting

### Problem: Okno nie jest przezroczyste

**Rozwiązanie**:

- Sprawdź czy używasz Windows 10/11
- Upewnij się, że `transparent: true` jest ustawione w `windowManager.js`

### Problem: Skróty klawiszowe nie działają

**Rozwiązanie**:

- Sprawdź czy nie ma konfliktów z innymi aplikacjami
- Uruchom aplikację jako administrator (jeśli wymagane)
- Sprawdź logi w konsoli

### Problem: Screen share detection nie działa

**Rozwiązanie**:

- To jest znane ograniczenie Electron - detection może nie działać w 100%
- Użyj ręcznego przełączania przez tray icon
- Sprawdź czy aplikacja ma uprawnienia do screen capture

### Problem: Aplikacja nie zapisuje ustawień

**Rozwiązanie**:

- Sprawdź uprawnienia do zapisu w `%APPDATA%\notchie-windows\`
- Sprawdź logi w konsoli
- Sprawdź czy `electron-store` jest poprawnie zainstalowany

### Problem: Build nie działa

**Rozwiązanie**:

```bash
# Wyczyść cache
rm -rf node_modules dist out release
npm install
npm run build
```

### Problem: Błąd Tailwind CSS PostCSS

**Rozwiązanie**:

- Tailwind CSS 4 wymaga pakietu `@tailwindcss/postcss`
- Upewnij się, że masz zainstalowany: `npm install @tailwindcss/postcss --save-dev`
- Sprawdź konfigurację w `postcss.config.js` i `electron.vite.config.js`

---

## 🗺️ Roadmap

### v1.1 (Planowane)

- [ ] Voice-activated scrolling (Web Speech API)
- [ ] Eksport do PDF/Word
- [ ] Statystyki czytania (czas, słowa/minutę)
- [ ] Więcej skrótów klawiszowych

### v1.2 (Planowane)

- [ ] Multiple scripts/projekty
- [ ] Cloud backup (opcjonalny)
- [ ] Integracja z Notion/Google Docs
- [ ] Markdown support

### v2.0 (Długoterminowe)

- [ ] Mobile app (iOS/Android)
- [ ] AI script generator
- [ ] Collaboration features
- [ ] Theme system (Dark/Light)

---

## 🤝 Współpraca

Contributions są mile widziane!

### Jak Współpracować

1. **Fork** repozytorium
2. **Utwórz** branch dla swojej funkcji (`git checkout -b feature/AmazingFeature`)
3. **Commit** zmiany (`git commit -m 'Add some AmazingFeature'`)
4. **Push** do brancha (`git push origin feature/AmazingFeature`)
5. **Otwórz** Pull Request

### Code Style

- Używaj ESLint/Prettier (jeśli skonfigurowane)
- Pisz JSDoc dla funkcji
- Dodawaj komentarze tam gdzie potrzebne
- Testuj swoje zmiany przed PR

### Reporting Bugs

Użyj [GitHub Issues](https://github.com/Qbeczek1/notchie-windows/issues) i podaj:

- Opis problemu
- Kroki do reprodukcji
- Oczekiwane vs rzeczywiste zachowanie
- Screenshots (jeśli dotyczy)
- System operacyjny i wersja

---

## 📄 Licencja

Ten projekt jest licencjonowany na licencji MIT - zobacz plik [LICENSE](LICENSE) dla szczegółów.

---

## 🙏 Podziękowania

- [Electron](https://www.electronjs.org/) - Framework dla aplikacji desktopowych
- [React](https://react.dev/) - Biblioteka UI
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - Lekki state management
- [Lucide](https://lucide.dev/) - Ikony
- [Vite](https://vitejs.dev/) - Build tool
- Wszystkim contributorom i użytkownikom!

## 🔒 Bezpieczeństwo

Wszystkie zależności są zaktualizowane do najnowszych wersji z poprawkami bezpieczeństwa:

- ✅ Electron 39.2.7 - naprawione podatności ASAR
- ✅ Vite 7.3.0 - naprawione podatności esbuild
- ✅ electron-vite 5.0.0 - naprawione podatności esbuild
- ✅ Wszystkie moduły w najnowszych stabilnych wersjach

Szczegóły: [docs/DEPENDENCIES_AUDIT.md](./docs/DEPENDENCIES_AUDIT.md)

---

## 📞 Kontakt

- **Issues**: [GitHub Issues](https://github.com/Qbeczek1/notchie-windows/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Qbeczek1/notchie-windows/discussions)

---

<div align="center">

**Zrobione z ❤️ dla społeczności**

⭐ Jeśli projekt Ci się podoba, zostaw gwiazdkę!

</div>
