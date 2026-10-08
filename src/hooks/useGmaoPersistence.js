import { useEffect, useRef } from 'react';
import { useAutoSave } from './useAutoSave';
import { useStateSync } from './useStateSync';
import { useEnterpriseDbSync } from './useEnterpriseDbSync';
import { indexedDBService } from '../infrastructure/database/IndexedDBService';
import { STORAGE_KEYS } from '../infrastructure/persistence/storageKeys';
import { isExplicitEmptyFactoryMode, SNAPSHOT_FIELD_MAP } from '../infrastructure/persistence/migrateStorage';

/**
 * Handles persistence, debounced storage, multi-tab sync, IndexedDB L2->L1 self-healing hydration,
 * and Enterprise database sync.
 */
export function useGmaoPersistence({
  state,
  setters,
  validators,
  onStateChange,
}) {
  const hydratedRef = useRef(false);

  // 0. L2 -> L1 IndexedDB Self-Healing Hydration on startup (recovers collections evicted from localStorage)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (isExplicitEmptyFactoryMode()) return;

    let isMounted = true;
    (async () => {
      try {
        const idbSnapshot = await indexedDBService.getItem(STORAGE_KEYS.FULL_STATE_SNAPSHOT, null);
        const restoredPatch = {};

        for (const [canonicalKey, stateProp] of Object.entries(SNAPSHOT_FIELD_MAP)) {
          const currentVal = state?.[stateProp];
          const isCurrentEmpty =
            !currentVal ||
            (Array.isArray(currentVal) && currentVal.length === 0) ||
            (typeof currentVal === 'object' && !Array.isArray(currentVal) && Object.keys(currentVal).length === 0);

          if (!isCurrentEmpty) continue;

          // Check individual key in IndexedDB first, then fallback to idbSnapshot
          let idbVal = await indexedDBService.getItem(canonicalKey, null);
          if (
            (!idbVal || (Array.isArray(idbVal) && idbVal.length === 0)) &&
            idbSnapshot &&
            typeof idbSnapshot === 'object'
          ) {
            idbVal = idbSnapshot[stateProp];
          }

          const hasRecoveredContent =
            (Array.isArray(idbVal) && idbVal.length > 0) ||
            (idbVal && typeof idbVal === 'object' && !Array.isArray(idbVal) && Object.keys(idbVal).length > 0);

          if (hasRecoveredContent) {
            restoredPatch[stateProp] = idbVal;
          }
        }

        if (isMounted && Object.keys(restoredPatch).length > 0 && typeof setters?.applyRemoteStateUpdate === 'function') {
          setters.applyRemoteStateUpdate(restoredPatch);
        }
      } catch {
        // Non-blocking background hydration
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [setters, state]);

  // 1. Debounced auto-save to LocalStorage and IndexedDB batch writes
  const { saveAllState } = useAutoSave(state, 1000, onStateChange);

  // 2. Real-time Multi-Window / Multi-Tab Synchronization via storage events
  useStateSync(setters, validators);

  // 3. Enterprise Domain Repositories synchronization with IndexedDB
  useEnterpriseDbSync(state, setters);

  return { saveAllState };
}
