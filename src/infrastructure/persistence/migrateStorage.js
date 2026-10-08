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
 * Maps canonical STORAGE_KEYS to their corresponding property name inside FULL_STATE_SNAPSHOT ('gmao_full_state_v1').
 */
export const SNAPSHOT_FIELD_MAP = {
  [STORAGE_KEYS.STOCK_TYPES]: 'types',
  [STORAGE_KEYS.DESIGNATIONS]: 'designations',
  [STORAGE_KEYS.RAW_STOCK]: 'rawStock',
  [STORAGE_KEYS.FAMILIES]: 'families',
  [STORAGE_KEYS.TEMPLATES]: 'templates',
  [STORAGE_KEYS.BLUEPRINTS]: 'blueprints',
  [STORAGE_KEYS.MACHINES]: 'machines',
  [STORAGE_KEYS.ZONES]: 'zones',
  [STORAGE_KEYS.MACHINE_BOM]: 'machineElementsLedger',
  [STORAGE_KEYS.WAREHOUSE_ITEMS]: 'warehouseItems',
  [STORAGE_KEYS.ENTREPOT_COMPONENTS]: 'entrepotComponents',
  [STORAGE_KEYS.COMP_GROUPS]: 'compGroups',
  [STORAGE_KEYS.COMP_FAMILIES]: 'compFamilies',
  [STORAGE_KEYS.COMP_TEMPLATES]: 'compTemplates',
  [STORAGE_KEYS.PART_TYPES]: 'partTypes',
  [STORAGE_KEYS.PART_DESIGNATIONS]: 'partDesignations',
  [STORAGE_KEYS.PERSONNEL]: 'users',
  [STORAGE_KEYS.TECHNICIANS]: 'technicians',
  [STORAGE_KEYS.OPERATIONS]: 'operations',
  [STORAGE_KEYS.MOUVEMENTS]: 'mouvements',
  [STORAGE_KEYS.PREVENTIVE_TASKS]: 'preventiveTasks',
  [STORAGE_KEYS.PREVENTIVE_ACTIONS]: 'preventiveActions',
  [STORAGE_KEYS.PREVENTIVE_GUIDES]: 'preventiveGuides',
  [STORAGE_KEYS.PREVENTIVE_PLANS]: 'preventivePlans',
  [STORAGE_KEYS.SORTIE_EXTERNE]: 'sortiesExterne',
  [STORAGE_KEYS.CORRECTIVE_INTERVENTIONS]: 'correctiveInterventions',
  [STORAGE_KEYS.CORRECTIVE_ACTIONS_BY_PANNE]: 'correctiveActionsByPanne',
  [STORAGE_KEYS.CORRECTIVE_PANNE_CATEGORIES]: 'correctivePanneCategories',
  [STORAGE_KEYS.CORRECTIVE_TRAVAUX]: 'correctiveTravauxAFaire',
  [STORAGE_KEYS.CORRECTIVE_INTERVENANTS]: 'correctiveIntervenants',
};

/**
 * Checks whether the user explicitly cleared all data for a real-factory deployment.
 */
export function isExplicitEmptyFactoryMode() {
  try {
    const startMode = storageService.getItem(STORAGE_KEYS.START_MODE);
    const demoFlag = storageService.getItem(STORAGE_KEYS.DEMO_MODE);
    return startMode === 'empty' || demoFlag === false || demoFlag === 'false';
  } catch {
    return false;
  }
}

