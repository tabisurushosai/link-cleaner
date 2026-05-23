# Porting Guide

link-cleaner keeps platform-specific APIs outside of pure logic so the same behavior can be reused by Chrome extension, iOS, Android, or other shells.

## Boundaries

- `src/core` is pure TypeScript logic. Do not import `chrome.*`, DOM APIs, native SDKs, network APIs, or storage implementations here.
- `src/storage` owns persistence boundaries. App code should call storage use cases through a `LinkCleanerStorageAdapter` implementation.
- UI entry points provide platform services such as the current URL, localized strings, clipboard access, and the storage adapter.

## Storage adapter contract

Native ports should implement `LinkCleanerStorageAdapter` from `src/storage/storage-adapter.ts`.

The persisted keys and value shapes must stay compatible with the Chrome extension:

- `isPremium?: boolean`
- `trialStartTs?: number`
- `customParams?: string[]`

Chrome uses `chrome.storage.local` in `src/storage/chrome-local-storage-adapter.ts`. iOS or Android ports can map the same values to local storage such as UserDefaults, SharedPreferences, or an app database, as long as the shapes above are preserved.

## Porting checklist

1. Reuse `src/core/url-cleaner.ts`, `src/core/subscription.ts`, and `src/core/popup-view-model.ts` without platform API imports.
2. Add a platform storage adapter that implements `LinkCleanerStorageAdapter`.
3. Pass the adapter into `getSubscriptionStatus`, `getTrackingParams`, `saveCustomParam`, and `buyPremium`.
4. Keep the app offline-only unless the product spec changes.
5. Do not add Chrome permissions or host permissions for the extension port.
