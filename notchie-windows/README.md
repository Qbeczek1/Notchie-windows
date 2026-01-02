# Notchie - Teleprompter dla Windows

Teleprompter wyświetlający się jako overlay na ekranie w pozycji kamery, niewidoczny podczas screen share.

## Funkcjonalności MVP

- ✅ Floating window zawsze na wierzchu
- ✅ Przezroczyste tło z regulowaną opacity
- ✅ Możliwość zmiany rozmiaru i pozycji
- ✅ Drag & drop do przesuwania
- ✅ Edytor tekstu z importem/eksportem plików
- ✅ Auto-scroll z regulacją prędkości
- ✅ Globalne skróty klawiszowe
- ✅ Okno ustawień
- ✅ Screen share detection (automatyczne ukrywanie)
- ✅ System tray z menu

## Instalacja

### Wymagania
- Node.js 20+
- npm lub pnpm

### Setup
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Pakowanie dla Windows
```bash
npm run build:win
```

## Skróty Klawiszowe

- `Shift + ←` - Zmniejszenie prędkości scrollowania
- `Shift + →` - Zwiększenie prędkości scrollowania
- `Shift + Space` - Play/Pause toggle
- `Shift + ↑` - Reset do początku

## Struktura Projektu

```
notchie-windows/
├── src/
│   ├── main/           # Electron Main Process
│   ├── renderer/       # React UI
│   └── preload/        # Preload scripts
├── public/             # Assets statyczne
└── docs/               # Dokumentacja
```

## Licencja

MIT