/**
 * Unified collection loader for Zustand store, sub-state hooks, and domain services.
 * Strictly obeys SSOT and Relational Self-Healing rules:
 * 1. If the user explicitly triggered "Clear All for Real Factory" (`startMode === 'empty'`), respects empty `[]` collections.
 * 2. If a canonical key is missing or was accidentally overwritten with `[]` due to pre-migration race or quota eviction,
 *    attempts recovery from:
 *    a) `FULL_STATE_SNAPSHOT` (`gmao_full_state_v1`)
 *    b) Any surviving legacy key in `LEGACY_KEY_MAP`
 *    c) `demoSeed` (when `allowDemoFallback` is true and not in explicit empty factory mode)
 *
 * @param {string} canonicalKey - Key from STORAGE_KEYS
 * @param {object} options
 * @param {boolean} [options.allowDemoFallback=false] - Whether to return demoSeed when key is absent or uninitialized
 * @param {Array|Object} [options.demoSeed=[]] - Seed data to return when fallback is active
 * @param {Array|Object} [options.emptyDefault=[]] - Default empty value when in explicit empty mode
 */
export function loadCollection(
  canonicalKey,
  { allowDemoFallback = false, demoSeed = [], emptyDefault = [] } = {}
) {
  const explicitEmpty = isExplicitEmptyFactoryMode();
  const saved = storageService.getItem(canonicalKey);

  // 1. Non-empty array in canonical key is always authoritative
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }

  // 2. Non-empty dictionary object in canonical key is authoritative
  if (
    !Array.isArray(emptyDefault) &&
    saved &&
    typeof saved === 'object' &&
    !Array.isArray(saved) &&
    Object.keys(saved).length > 0
  ) {
    return saved;
  }

  // 3. If user explicitly cleared factory data, an existing empty array/object or missing key returns emptyDefault
  if (explicitEmpty) {
    if (Array.isArray(saved)) return saved;
    if (!Array.isArray(emptyDefault) && saved && typeof saved === 'object') return saved;
    return emptyDefault;
  }

  // 4. Self-Healing Step A: Check FULL_STATE_SNAPSHOT ('gmao_full_state_v1') if canonical key is empty/missing
  const snapshotField = SNAPSHOT_FIELD_MAP[canonicalKey];
  if (snapshotField) {
    const snapshot = storageService.getItem(STORAGE_KEYS.FULL_STATE_SNAPSHOT);
    if (snapshot && typeof snapshot === 'object') {
      const snapVal = snapshot[snapshotField];
      if (Array.isArray(snapVal) && snapVal.length > 0) {
        storageService.setItem(canonicalKey, snapVal);
        return snapVal;
      }
      if (
        !Array.isArray(emptyDefault) &&
        snapVal &&
        typeof snapVal === 'object' &&
        !Array.isArray(snapVal) &&
        Object.keys(snapVal).length > 0
      ) {
        storageService.setItem(canonicalKey, snapVal);
        return snapVal;
      }
    }
  }

  // 5. Self-Healing Step B: Check if any legacy key still holds non-empty data for this canonicalKey
  for (const [legacyKey, targetCanonical] of Object.entries(LEGACY_KEY_MAP)) {
    if (targetCanonical === canonicalKey) {
      const legacyVal = storageService.getItem(legacyKey);
      if (Array.isArray(legacyVal) && legacyVal.length > 0) {
        storageService.setItem(canonicalKey, legacyVal);
        return legacyVal;
      }
      if (
        !Array.isArray(emptyDefault) &&
        legacyVal &&
        typeof legacyVal === 'object' &&
        !Array.isArray(legacyVal) &&
        Object.keys(legacyVal).length > 0
      ) {
        storageService.setItem(canonicalKey, legacyVal);
        return legacyVal;
      }
    }
  }

  // 6. Self-Healing Step C: Fallback to baseline demoSeed if allowed and not in explicit empty factory mode
  if (allowDemoFallback && demoSeed !== undefined && demoSeed !== null) {
    const hasSeedContent =
      (Array.isArray(demoSeed) && demoSeed.length > 0) ||
      (!Array.isArray(demoSeed) && typeof demoSeed === 'object' && Object.keys(demoSeed).length > 0);
    if (hasSeedContent) {
      storageService.setItem(canonicalKey, demoSeed);
      return demoSeed;
    }
    return demoSeed;
  }

  if (Array.isArray(saved)) {
    return saved;
  }

  return emptyDefault;
}
