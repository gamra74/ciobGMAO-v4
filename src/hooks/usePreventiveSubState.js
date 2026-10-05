import { useState, useCallback, useEffect } from 'react';
import { storageService } from '../utils/storageService';
import initialTasks from '../data/preventive/seedPreventiveTasks.json';
import initialActions from '../data/preventive/seedPreventiveActions.json';
import initialGuides from '../data/preventive/seedPreventiveGuides.json';
import PreventiveService from '../application/services/PreventiveService';
import { dataIntegrityService } from '../services/dataIntegrityService';

const STORAGE_KEY_TASKS = 'gmao_preventive_tasks_v9';
const STORAGE_KEY_ACTIONS = 'gmao_preventive_actions_v3';
const STORAGE_KEY_GUIDES = 'gmao_preventive_guides_v3';
const STORAGE_KEY_PLANS = 'gmao_preventive_plans_v3';
const STORAGE_KEY_PREVENTIVE_INIT = 'gmao_preventive_initialized_v1';

/**
 * Hook for managing Preventive Maintenance state (Primary Matrix + Secondary Plans/Guides/Actions).
 * Implements Dedicated Clean Seed Architecture (Standard Corrective Pattern)
 */
export function usePreventiveSubState(groupedState = {}) {
  // 1. Actions State (C, N, G, V, R, S, L...)
  const [actions, setActions] = useState(() => {
    if (groupedState.actions && Array.isArray(groupedState.actions) && groupedState.actions.length > 0) {
      return groupedState.actions;
    }
    const saved = storageService.getItem(STORAGE_KEY_ACTIONS);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return initialActions;
  });

  // 2. Guides State (Technical instruction sheets)
  const [guides, setGuides] = useState(() => {
    if (groupedState.guides && Array.isArray(groupedState.guides) && groupedState.guides.length > 0) {
      return groupedState.guides;
    }
    const saved = storageService.getItem(STORAGE_KEY_GUIDES);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return initialGuides;
  });

  // 3. Plans State (Engineered maintenance plans)
  const [plans, setPlans] = useState(() => {
    if (groupedState.plans && Array.isArray(groupedState.plans)) return groupedState.plans;
    const saved = storageService.getItem(STORAGE_KEY_PLANS);
    if (Array.isArray(saved)) return saved;
    return [];
  });

  // 4. Preventive Execution Tasks State (Primary S1-S52 matrix: 1,175 baseline tasks)
  const [tasks, setTasks] = useState(() => {
    if (groupedState.tasks && Array.isArray(groupedState.tasks)) {
      return groupedState.tasks;
    }
    const saved = storageService.getItem(STORAGE_KEY_TASKS);
    const isInit = storageService.getItem(STORAGE_KEY_PREVENTIVE_INIT);
    if (Array.isArray(saved) && (isInit || saved.length > 0)) {
      return saved;
    }
    storageService.setItem(STORAGE_KEY_TASKS, initialTasks);
    storageService.setItem(STORAGE_KEY_PREVENTIVE_INIT, 'true');
    return initialTasks;
  });

  // Auto-persist tasks whenever setTasks is called (including Purge / Relink in Settings)
  useEffect(() => {
    try {
      storageService.setItem(STORAGE_KEY_TASKS, tasks);
      storageService.setItem(STORAGE_KEY_PREVENTIVE_INIT, 'true');
    } catch {}
  }, [tasks]);

  // Synchronize with external events (Excel import, vault restore, service updates)
  useEffect(() => {
    const handleTasksUpdated = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTasks(e.detail);
      } else {
        const current = PreventiveService.getTasks();
        if (Array.isArray(current)) setTasks(current);
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
      PreventiveService.saveTasks(next);
      return next;
    });
  }, []);

  const handleDeleteTask = useCallback((id) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      PreventiveService.saveTasks(next);
      return next;
    });
  }, []);

  const handleUpdateTaskCounter = useCallback((id, newCounterValue) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, dernier_releve: Number(newCounterValue || 0), updated_at: new Date().toISOString() } : t));
      PreventiveService.saveTasks(next);
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

  // Clear / Reset to baseline explicitly (User-initiated only, no automatic overwrite!)
  const handleResetPreventiveToBaseline = useCallback(async (ctx = {}) => {
    const { machines = [], skipConfirm = false } = ctx;
    const impact = dataIntegrityService.previewClearImpact({
      action: 'RESET_PREVENTIVE_BASELINE',
      machines,
      preventiveTasks: tasks,
      correctiveInterventions: [],
    });

    const msg =
      `Réinitialiser le préventif au baseline seed ?\n` +
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
    PreventiveService.saveTasks(initialTasks);
    PreventiveService.saveActions(initialActions);
    PreventiveService.saveGuides(initialGuides);
    PreventiveService.savePlans([]);
    storageService.setItem(STORAGE_KEY_TASKS, initialTasks);
    storageService.setItem(STORAGE_KEY_PREVENTIVE_INIT, 'true');

    // After baseline: report orphans vs CURRENT machines
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
    PreventiveService.saveTasks([]);
    PreventiveService.savePlans([]);
    storageService.setItem(STORAGE_KEY_TASKS, []);
    storageService.setItem(STORAGE_KEY_PREVENTIVE_INIT, 'true');
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

