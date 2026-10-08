import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '../infrastructure/persistence/storageKeys';
import { loadCollection } from '../infrastructure/persistence/migrateStorage';
import { DataGateway } from '../application/DataGateway';
import initialTasks from '../data/preventive/seedPreventiveTasks.json';
import initialActions from '../data/preventive/seedPreventiveActions.json';
import initialGuides from '../data/preventive/seedPreventiveGuides.json';
import PreventiveService from '../application/services/PreventiveService';
import { dataIntegrityService } from '../services/dataIntegrityService';

/**
 * Hook for managing Preventive Maintenance state (Primary Matrix + Secondary Plans/Guides/Actions).
 * Enforces SSOT:
 * - Reads ONLY canonical keys (STORAGE_KEYS.PREVENTIVE_TASKS, etc.)
 * - Zero automatic seed writes on startup
 * - Respects user arrays of any length (including [] or length === 3)
 */
export function usePreventiveSubState(groupedState = {}) {
  // 1. Actions State (C, N, G, V, R, S, L...)
  const [actions, setActions] = useState(() => {
    if (Array.isArray(groupedState.actions)) {
      return groupedState.actions;
    }
    return loadCollection(STORAGE_KEYS.PREVENTIVE_ACTIONS, {
      allowDemoFallback: true,
      demoSeed: initialActions,
    });
  });

  // 2. Guides State (Technical instruction sheets)
  const [guides, setGuides] = useState(() => {
    if (Array.isArray(groupedState.guides)) {
      return groupedState.guides;
    }
    return loadCollection(STORAGE_KEYS.PREVENTIVE_GUIDES, {
      allowDemoFallback: true,
      demoSeed: initialGuides,
    });
  });

  // 3. Plans State (Engineered maintenance plans)
  const [plans, setPlans] = useState(() => {
    if (Array.isArray(groupedState.plans)) return groupedState.plans;
    return loadCollection(STORAGE_KEYS.PREVENTIVE_PLANS, {
      allowDemoFallback: true,
      demoSeed: [],
    });
  });

  // 4. Preventive Execution Tasks State
  const [tasks, setTasks] = useState(() => {
    const groupedTasks = groupedState.preventiveTasks || groupedState.tasks;
    if (Array.isArray(groupedTasks)) {
      return groupedTasks;
    }
    return loadCollection(STORAGE_KEYS.PREVENTIVE_TASKS, {
      allowDemoFallback: true,
      demoSeed: initialTasks,
    });
  });

  // Auto-persist tasks whenever setTasks is called (including Purge / Relink in Settings)
  useEffect(() => {
    try {
      DataGateway.savePreventiveTasks(tasks);
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      DataGateway.savePreventiveActions(actions);
    } catch {}
  }, [actions]);

  useEffect(() => {
    try {
      DataGateway.savePreventiveGuides(guides);
    } catch {}
  }, [guides]);

  useEffect(() => {
    try {
      DataGateway.savePreventivePlans(plans);
    } catch {}
  }, [plans]);

  // Synchronize with external events (Excel import, vault restore, service updates)
  useEffect(() => {
    const handleTasksUpdated = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTasks(e.detail);
      } else {
        const current = PreventiveService.getTasks();
        if (Array.isArray(current)) {
          setTasks(current);
        }
      }
    };

    window.addEventListener('preventive_tasks_updated', handleTasksUpdated);

    return () => {
      window.removeEventListener('preventive_tasks_updated', handleTasksUpdated);
    };
  }, []);

  // Handlers for Tasks
  const handleUpdateTask = useCallback((id, updates) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t));
      DataGateway.savePreventiveTasks(next);
      return next;
    });
  }, []);

  const handleDeleteTask = useCallback((id) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      DataGateway.savePreventiveTasks(next);
      return next;
    });
  }, []);

  const handleUpdateTaskCounter = useCallback((id, newCounterValue) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, dernier_releve: Number(newCounterValue || 0), updated_at: new Date().toISOString() } : t));
      DataGateway.savePreventiveTasks(next);
      return next;
    });
  }, []);

  const handleMarkTaskDone = useCallback((id, validationData) => {
    setTasks(() => {
      const updated = PreventiveService.markTaskAsDone(id, validationData);
      return updated;
    });
  }, []);

  const handleCreatePlanWithTasks = useCallback((planData, taskItems) => {
    const result = PreventiveService.createPlanWithTasks(planData, taskItems);
    setPlans((prev) => [result.plan, ...prev]);
    setTasks((prev) => [...result.tasks, ...prev]);
    return result;
  }, []);

  // Handlers for Actions
  const handleAddAction = useCallback((actionData) => {
    const updated = PreventiveService.addAction(actionData);
    setActions(updated);
    return updated;
  }, []);

  const handleUpdateAction = useCallback((id, actionData) => {
    const updated = PreventiveService.updateAction(id, actionData);
    setActions(updated);
    return updated;
  }, []);

  const handleDeleteAction = useCallback((id) => {
    const updated = PreventiveService.deleteAction(id);
    setActions(updated);
    return updated;
  }, []);

  // Handlers for Guides
  const handleAddGuide = useCallback((guideData) => {
    const updated = PreventiveService.addGuide(guideData);
    setGuides(updated);
    return updated;
  }, []);

  const handleUpdateGuide = useCallback((id, guideData) => {
    const updated = PreventiveService.updateGuide(id, guideData);
    setGuides(updated);
    return updated;
  }, []);

  const handleDeleteGuide = useCallback((id) => {
    const updated = PreventiveService.deleteGuide(id);
    setGuides(updated);
    return updated;
  }, []);

  // Clear / Reset to baseline explicitly (User-initiated only)
  const handleResetPreventiveToBaseline = useCallback(async (ctx = {}) => {
    const { machines = [], skipConfirm = false } = ctx;
    const impact = dataIntegrityService.previewClearImpact({
      action: 'RESET_PREVENTIVE_BASELINE',
      machines,
      preventiveTasks: tasks,
      correctiveInterventions: [],
    });

    const msg =
      `Réinitialiser le préventif au baseline seed (${initialTasks.length} tâches) ?\n` +
      `• Tâches actuelles: ${impact.preventiveCount}\n` +
      `• Machines enregistrées: ${impact.machineCount}\n` +
      (impact.warnings?.length ? `\n${impact.warnings.join('\n')}` : '') +
      `\n\nLes machines ne seront PAS modifiées.`;

    if (!skipConfirm && typeof window !== 'undefined' && !window.confirm(msg)) {
      return { cancelled: true };
    }

    setTasks(initialTasks);
    setActions(initialActions);
    setGuides(initialGuides);
    setPlans([]);
    DataGateway.savePreventiveTasks(initialTasks, { machines });
    DataGateway.savePreventiveActions(initialActions);
    DataGateway.savePreventiveGuides(initialGuides);
    DataGateway.savePreventivePlans([]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('preventive_tasks_updated', { detail: initialTasks }));
    }

    const orphans = dataIntegrityService
      .annotatePreventiveOrphans(initialTasks, machines)
      .filter((t) => t._isOrphan);

    return {
      cancelled: false,
      restoredCount: initialTasks.length,
      orphanCountAfter: orphans.length,
    };
  }, [tasks]);

  // Clear all preventive data to start empty for real factory deployment
  const handleClearPreventiveForRealFactory = useCallback((ctx = {}) => {
    const { machines = [], skipConfirm = false } = ctx;
    const impact = dataIntegrityService.previewClearImpact({
      action: 'CLEAR_PREVENTIVE',
      machines,
      preventiveTasks: tasks,
      correctiveInterventions: [],
    });

    const msg =
      `Vider TOUTES les tâches préventives pour déploiement usine réelle ?\n` +
      `• ${impact.preventiveCount} tâche(s) seront supprimées.\n` +
      `• Les machines et le correctif ne seront PAS touchés.\n` +
      `\nAction irréversible (sauf backup).`;

    if (!skipConfirm && typeof window !== 'undefined' && !window.confirm(msg)) {
      return { cancelled: true };
    }

    setTasks([]);
    setPlans([]);
    DataGateway.savePreventiveTasks([]);
    DataGateway.savePreventivePlans([]);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('preventive_tasks_updated', { detail: [] }));
    }

    return { cancelled: false, clearedCount: impact.preventiveCount };
  }, [tasks]);

  return {
    tasks,
    setTasks,
    actions,
    setActions,
    guides,
    setGuides,
    plans,
    setPlans,
    handleUpdateTask,
    handleDeleteTask,
    handleUpdateTaskCounter,
    handleMarkTaskDone,
    handleCreatePlanWithTasks,
    handleAddAction,
    handleUpdateAction,
    handleDeleteAction,
    handleAddGuide,
    handleUpdateGuide,
    handleDeleteGuide,
    handleResetPreventiveToBaseline,
    handleClearPreventiveForRealFactory,
  };
}
