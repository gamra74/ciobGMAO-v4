import { STORAGE_KEYS, LEGACY_KEY_MAP, OBSOLETE_FLAG_KEYS } from './storageKeys.js';
import { storageService } from '../../utils/storageService.js';
import { Logger } from '../../core/logger/LoggerService.js';

/**
 * One-time storage migration from legacy versioned keys to canonical STORAGE_KEYS.
 * Rules (Non-Negotiable):
 * 1. Runs once on startup (controlled by STORAGE_KEYS.STORAGE_MIGRATED = 'gmao_storage_migrated_v1').
 * 2. For each entry in LEGACY_KEY_MAP: if canonical key is empty/missing and legacy key has valid data, copy to canonical.
 * 3. Never overwrite a non-empty canonical key with legacy data.
 * 4. Delete legacy keys after migration to free quota and eliminate split-brain reads.
 * 5. NEVER load or inject seed data here.
 */
export function migrateStorageOnce() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return { migrated: false, reason: 'no_local_storage' };
  }

  try {
    const alreadyMigrated = storageService.getItem(STORAGE_KEYS.STORAGE_MIGRATED);
    if (alreadyMigrated === true || alreadyMigrated === 'true') {
      return { migrated: false, reason: 'already_migrated' };
    }

    const migratedPairs = [];

    for (const [legacyKey, canonicalKey] of Object.entries(LEGACY_KEY_MAP)) {
      if (legacyKey === canonicalKey) continue;

      const currentCanonical = storageService.getItem(canonicalKey);
      const isCanonicalPopulated =
        (Array.isArray(currentCanonical) && currentCanonical.length > 0) ||
        (currentCanonical &&
          typeof currentCanonical === 'object' &&
          !Array.isArray(currentCanonical) &&
          Object.keys(currentCanonical).length > 0);

      const legacyValue = storageService.getItem(legacyKey);
      const isLegacyPopulated =
        (Array.isArray(legacyValue) && legacyValue.length > 0) ||
        (legacyValue &&
          typeof legacyValue === 'object' &&
          !Array.isArray(legacyValue) &&
          Object.keys(legacyValue).length > 0);

      if (!isCanonicalPopulated && isLegacyPopulated) {
        storageService.setItem(canonicalKey, legacyValue);
        migratedPairs.push({ from: legacyKey, to: canonicalKey });
      }

      // Remove legacy key after checking/copying
      if (localStorage.getItem(legacyKey) !== null) {
        storageService.removeItem(legacyKey);
      }
    }

    // Clean up obsolete initialization flags
    for (const flagKey of OBSOLETE_FLAG_KEYS) {
      if (localStorage.getItem(flagKey) !== null) {
        storageService.removeItem(flagKey);
      }
    }

    // Migrate legacy start_mode ('demo' / 'empty') if DEMO_MODE is not explicitly set yet
    const existingDemoFlag = storageService.getItem(STORAGE_KEYS.DEMO_MODE);
    if (existingDemoFlag === null || existingDemoFlag === undefined) {
      const legacyStartMode = localStorage.getItem('gmao_start_mode');
      if (legacyStartMode === 'empty') {
        storageService.setItem(STORAGE_KEYS.DEMO_MODE, false);
      } else if (legacyStartMode === 'demo') {
        storageService.setItem(STORAGE_KEYS.DEMO_MODE, true);
      }
    }

    storageService.setItem(STORAGE_KEYS.STORAGE_MIGRATED, 'true');

    if (migratedPairs.length > 0) {
      Logger.info(
        `[migrateStorageOnce] Migrated ${migratedPairs.length} legacy key(s) to canonical SSOT keys.`,
        migratedPairs,
        'migrateStorage'
      );
    }

    return { migrated: true, migratedPairs };
  } catch (err) {
    Logger.warn('[migrateStorageOnce] Migration warning:', err, 'migrateStorage');
    return { migrated: false, error: err };
  }
}

/**
 * Unified collection loader for all use*SubState hooks and services.
 * Strictly obeys SSOT rules:
 * - Never rejects a short array (e.g. length === 0 or 2 is valid user data!).
 * - Never auto-writes seed data to localStorage on startup.
 * - Returns demoSeed in memory ONLY if canonical key does not exist AND user explicitly enabled DEMO_MODE.
 *
 * @param {string} canonicalKey - Key from STORAGE_KEYS
 * @param {object} options
 * @param {boolean} [options.allowDemoFallback=false] - Whether to return demoSeed when DEMO_MODE is active and key is absent
 * @param {Array|Object} [options.demoSeed=[]] - Seed data to return when DEMO_MODE is true
 * @param {Array|Object} [options.emptyDefault=[]] - Default empty value when key is absent and DEMO_MODE is false
 */
export function loadCollection(
  canonicalKey,
  { allowDemoFallback = false, demoSeed = [], emptyDefault = [] } = {}
) {
  const saved = storageService.getItem(canonicalKey);

  // If saved is an array (even [] or length === 2), it is authoritative user data
  if (Array.isArray(saved)) {
    return saved;
  }

  // Support dictionary objects (e.g. actionsByPanne, panneCategories)
  if (
    !Array.isArray(emptyDefault) &&
    saved &&
    typeof saved === 'object'
  ) {
    return saved;
  }

  // Key is absent from storage: return emptyDefault unless user explicitly activated DEMO_MODE
  const demoFlag = storageService.getItem(STORAGE_KEYS.DEMO_MODE);
  const demoLoaded = demoFlag === true || demoFlag === 'true';

  if (allowDemoFallback && demoLoaded && demoSeed !== undefined && demoSeed !== null) {
    return demoSeed;
  }

  return emptyDefault;
}
