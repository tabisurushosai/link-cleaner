# Porting Guide

link-cleaner keeps platform-specific APIs outside of pure logic so the same behavior can be reused by Chrome extension, iOS, Android, or other shells.

## Boundaries

- `src/core` is pure TypeScript logic. Do not import `chrome.*`, browser `window`/`document` APIs, native SDKs, network APIs, or storage implementations here.
- `src/core` must compile without Chrome extension types. `npm run build` runs `tsc -p tsconfig.core.json --noEmit` to catch accidental `chrome.*` usage in core modules.
- `src/storage` owns persistence boundaries. App code should call storage use cases through a `LinkCleanerStorageAdapter` implementation.
- UI entry points provide platform services such as the current URL, localized strings, clipboard access, and the storage adapter.

## Storage adapter contract

Native ports should implement `LinkCleanerStorageAdapter` from `src/storage/storage-adapter.ts`.
The adapter is based on the platform-neutral `StorageAdapter<TValues, TKey>` interface:

- `read(keys)` returns a partial object for the requested persisted keys.
- `write(values)` persists only the provided keys and leaves other keys untouched.

`LinkCleanerStorageAdapter` is the app-specific alias for the existing link-cleaner keys. Keep native storage code outside `src/core`; core modules should receive already-loaded values or view-model inputs and should not know where data came from.

The persisted keys and value shapes must stay compatible with the Chrome extension:

- `isPremium?: boolean`
- `trialStartTs?: number`
- `customParams?: string[]`

Chrome uses `chrome.storage.local` in `src/storage/chrome-local-storage-adapter.ts`. iOS or Android ports can map the same values to local storage such as UserDefaults, SharedPreferences, or an app database, as long as the key names and shapes above are preserved.

## iOS and Android shell guidance

- Keep URL cleaning, subscription evaluation, and popup view-model decisions in `src/core`; these modules should stay free of `chrome.*`, WebExtension globals, native SDKs, DOM APIs, and storage implementations.
- Implement one storage adapter per platform in the app shell. The adapter may use UserDefaults, SharedPreferences, or another local-only store, but it should expose only `read` and `write` to shared logic.
- Preserve the existing stored key names and JSON-compatible value shapes so users can migrate data without conversion rules.
- Keep UI code as an adapter layer: provide the current URL, localized strings, clipboard writes, and button/input rendering from the platform shell, then consume core view models for display decisions.
- Do not add network calls, remote code, external fonts, or extra Chrome permissions for portability work.

## Porting checklist

1. Reuse `src/core/url-cleaner.ts`, `src/core/subscription.ts`, and `src/core/popup-view-model.ts` without platform API imports.
2. Add a platform storage adapter that implements `LinkCleanerStorageAdapter`.
3. Pass the adapter into `getSubscriptionStatus`, `getTrackingParams`, `saveCustomParam`, and `buyPremium`.
4. Keep the app offline-only unless the product spec changes.
5. Do not add Chrome permissions or host permissions for the extension port.
