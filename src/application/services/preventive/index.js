// PreventiveService - INDEX
import initialTasks from '../../../data/preventive/seedPreventiveTasks.json';

export const INITIAL_TASKS = Array.isArray(initialTasks) ? initialTasks : [];
export const INITIAL_PLANS = [];

// Re-export standard references
export { INITIAL_ACTIONS } from './INITIAL_ACTIONS.js';
export { INITIAL_GUIDES } from './INITIAL_GUIDES.js';

// Modular Preventive Domain Services
export { ActionService } from './ActionService.js';
export { GuideService } from './GuideService.js';
export { PlanService } from './PlanService.js';
export { TaskService } from './TaskService.js';

