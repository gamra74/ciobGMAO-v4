import { useMemo, useSyncExternalStore, useEffect, useRef } from 'react';
import { safeNum } from '../utils/formulaEngine';
import { stockIndexStore } from '../application/StockIndexStore';
import { reactiveCalculationEngine } from '../services/reactiveCalculationEngine';

/**
 * High-Performance Hook to compute real-time stock calculations, warehouse stock, KPIs, and fallback lists.
 * Utilizes stockIndexStore for O(1) indexed lookups and eliminates linear array scans over movement history.
 * Strictly respects SSOT: never substitutes short or empty user arrays with legacy seedData.js!
 */
export function useAppCalculations({
  rawStock = [],
  mouvements = [],
  designations = [],
  families = [],
  templates = [],
  warehouseItems = [],
}) {
  const lastMouvementsLengthRef = useRef(0);

  // Sync movements into O(1) stock index store whenever movements change
  useEffect(() => {
    if (!mouvements) return;

    if (
      lastMouvementsLengthRef.current === mouvements.length &&
      stockIndexStore.isHydrated()
    ) {
      return;
    }

    const deltas = mouvements.map((m) => ({
      ref: m.ref || m['Référence'] || m['Reference'] || '',
      type: m.type || m['Type (Entrée/Sortie)'] || '',
      quantity: safeNum(m.quantite != null ? m.quantite : m['Quantité'], 0),
    }));

    stockIndexStore.index.rebuild(deltas);
    stockIndexStore.markHydrated();
    stockIndexStore.notifyAll();
    lastMouvementsLengthRef.current = mouvements.length;
  }, [mouvements]);

  // Subscribe to index version changes via useSyncExternalStore
  const globalVersion = useSyncExternalStore(
    stockIndexStore.subscribeAll,
    stockIndexStore.getGlobalVersion,
    () => 0
  );

  // Compute Full Stock with Dynamic O(1) Lookups & Reactive Engine
  const stockItems = useMemo(() => {
    return reactiveCalculationEngine.recalculateStockReactive(rawStock, mouvements);
  }, [rawStock, mouvements, globalVersion]);

  const effectiveDesignations = useMemo(() => {
    if (
      Array.isArray(designations) &&
      designations.length > 0 &&
      designations.some((d) => (d.ref || d.id_designation) && (d.designation || d.libelle))
    ) {
      return designations;
    }
    if (Array.isArray(stockItems) && stockItems.length > 0) {
      return stockItems.map((s) => ({
        id: s.id,
        ref: s.ref,
        designation: s.designation,
        id_type: s.id_type || s.type || 'Standard',
        type: s.type || s.id_type || 'Standard',
        stockInitial: s.stockInitial || 0,
        seuil: s.seuil || 3,
        emplacement: s.emplacement || 'A1-R1',
      }));
    }
    return designations || [];
  }, [designations, stockItems]);

  const effectiveFamilies = useMemo(() => {
    return Array.isArray(families) ? families : [];
  }, [families]);

  const effectiveTemplates = useMemo(() => {
    return Array.isArray(templates) ? templates : [];
  }, [templates]);

  const diagnostics = effectiveDesignations;

  const warehouseItemsComputed = useMemo(() => {
    return warehouseItems.map((item) => {
      const itemKey = String(item.id_warehouse_item || item.ref || '').trim();
      const initial = safeNum(item.stockInitial, 1);
      const totals = stockIndexStore.index.getTotals(itemKey);
      const stockActuel = initial + totals.entrees - totals.sorties;

      const seuil = safeNum(item.seuil, 0);
      let alerte = 'OK';
      if (stockActuel <= 0) alerte = 'RUPTURE';
      else if (stockActuel <= seuil && seuil > 0) alerte = 'ALERTE';

      return {
        ...item,
        stockInitial: initial,
        entrees: totals.entrees,
        sorties: totals.sorties,
        commandes: totals.commandes,
        stockActuel,
        seuil,
        alerte,
      };
    });
  }, [warehouseItems, globalVersion]);

  // Stock KPIs computed efficiently via Reactive Engine
  const stockKPIs = useMemo(() => {
    return reactiveCalculationEngine.computeStockKPIs(stockItems);
  }, [stockItems]);

  return {
    stockItems,
    effectiveDesignations,
    effectiveFamilies,
    effectiveTemplates,
    diagnostics,
    warehouseItemsComputed,
    stockKPIs,
    reactiveEngine: reactiveCalculationEngine,
  };
}
