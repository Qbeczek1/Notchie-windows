# 📱 ScriptView Android - Analiza i Plan Implementacji

## 🎯 Cel

Stworzenie wersji telepromptera ScriptView na Androida, która wyświetla tekst jako **overlay nad innymi aplikacjami** (Instagram, TikTok, aplikacja kamera) podczas nagrywania video.

---

## ✅ Czy to możliwe?

**TAK!** Android oferuje mechanizm **System Alert Window** (overlay), który pozwala wyświetlić okno "unoszące się" nad innymi aplikacjami.

### Kluczowa różnica: Kamera vs Screen Recording

| Scenariusz | Overlay widoczny? | Overlay nagrywany? |
|------------|-------------------|-------------------|
| Nagrywanie **kamerą fizyczną** (Instagram Stories, TikTok, Reels) | ✅ TAK | ❌ NIE |
| Nagrywanie **ekranu** (screen recording) | ✅ TAK | ⚠️ TAK |

**Idealne dla telepromptera!** Użytkownik widzi tekst na ekranie, ale kamera nagrywa tylko twarz/świat zewnętrzny.

---

## 🔧 Wymagania Techniczne

### Uprawnienia Android

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
```

### Wymagania systemowe

- **Minimalny Android**: 6.0 (API 23)
- **Docelowy Android**: 8.0+ (API 26) - zalecany dla `TYPE_APPLICATION_OVERLAY`
- **Przyznanie uprawnienia**: Wymaga ręcznej akcji użytkownika w Ustawieniach

---

## 🏗️ Architektura Aplikacji

### Opcja 1: React Native (Zalecana)

**Zalety:**
- Podobny stos technologiczny (React, JavaScript/TypeScript)
- Możliwość współdzielenia logiki z wersją desktop
- Łatwiejsza migracja dla zespołu

**Struktura projektu:**

```
scriptview-android/
├── android/
│   └── app/src/main/java/com/scriptview/
│       ├── OverlayService.kt          # Foreground Service
│       ├── OverlayModule.kt           # Native Module dla React Native
│       └── OverlayPackage.kt          # Package registration
├── src/
│   ├── App.tsx                        # Main App
│   ├── screens/
│   │   ├── EditorScreen.tsx           # Edytor tekstu
│   │   ├── SettingsScreen.tsx         # Ustawienia
│   │   └── PermissionScreen.tsx       # Ekran uprawnień
│   ├── services/
│   │   └── OverlayService.ts          # Bridge do natywnego serwisu
│   ├── store/
│   │   └── useStore.ts                # Zustand (taki sam jak desktop)
│   └── components/
│       └── PrompterOverlay.tsx        # Komponent overlay
├── package.json
└── README.md
```

### Opcja 2: Flutter

**Zalety:**
- Wysoka wydajność
- Dojrzały ekosystem
- Dobre wsparcie dla overlay

### Opcja 3: Kotlin Native

**Zalety:**
- Pełna kontrola nad systemem
- Najlepsza wydajność
- Bezpośredni dostęp do Android API

---

## 📝 Implementacja Overlay Service (Kotlin)

### OverlayService.kt

```kotlin
class OverlayService : Service() {
    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    
    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }
    
    fun showOverlay(text: String, settings: OverlaySettings) {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            settings.height,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )
        
        params.gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
        params.y = settings.yPosition
        
        overlayView = createOverlayView(text, settings)
        windowManager.addView(overlayView, params)
    }
    
    private fun createOverlayView(text: String, settings: OverlaySettings): View {
        val textView = TextView(this).apply {
            this.text = text
            textSize = settings.fontSize
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.argb(
                (settings.opacity * 255).toInt(),
                0, 0, 0
            ))
            gravity = Gravity.CENTER
            setPadding(16, 16, 16, 16)
        }
        return textView
    }
    
    fun hideOverlay() {
        overlayView?.let {
            windowManager.removeView(it)
            overlayView = null
        }
    }
    
    override fun onBind(intent: Intent?): IBinder? = null
}
```

### Sprawdzanie i żądanie uprawnienia

```kotlin
fun checkOverlayPermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        Settings.canDrawOverlays(context)
    } else {
        true
    }
}

