# Medium2Freedium — Recommended Improvements

## 1. Bugs & Logic Issues (High Priority)

### 1.1 URL validation is completely disabled
**Files:** `App.js:85-86`, `screens/HomeScreen.js:10`

The `isMediumLink()` check is commented out in `App.js`, so **any** URL — not just Medium links — gets converted to a Freedium URL. Similarly, in `HomeScreen.js`, `isValidLink` is hardcoded to `true`, making the validation error message dead code.

```js
// App.js:85-86 — the guard is commented out, all URLs pass through
// if (isMediumLink(url))
  const freediumUrl = convertToFreedium(url);
```

```js
// HomeScreen.js:10 — validation always passes
const isValidLink = true;
// isMediumLink(url);  // validate Medium URL
```

**Fix:** Re-enable `isMediumLink()` in both files so that non-Medium URLs are rejected with a helpful error message.

### 1.2 `isShareIntent` parameter is ignored
**File:** `App.js:88`

The `handleUrl` function accepts an `isShareIntent` parameter, but the navigation call hardcodes `isShareIntent: true` regardless of the actual value:

```js
navigationRef.current.navigate('Reader', { url: freediumUrl, isShareIntent: true });
// should be: isShareIntent: isShareIntent (or just shorthand { isShareIntent })
```

This means the back button always tries to open `medium://` even when the app was opened via a deep link (not a share).

### 1.3 `isMediumLink` regex — intentionally broad but could use refinement
**File:** `utils/linkHandler.js:16`

The broad second alternative in the regex exists by design: Medium articles are often hosted on authors' personalized custom domains (e.g., `blog.johndoe.com`, `engineering.company.io`), not just `medium.com`. Because there's no exhaustive list of these domains, the regex intentionally casts a wide net.

However, since this validation is currently **disabled anyway** (see 1.1), if/when it's re-enabled, consider whether its role should be a strict gate or a soft hint. Since the app's primary flow is share-intent (where the user is sharing from a Medium context), the broad regex is reasonable. For the paste-to-read flow, a softer approach like a confirmation prompt ("This doesn't look like a Medium link — open anyway?") would be more user-friendly than a hard block.

### 1.4 Typo in UI text
**File:** `screens/HomeScreen.js:92`

"Broswer" should be "Browser".

---

## 2. Dead Code & Template Leftovers (Medium Priority)

### 2.1 Entire `app/` directory is unused template code
The `app/` directory (`_layout.tsx`, `(tabs)/index.tsx`, `(tabs)/explore.tsx`, `+not-found.tsx`) contains the default Expo Router starter template. The actual app uses `App.js` with `@react-navigation/native-stack` — none of the `app/` directory is loaded.

**Fix:** Delete the entire `app/` directory or run `npm run reset-project` to clean it up.

### 2.2 Unused `navigation/AppNavigator.js`
This file duplicates the navigator defined in `App.js` and is never imported anywhere.

**Fix:** Delete `navigation/AppNavigator.js`.

### 2.3 Unused hooks and constants
- `hooks/useColorScheme.ts` / `useColorScheme.web.ts` / `useThemeColor.ts` — template hooks, not used by actual screens
- `constants/Colors.ts` — theme colors, not referenced by any active code

**Fix:** Delete these files, or adopt them into the real UI for dark mode support.

### 2.4 Unused dependencies
| Package | Reason |
|---------|--------|
| `react-native-exit-app` | Imported nowhere |
| `@react-navigation/bottom-tabs` | Only used in dead template code |
| `expo-router` | App uses `@react-navigation/native-stack` directly |
| `react-dom`, `react-native-web` | Web is not a supported target in practice |

**Fix:** Remove these from `package.json` to reduce bundle size.

### 2.5 Commented-out code throughout
Multiple files contain commented-out code blocks (`isMediumLink` calls, title display, `Attila Vágó` hide rule). This adds noise and makes intent unclear.

**Fix:** Remove commented-out code. Use git history if you need to recover it.

---

## 3. Code Quality (Medium Priority)

### 3.1 Mixed JavaScript and TypeScript
Core app files (`App.js`, `HomeScreen.js`, `ReaderScreen.js`, `linkHandler.js`) are plain JS, while template leftovers are `.tsx`. The project has `tsconfig.json` and `@types/react` configured but doesn't use them.

**Fix:** Either migrate the core files to TypeScript (recommended for a React Native project) or remove the TypeScript configuration to avoid confusion.

### 3.2 No type safety
None of the screen components have typed props. Navigation params, route params, and function arguments are all untyped.

**Fix:** Define navigation param types and use them consistently:
```ts
type RootStackParamList = {
  Home: undefined;
  Reader: { url: string; isShareIntent: boolean };
};
```

### 3.3 Hardcoded color values
The color `#007bff` appears in `App.js`, `HomeScreen.js`, and `ReaderScreen.js`. Other colors like `#fff`, `#333`, `#f5f5f5` are also repeated.