fun requestOverlayPermission(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val intent = Intent(
            Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
            Uri.parse("package:${activity.packageName}")
        )
        activity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE)
    }
}
```

---

## 🎨 Funkcjonalności Wersji Android

### MVP (v1.0)

- [ ] **Overlay Window** - Okno nad innymi aplikacjami
- [ ] **Auto-scroll** - Automatyczne przewijanie tekstu
- [ ] **Regulacja prędkości** - Przez gesty lub przyciski
- [ ] **Przezroczystość** - Regulowana opacity tła
- [ ] **Pozycjonowanie** - Drag & drop okna overlay
- [ ] **Foreground Service** - Działanie w tle z notyfikacją
- [ ] **Edytor tekstu** - Prosty edytor w aplikacji
- [ ] **Ustawienia** - Font, rozmiar, prędkość, opacity

### v1.1 (Rozszerzenia)

- [ ] **Floating Action Button** - Mini przycisk sterowania
- [ ] **Gesty** - Swipe do play/pause
- [ ] **Import z chmury** - Google Drive, Dropbox
- [ ] **Widget** - Quick access z home screen
- [ ] **Tryb lustrzany** - Dla kamer z lustrem

### v2.0 (Zaawansowane)

- [ ] **Synchronizacja** - Sync między desktop a mobile
- [ ] **Voice control** - Sterowanie głosem
- [ ] **Bluetooth remote** - Sterowanie pilotem BT

---

## 🚀 Jak zacząć implementację

### Krok 1: Inicjalizacja projektu React Native

```bash
npx react-native init ScriptViewAndroid --template react-native-template-typescript
cd ScriptViewAndroid
npm install zustand @react-native-async-storage/async-storage
```

### Krok 2: Tworzenie Native Module dla Overlay

1. Stwórz `OverlayModule.kt` w `android/app/src/main/java/com/scriptviewandroid/`
2. Zarejestruj moduł w `MainApplication.kt`
3. Stwórz bridge w TypeScript

### Krok 3: Implementacja UI

1. Przenieś komponenty React (dostosuj do React Native)
2. Użyj tego samego store Zustand
3. Dostosuj stylowanie (Tailwind → StyleSheet)

### Krok 4: Testowanie

1. Przetestuj na różnych wersjach Androida (6.0, 8.0, 12, 13, 14)
2. Przetestuj z różnymi aplikacjami (Instagram, TikTok, Camera)
3. Sprawdź zużycie baterii

---

## ⚠️ Ograniczenia i Wyzwania

### 1. Uprawnienie SYSTEM_ALERT_WINDOW

- Wymaga ręcznego przyznania przez użytkownika
- Niektóre producenci (Xiaomi, Huawei) mają dodatkowe ograniczenia
- Na Androidzie 10+ jest bardziej restrykcyjne

### 2. Tryby oszczędzania baterii

- Doze mode może zatrzymać serwis
- Battery Saver może ukryć overlay
- Rozwiązanie: Foreground Service z notyfikacją

### 3. Kompatybilność z aplikacjami

- Niektóre aplikacje bankowe blokują overlay (flaga `FLAG_SECURE`)
- Instagram/TikTok działają bez problemów ✅

### 4. Zużycie baterii

- Auto-scroll w 60 FPS może być intensywny
- Rozwiązanie: Optymalizacja animacji, opcja 30 FPS

---

## 📊 Porównanie z konkurencją

| Aplikacja | Overlay | Auto-scroll | Darmowa | Open Source |
|-----------|---------|-------------|---------|-------------|
| **ScriptView Android** | ✅ | ✅ | ✅ | ✅ |
| Teleprompter Pro | ✅ | ✅ | ❌ ($9.99) | ❌ |
| BigVu | ✅ | ✅ | Freemium | ❌ |
| PromptSmart | ❌ | Voice | ❌ ($19.99) | ❌ |

---

## 🎬 Demo Flow

1. Użytkownik otwiera ScriptView Android
2. Wpisuje/wkleja skrypt
3. Przechodzi do Instagram/TikTok
4. ScriptView pokazuje overlay z tekstem
5. Użytkownik nagrywa video widząc tekst
6. Tekst auto-scrolluje się
7. Nagranie NIE zawiera tekstu - tylko twarz użytkownika

---

## 📅 Szacowany czas implementacji

| Faza | Czas | Opis |
|------|------|------|
| Setup & Native Module | 1 tydzień | Konfiguracja RN, Overlay Service |
| UI & Komponenty | 1 tydzień | Edytor, Settings, Prompter |
| Auto-scroll & Gesty | 3-4 dni | Logika przewijania |
| Testowanie | 1 tydzień | Różne urządzenia, edge cases |
| **Razem** | **~3-4 tygodnie** | Do MVP |

---

## 🔗 Przydatne zasoby

- [Android WindowManager](https://developer.android.com/reference/android/view/WindowManager)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-android)
- [System Alert Window Guide](https://developer.android.com/reference/android/Manifest.permission#SYSTEM_ALERT_WINDOW)
- [Foreground Services](https://developer.android.com/guide/components/foreground-services)

---

## ✅ Podsumowanie

**Tak, wersja Android ScriptView z overlay nad Instagram/TikTok jest w pełni możliwa i technicznie wykonalna.**

Kluczowe punkty:
1. ✅ Android wspiera overlay windows
2. ✅ Overlay jest widoczny dla użytkownika, ale NIE jest nagrywany przez kamerę
3. ✅ Można użyć React Native dla łatwej migracji
4. ⚠️ Wymaga ręcznego uprawnienia od użytkownika
5. 📅 MVP w ~3-4 tygodnie

---

*Dokument utworzony: 2 stycznia 2026*
*Ostatnia aktualizacja: 2 stycznia 2026*