**Fix:** Centralize colors in a constants file (you already have `constants/Colors.ts` — use it).

### 3.4 Console.log in production code
`App.js` and `ReaderScreen.js` contain `console.log` and `console.error` calls. These pollute production logs and can leak URLs.

**Fix:** Remove console statements or use a proper logging library with log-level controls.

---

## 4. Architecture & Resilience (Medium Priority)

### 4.1 No error boundary
If any component throws during render, the entire app crashes with a white screen. React Native has no built-in recovery.

**Fix:** Add a top-level error boundary component that catches render errors and shows a recovery UI.

### 4.2 No loading timeout
If Freedium is slow or down, the user sees a spinner indefinitely with no way to retry or cancel.

**Fix:** Add a timeout (e.g., 15-20 seconds) that shows a "Retry / Go Back" prompt if the page hasn't loaded.

### 4.3 Hardcoded Freedium mirror URL
`utils/linkHandler.js:33` hardcodes `https://freedium-mirror.cfd/`. If this domain goes down, the app is completely broken with no fallback.

**Fix:** Consider:
- A list of fallback mirror URLs
- A remote config endpoint that provides the current working mirror
- At minimum, surface a clear error when the mirror is unreachable

### 4.4 Back button assumes Medium app is installed
`ReaderScreen.js:34` calls `Linking.openURL('medium://')` on back press. If the Medium app isn't installed, this silently fails or throws.

**Fix:** Use `Linking.canOpenURL('medium://')` first, and fall back to `BackHandler.exitApp()` or `navigation.goBack()`.

### 4.5 No offline/network handling
The app doesn't detect network state. If offline, the WebView shows a generic error.

**Fix:** Use `@react-native-community/netinfo` to detect connectivity and show an appropriate offline message.

---

## 5. Testing & CI (High Priority)

### 5.1 Zero tests
There are no test files — no unit tests, integration tests, or end-to-end tests.

**Fix (suggested test plan):**
- **Unit tests** for `utils/linkHandler.js` — test `isMediumLink`, `convertToFreedium`, `extractArticleTitle` with edge cases
- **Component tests** for `HomeScreen` and `ReaderScreen` using React Native Testing Library
- **E2E tests** using Detox or Maestro for the share-to-read flow

### 5.2 No CI/CD pipeline
No GitHub Actions, no automated linting or testing on push/PR.

**Fix:** Add a `.github/workflows/ci.yml` that runs lint and tests on every push/PR.

### 5.3 No pre-commit hooks
Code can be committed with lint errors, console.logs, or failing tests.

**Fix:** Add `husky` + `lint-staged` to run ESLint on staged files before commit.

---

## 6. Security Considerations (Medium Priority)

### 6.1 No URL sanitization before WebView
URLs from user input or share intents are passed directly into `convertToFreedium()` and then to WebView without sanitization. A malicious URL could potentially be crafted to exploit WebView behavior.

**Fix:** Validate and sanitize URLs before passing them to WebView. At minimum, ensure the URL uses `https://` and points to a known domain pattern.

### 6.2 Injected JavaScript is a maintenance risk
The large JS string in `ReaderScreen.js:97-139` manipulates Freedium's DOM. If Freedium changes its page structure, this breaks silently.

**Fix:** Keep the injected JS minimal, add comments documenting what Freedium elements are targeted, and consider a more resilient selector strategy (e.g., CSS class-based hiding via `injectedJavaScriptBeforeContentLoaded`).

---

## 7. UX Enhancements (Low Priority)

| Enhancement | Description |
|-------------|-------------|
| **Dark mode** | The app is light-only. Leverage the existing `Colors.ts` constants and `useColorScheme` hook to add dark theme. |
| **Pull-to-refresh** | Allow users to refresh a failed/stale article in the reader. |
| **Open in browser** | Add a share/open button in the reader header to open the article in an external browser. |
| **Clipboard paste button** | Add a "Paste from clipboard" button next to the URL input for faster workflow. |
| **Article history** | Store recently viewed articles using AsyncStorage so users can revisit them. |
| **Loading progress bar** | Replace the spinner with a WebView progress bar that shows actual load progress. |
| **Empty URL submission guard** | The "Read Article" button is clickable even when the input is empty (since `isValidLink` is hardcoded `true`). |

---

## Summary by Priority

| Priority | Area | Items |
|----------|------|-------|
| **High** | Bugs | Re-enable URL validation, fix `isShareIntent` param, fix typo; refine regex UX when validation is re-enabled |
| **High** | Testing | Add unit tests for linkHandler, add CI pipeline |
| **Medium** | Dead code | Remove template files, unused deps, commented code |
| **Medium** | Code quality | Migrate to TS, centralize colors, remove console.logs |
| **Medium** | Architecture | Error boundary, loading timeout, fallback mirrors, offline handling |
| **Medium** | Security | URL sanitization, robust injected JS |
| **Low** | UX | Dark mode, pull-to-refresh, clipboard paste, article history |
