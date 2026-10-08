import { STORAGE_KEYS } from '../infrastructure/persistence/storageKeys.js';
import { storageService } from '../utils/storageService.js';
import { dataIntegrityService } from '../services/dataIntegrityService.js';
import { sanitizeObject } from '../utils/sanitize.js';
import { ValidationService } from '../core/validation/ValidationService.ts';

import seedMachines from '../data/machines/seedMachines.json';
import seedFamilies from '../data/machines/seedFamilies.json';
import seedTemplates from '../data/machines/seedTemplates.json';
import seedBlueprints from '../data/machines/seedBlueprints.json';
import seedZones from '../data/machines/seedZones.json';
import seedMachineBomLedger from '../data/machines/seedMachineBomLedger.json';

import seedStockItems from '../data/stock/seedStockItems.json';
import seedStockTypes from '../data/stock/seedStockTypes.json';
import seedMouvements from '../data/movements/seedMouvements.json';
import seedSortiesExternes from '../data/movements/seedSortiesExternes.json';

import seedPreventiveTasks from '../data/preventive/seedPreventiveTasks.json';
import seedPreventiveActions from '../data/preventive/seedPreventiveActions.json';
import seedPreventiveGuides from '../data/preventive/seedPreventiveGuides.json';

import seedCorrectiveInterventions from '../data/corrective/seedCorrectiveInterventions.json';
import seedActionsByPanne from '../data/corrective/seedActionsByPanne.json';
import seedPanneByCategory from '../data/corrective/seedPanneByCategory.json';
import seedTravailAFaire from '../data/corrective/seedTravailAFaire.json';
import seedIntervenants from '../data/corrective/seedIntervenants.json';

import seedUsers from '../data/users/seedUsers.json';
import seedTechnicians from '../data/users/seedTechnicians.json';
import seedOperations from '../data/users/seedOperations.json';

import seedWarehouseItems from '../data/warehouse/seedWarehouseItems.json';
import seedEntrepotComponents from '../data/warehouse/seedEntrepotComponents.json';
import seedCompGroups from '../data/warehouse/seedCompGroups.json';
import seedCompFamilies from '../data/warehouse/seedCompFamilies.json';
import seedCompTemplates from '../data/warehouse/seedCompTemplates.json';
import seedPartTypes from '../data/warehouse/seedPartTypes.json';
import seedPartDesignations from '../data/warehouse/seedPartDesignations.json';

/**
 * Thin Write Gateway (Single Write Path for all Canonical Entities).
 * Ensures every write targets the canonical STORAGE_KEYS only and supports optional referential checks.
 */
export const DataGateway = {
  /**
   * Sanitizes any incoming entity payload against XSS injection while preserving non-string types.
   */
  sanitizePayload(payload) {
    return sanitizeObject(payload);
  },

  /**
   * Validates an entity using ValidationService when strict validation is requested.
   */
  validateEntity(entityType, item) {
    switch (entityType) {
      case 'stock':
        return ValidationService.validateStockItem(item);
      case 'machine':
        return ValidationService.validateMachine(item);
      case 'movement':
        return ValidationService.validateMovement(item);
      case 'zone':
        return ValidationService.validateZone(item);
      case 'user':
        return ValidationService.validateUser(item);
      default:
        return { valid: true, data: item, errors: [] };
    }
  },

  // ==========================================
  // 1. MACHINES & TOPOLOGY
  // ==========================================
  saveMachines(list = [], { validate = false } = {}) {
    let clean = Array.isArray(list) ? list : [];
    if (validate) {
      clean = clean.filter((m) => ValidationService.validateMachine(m).valid);
    }
    storageService.setItem(STORAGE_KEYS.MACHINES, clean);
    return clean;
  },

  saveFamilies(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.FAMILIES, clean);
    return clean;
  },

  saveTemplates(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.TEMPLATES, clean);
    return clean;
  },

  saveBlueprints(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.BLUEPRINTS, clean);
    return clean;
  },

  saveZones(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.ZONES, clean);
    return clean;
  },

  saveMachineBom(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.MACHINE_BOM, clean);
    return clean;
  },

  // ==========================================
  // 2. STOCK & MOVEMENTS
  // ==========================================
  saveStock(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.RAW_STOCK, clean);
    return clean;
  },

  saveStockTypes(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.STOCK_TYPES, clean);
    return clean;
  },

  saveDesignations(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.DESIGNATIONS, clean);
    return clean;
  },

  saveMouvements(list = [], { stock = null, strict = false } = {}) {
    let clean = Array.isArray(list) ? list : [];
    if (strict && Array.isArray(stock) && stock.length > 0) {
      const validRefs = new Set(
        stock.map((s) => String(s.ref || '').trim().toUpperCase()).filter(Boolean)
      );
      clean = clean.filter((m) => {
        const ref = String(m.ref || '').trim().toUpperCase();
        return !ref || validRefs.has(ref);
      });
    }
    storageService.setItem(STORAGE_KEYS.MOUVEMENTS, clean);
    return clean;
  },

  saveMovements(list = [], options = {}) {
    return this.saveMouvements(list, options);
  },

  // ==========================================
  // 3. PREVENTIVE MAINTENANCE
  // ==========================================
  savePreventiveTasks(list = [], { machines = null, strict = false } = {}) {
    let clean = Array.isArray(list) ? list : [];
    let orphanCount = 0;

    if (Array.isArray(machines) && machines.length > 0) {
      const activeIds = dataIntegrityService.buildActiveMachineIdSet(machines);
      if (strict) {
        const kept = [];
        clean.forEach((t) => {
          const ref = t.id_machine || t.machine_id || t.code_machine;
          if (dataIntegrityService.isOrphanMachineRef(ref, activeIds)) {
            orphanCount++;
          } else {
            kept.push({ ...t, _isOrphan: false });
          }
        });
        clean = kept;
      } else {
        clean = clean.map((t) => {
          const ref = t.id_machine || t.machine_id || t.code_machine;
          const isOrphan = dataIntegrityService.isOrphanMachineRef(ref, activeIds);
          if (isOrphan) orphanCount++;
          return { ...t, _isOrphan: isOrphan };
        });
      }
    }

    storageService.setItem(STORAGE_KEYS.PREVENTIVE_TASKS, clean);
    return { saved: clean, orphanCount };
  },

  savePreventiveActions(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.PREVENTIVE_ACTIONS, clean);
    return clean;
  },

  savePreventiveGuides(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.PREVENTIVE_GUIDES, clean);
    return clean;
  },

  savePreventivePlans(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.PREVENTIVE_PLANS, clean);
    return clean;
  },

  // ==========================================
  // 4. CORRECTIVE MAINTENANCE
  // ==========================================
  saveCorrectiveInterventions(list = [], { machines = null, strict = false } = {}) {
    let clean = Array.isArray(list) ? list : [];
    let orphanCount = 0;

    if (Array.isArray(machines) && machines.length > 0) {
      const activeIds = dataIntegrityService.buildActiveMachineIdSet(machines);
      if (strict) {
        const kept = [];
        clean.forEach((i) => {
          const ref = i.code_machine || i.id_machine || i.machine_id || i.id_machine_registered;
          if (dataIntegrityService.isOrphanMachineRef(ref, activeIds)) {
            orphanCount++;
          } else {
            kept.push({ ...i, _isOrphan: false });
          }
        });
        clean = kept;
      } else {
        clean = clean.map((i) => {
          const ref = i.code_machine || i.id_machine || i.machine_id || i.id_machine_registered;
          const isOrphan = dataIntegrityService.isOrphanMachineRef(ref, activeIds);
          if (isOrphan) orphanCount++;
          return { ...i, _isOrphan: isOrphan };
        });
      }
    }

    storageService.setItem(STORAGE_KEYS.CORRECTIVE_INTERVENTIONS, clean);
    return { saved: clean, orphanCount };
  },

  saveCorrectiveActionsByPanne(dict = {}) {
    const clean = dict && typeof dict === 'object' ? dict : {};
    storageService.setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS_BY_PANNE, clean);
    return clean;
  },

  saveCorrectivePanneCategories(dict = {}) {
    const clean = dict && typeof dict === 'object' ? dict : {};
    storageService.setItem(STORAGE_KEYS.CORRECTIVE_PANNE_CATEGORIES, clean);
    return clean;
  },

  saveCorrectiveTravaux(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.CORRECTIVE_TRAVAUX, clean);
    return clean;
  },

  saveCorrectiveIntervenants(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.CORRECTIVE_INTERVENANTS, clean);
    return clean;
  },

  // ==========================================
  // 5. PERSONNEL & USERS
  // ==========================================
  savePersonnel(users = [], technicians = null, operations = null) {
    const cleanUsers = Array.isArray(users) ? users : [];
    storageService.setItem(STORAGE_KEYS.PERSONNEL, cleanUsers);
    if (Array.isArray(technicians)) {
      storageService.setItem(STORAGE_KEYS.TECHNICIANS, technicians);
    }
    if (Array.isArray(operations)) {
      storageService.setItem(STORAGE_KEYS.OPERATIONS, operations);
    }
    return cleanUsers;
  },

  saveUsers(users = []) {
    return this.savePersonnel(users);
  },

  saveTechnicians(technicians = []) {
    const clean = Array.isArray(technicians) ? technicians : [];
    storageService.setItem(STORAGE_KEYS.TECHNICIANS, clean);
    return clean;
  },

  saveOperations(operations = []) {
    const clean = Array.isArray(operations) ? operations : [];
    storageService.setItem(STORAGE_KEYS.OPERATIONS, clean);
    return clean;
  },

  // ==========================================
  // 6. WAREHOUSE / ENTREPÔT
  // ==========================================
  saveWarehouseItems(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.WAREHOUSE_ITEMS, clean);
    return clean;
  },

  saveEntrepotComponents(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.ENTREPOT_COMPONENTS, clean);
    return clean;
  },

  saveCompGroups(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.COMP_GROUPS, clean);
    return clean;
  },

  saveCompFamilies(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.COMP_FAMILIES, clean);
    return clean;
  },

  saveCompTemplates(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.COMP_TEMPLATES, clean);
    return clean;
  },

  savePartTypes(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.PART_TYPES, clean);
    return clean;
  },

  savePartDesignations(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.PART_DESIGNATIONS, clean);
    return clean;
  },

  // ==========================================
  // 7. SORTIE EXTERNE & BOBINAGE
  // ==========================================
  saveSortiesExterne(list = []) {
    const clean = Array.isArray(list) ? list : [];
    storageService.setItem(STORAGE_KEYS.SORTIE_EXTERNE, clean);
    return clean;
  },

  // ==========================================
  // 8. EXPLICIT DEMO DATA LOADER & FACTORY CLEAR
  // ==========================================
  /**
   * Explicitly loads all documented factory demo seeds into canonical STORAGE_KEYS.
   * Sets DEMO_MODE = true.
   */
  loadDemoData(setters = {}) {
    const derivedDesignations = seedStockItems.map((s) => ({
      id: s.id,
      ref: s.ref,
      designation: s.designation,
      id_type: s.id_type,
      type: s.type,
      stockInitial: s.stockInitial,
      seuil: s.seuil,
      emplacement: s.emplacement,
    }));

    const formattedCompTemplates = seedCompTemplates.map((t, idx) => ({
      ...t,
      id_templates: t.id_templates || t.id_template || t.id_comp_template || `TPL-${idx + 1}`,
    }));

    // 1. Set DEMO_MODE flag
    storageService.setItem(STORAGE_KEYS.DEMO_MODE, true);
    storageService.setItem('gmao_start_mode', 'demo');

    // 2. Write all seeds to canonical STORAGE_KEYS only
    this.saveMachines(seedMachines);
    this.saveFamilies(seedFamilies);
    this.saveTemplates(seedTemplates);
    this.saveBlueprints(seedBlueprints);
    this.saveZones(seedZones);
    this.saveMachineBom(seedMachineBomLedger);

    this.saveStock(seedStockItems);
    this.saveStockTypes(seedStockTypes);
    this.saveDesignations(derivedDesignations);
    this.saveMouvements(seedMouvements);

    this.savePreventiveTasks(seedPreventiveTasks, { machines: seedMachines });
    this.savePreventiveActions(seedPreventiveActions);
    this.savePreventiveGuides(seedPreventiveGuides);
    this.savePreventivePlans([]);

    this.saveCorrectiveInterventions(seedCorrectiveInterventions, { machines: seedMachines });
    this.saveCorrectiveActionsByPanne(seedActionsByPanne);
    this.saveCorrectivePanneCategories(seedPanneByCategory);
    this.saveCorrectiveTravaux(seedTravailAFaire);
    this.saveCorrectiveIntervenants(seedIntervenants);

    this.savePersonnel(seedUsers, seedTechnicians, seedOperations);

    this.saveWarehouseItems(seedWarehouseItems);
    this.saveEntrepotComponents(seedEntrepotComponents);
    this.saveCompGroups(seedCompGroups);
    this.saveCompFamilies(seedCompFamilies);
    this.saveCompTemplates(formattedCompTemplates);
    this.savePartTypes(seedPartTypes);
    this.savePartDesignations(seedPartDesignations);

    this.saveSortiesExterne(seedSortiesExternes);

    // 3. Update React state setters if provided
    if (setters.setMachines) setters.setMachines(seedMachines);
    if (setters.setFamilies) setters.setFamilies(seedFamilies);
    if (setters.setTemplates) setters.setTemplates(seedTemplates);
    if (setters.setBlueprints) setters.setBlueprints(seedBlueprints);
    if (setters.setZones) setters.setZones(seedZones);
    if (setters.setMachineElementsLedger) setters.setMachineElementsLedger(seedMachineBomLedger);

    if (setters.setRawStock) setters.setRawStock(seedStockItems);
    if (setters.setTypes) setters.setTypes(seedStockTypes);
    if (setters.setDesignations) setters.setDesignations(derivedDesignations);
    if (setters.setMouvements) setters.setMouvements(seedMouvements);

    if (setters.setPreventiveTasks) setters.setPreventiveTasks(seedPreventiveTasks);
    if (setters.setPreventiveActions) setters.setPreventiveActions(seedPreventiveActions);
    if (setters.setPreventiveGuides) setters.setPreventiveGuides(seedPreventiveGuides);
    if (setters.setPreventivePlans) setters.setPreventivePlans([]);

    if (setters.setCorrectiveInterventions) setters.setCorrectiveInterventions(seedCorrectiveInterventions);
    if (setters.setCorrectiveActionsByPanne) setters.setCorrectiveActionsByPanne(seedActionsByPanne);
    if (setters.setCorrectivePanneCategories) setters.setCorrectivePanneCategories(seedPanneByCategory);
    if (setters.setCorrectiveTravauxAFaire) setters.setCorrectiveTravauxAFaire(seedTravailAFaire);
    if (setters.setCorrectiveIntervenants) setters.setCorrectiveIntervenants(seedIntervenants);

    if (setters.setUsers) setters.setUsers(seedUsers);
    if (setters.setTechnicians) setters.setTechnicians(seedTechnicians);
    if (setters.setOperations) setters.setOperations(seedOperations);

    if (setters.setWarehouseItems) setters.setWarehouseItems(seedWarehouseItems);
    if (setters.setEntrepotComponents) setters.setEntrepotComponents(seedEntrepotComponents);
    if (setters.setCompGroups) setters.setCompGroups(seedCompGroups);
    if (setters.setCompFamilies) setters.setCompFamilies(seedCompFamilies);
    if (setters.setCompTemplates) setters.setCompTemplates(formattedCompTemplates);
    if (setters.setPartTypes) setters.setPartTypes(seedPartTypes);
    if (setters.setPartDesignations) setters.setPartDesignations(seedPartDesignations);

    if (setters.setSortiesExterne) setters.setSortiesExterne(seedSortiesExternes);

    return {
      machinesCount: seedMachines.length,
      stockCount: seedStockItems.length,
      preventiveCount: seedPreventiveTasks.length,
      correctiveCount: seedCorrectiveInterventions.length,
      movementsCount: seedMouvements.length,
    };
  },

  /**
   * Injects or resets a specific domain section with its canonical seed data (Demo Mode per section).
   */
  loadDemoSection(sectionId, setters = {}) {
    storageService.setItem(STORAGE_KEYS.DEMO_MODE, true);
    storageService.setItem(STORAGE_KEYS.START_MODE, 'demo');

    const derivedDesignations = seedStockItems.map((s) => ({
      id: s.id,
      ref: s.ref,
      designation: s.designation,
      id_type: s.id_type,
      type: s.type,
      stockInitial: s.stockInitial,
      seuil: s.seuil,
      emplacement: s.emplacement,
    }));

    const formattedCompTemplates = seedCompTemplates.map((t, idx) => ({
      ...t,
      id_templates: t.id_templates || t.id_template || t.id_comp_template || `TPL-${idx + 1}`,
    }));

    switch (sectionId) {
      case 'stock':
        this.saveStock(seedStockItems);
        this.saveStockTypes(seedStockTypes);
        this.saveDesignations(derivedDesignations);
        if (setters.setRawStock) setters.setRawStock(seedStockItems);
        if (setters.setTypes) setters.setTypes(seedStockTypes);
        if (setters.setDesignations) setters.setDesignations(derivedDesignations);
        return { label: 'Stock & Articles PDR', count: seedStockItems.length };

      case 'parc':
      case 'machines':
        this.saveMachines(seedMachines);
        this.saveFamilies(seedFamilies);
        this.saveTemplates(seedTemplates);
        this.saveBlueprints(seedBlueprints);
        this.saveMachineBom(seedMachineBomLedger);
        if (setters.setMachines) setters.setMachines(seedMachines);
        if (setters.setFamilies) setters.setFamilies(seedFamilies);
        if (setters.setTemplates) setters.setTemplates(seedTemplates);
        if (setters.setBlueprints) setters.setBlueprints(seedBlueprints);
        if (setters.setMachineElementsLedger) setters.setMachineElementsLedger(seedMachineBomLedger);
        return { label: 'Parc Machines, Familles, Modèles & BOM', count: seedMachines.length };

      case 'entrepot':
      case 'warehouse':
        this.saveWarehouseItems(seedWarehouseItems);
        this.saveEntrepotComponents(seedEntrepotComponents);
        this.saveCompGroups(seedCompGroups);
        this.saveCompFamilies(seedCompFamilies);
        this.saveCompTemplates(formattedCompTemplates);
        this.savePartTypes(seedPartTypes);
        this.savePartDesignations(seedPartDesignations);
        if (setters.setWarehouseItems) setters.setWarehouseItems(seedWarehouseItems);
        if (setters.setEntrepotComponents) setters.setEntrepotComponents(seedEntrepotComponents);
        if (setters.setCompGroups) setters.setCompGroups(seedCompGroups);
        if (setters.setCompFamilies) setters.setCompFamilies(seedCompFamilies);
        if (setters.setCompTemplates) setters.setCompTemplates(formattedCompTemplates);
        if (setters.setPartTypes) setters.setPartTypes(seedPartTypes);
        if (setters.setPartDesignations) setters.setPartDesignations(seedPartDesignations);
        return { label: 'Entrepôt, Organes & Pièces Réserve', count: seedWarehouseItems.length };

      case 'zones':
      case 'personnel':
        this.saveZones(seedZones);
        this.savePersonnel(seedUsers, seedTechnicians, seedOperations);
        if (setters.setZones) setters.setZones(seedZones);
        if (setters.setUsers) setters.setUsers(seedUsers);
        if (setters.setTechnicians) setters.setTechnicians(seedTechnicians);
        if (setters.setOperations) setters.setOperations(seedOperations);
        return { label: 'Zones & Équipes (Techniciens / Opérations)', count: seedZones.length + seedTechnicians.length };

      case 'mouvements':
      case 'movements':
        this.saveMouvements(seedMouvements);
        this.saveSortiesExterne(seedSortiesExternes);
        if (setters.setMouvements) setters.setMouvements(seedMouvements);
        if (setters.setSortiesExterne) setters.setSortiesExterne(seedSortiesExternes);
        return { label: 'Mouvements & Sorties Externes', count: seedMouvements.length + seedSortiesExternes.length };

      case 'preventive':
        this.savePreventiveTasks(seedPreventiveTasks, { machines: seedMachines });
        this.savePreventiveActions(seedPreventiveActions);
        this.savePreventiveGuides(seedPreventiveGuides);
        this.savePreventivePlans([]);
        if (setters.setPreventiveTasks) setters.setPreventiveTasks(seedPreventiveTasks);
        if (setters.setPreventiveActions) setters.setPreventiveActions(seedPreventiveActions);
        if (setters.setPreventiveGuides) setters.setPreventiveGuides(seedPreventiveGuides);
        if (setters.setPreventivePlans) setters.setPreventivePlans([]);
        return { label: 'Maintenance Préventive (Tâches, Guides & Actions)', count: seedPreventiveTasks.length };

      case 'corrective':
        this.saveCorrectiveInterventions(seedCorrectiveInterventions, { machines: seedMachines });
        this.saveCorrectiveActionsByPanne(seedActionsByPanne);
        this.saveCorrectivePanneCategories(seedPanneByCategory);
        this.saveCorrectiveTravaux(seedTravailAFaire);
        this.saveCorrectiveIntervenants(seedIntervenants);
        if (setters.setCorrectiveInterventions) setters.setCorrectiveInterventions(seedCorrectiveInterventions);
        if (setters.setCorrectiveActionsByPanne) setters.setCorrectiveActionsByPanne(seedActionsByPanne);
        if (setters.setCorrectivePanneCategories) setters.setCorrectivePanneCategories(seedPanneByCategory);
        if (setters.setCorrectiveTravauxAFaire) setters.setCorrectiveTravauxAFaire(seedTravailAFaire);
        if (setters.setCorrectiveIntervenants) setters.setCorrectiveIntervenants(seedIntervenants);
        return { label: 'Maintenance Corrective (Interventions & Catalogues)', count: seedCorrectiveInterventions.length };

      case 'all':
      default:
        this.loadDemoData(setters);
        return { label: 'Toutes les Sections Usine (Full Demo SSOT)', count: seedStockItems.length + seedMachines.length + seedMouvements.length };
    }
  },

  /**
   * Clears a specific domain section (sets its canonical keys and store slices to empty).
   */
  clearDemoSection(sectionId, setters = {}) {
    switch (sectionId) {
      case 'stock':
        this.saveStock([]);
        this.saveStockTypes([]);
        this.saveDesignations([]);
        if (setters.setRawStock) setters.setRawStock([]);
        if (setters.setTypes) setters.setTypes([]);
        if (setters.setDesignations) setters.setDesignations([]);
        return { label: 'Stock & Articles PDR' };

      case 'parc':
      case 'machines':
        this.saveMachines([]);
        this.saveFamilies([]);
        this.saveTemplates([]);
        this.saveBlueprints([]);
        this.saveMachineBom([]);
        if (setters.setMachines) setters.setMachines([]);
        if (setters.setFamilies) setters.setFamilies([]);
        if (setters.setTemplates) setters.setTemplates([]);
        if (setters.setBlueprints) setters.setBlueprints([]);
        if (setters.setMachineElementsLedger) setters.setMachineElementsLedger([]);
        return { label: 'Parc Machines, Familles, Modèles & BOM' };

      case 'entrepot':
      case 'warehouse':
        this.saveWarehouseItems([]);
        this.saveEntrepotComponents([]);
        this.saveCompGroups([]);
        this.saveCompFamilies([]);
        this.saveCompTemplates([]);
        this.savePartTypes([]);
        this.savePartDesignations([]);
        if (setters.setWarehouseItems) setters.setWarehouseItems([]);
        if (setters.setEntrepotComponents) setters.setEntrepotComponents([]);
        if (setters.setCompGroups) setters.setCompGroups([]);
        if (setters.setCompFamilies) setters.setCompFamilies([]);
        if (setters.setCompTemplates) setters.setCompTemplates([]);
        if (setters.setPartTypes) setters.setPartTypes([]);
        if (setters.setPartDesignations) setters.setPartDesignations([]);
        return { label: 'Entrepôt, Organes & Pièces Réserve' };

      case 'zones':
      case 'personnel':
        this.saveZones([]);
        this.savePersonnel([], [], []);
        if (setters.setZones) setters.setZones([]);
        if (setters.setUsers) setters.setUsers([]);
        if (setters.setTechnicians) setters.setTechnicians([]);
        if (setters.setOperations) setters.setOperations([]);
        return { label: 'Zones & Équipes' };

      case 'mouvements':
      case 'movements':
        this.saveMouvements([]);
        this.saveSortiesExterne([]);
        if (setters.setMouvements) setters.setMouvements([]);
        if (setters.setSortiesExterne) setters.setSortiesExterne([]);
        return { label: 'Mouvements & Sorties Externes' };

      case 'preventive':
        this.savePreventiveTasks([]);
        this.savePreventiveActions([]);
        this.savePreventiveGuides([]);
        this.savePreventivePlans([]);
        if (setters.setPreventiveTasks) setters.setPreventiveTasks([]);
        if (setters.setPreventiveActions) setters.setPreventiveActions([]);
        if (setters.setPreventiveGuides) setters.setPreventiveGuides([]);
        if (setters.setPreventivePlans) setters.setPreventivePlans([]);
        return { label: 'Maintenance Préventive' };

      case 'corrective':
        this.saveCorrectiveInterventions([]);
        this.saveCorrectiveActionsByPanne({});
        this.saveCorrectivePanneCategories({});
        this.saveCorrectiveTravaux([]);
        this.saveCorrectiveIntervenants([]);
        if (setters.setCorrectiveInterventions) setters.setCorrectiveInterventions([]);
        if (setters.setCorrectiveActionsByPanne) setters.setCorrectiveActionsByPanne({});
        if (setters.setCorrectivePanneCategories) setters.setCorrectivePanneCategories({});
        if (setters.setCorrectiveTravauxAFaire) setters.setCorrectiveTravauxAFaire([]);
        if (setters.setCorrectiveIntervenants) setters.setCorrectiveIntervenants([]);
        return { label: 'Maintenance Corrective' };

      case 'all':
      default:
        this.clearAllForRealFactory(setters);
        return { label: 'Toutes les Sections Usine' };
    }
  },

  /**
   * Explicitly clears all operational data for a clean real-factory deployment.
   * Sets DEMO_MODE = false and writes [] to all canonical keys.
   */
  clearAllForRealFactory(setters = {}) {
    storageService.setItem(STORAGE_KEYS.DEMO_MODE, false);
    storageService.setItem('gmao_start_mode', 'empty');
    storageService.removeItem(STORAGE_KEYS.FULL_STATE_SNAPSHOT);

    this.saveMachines([]);
    this.saveFamilies([]);
    this.saveTemplates([]);
    this.saveBlueprints([]);
    this.saveZones([]);
    this.saveMachineBom([]);

    this.saveStock([]);
    this.saveStockTypes([]);
    this.saveDesignations([]);
    this.saveMouvements([]);

    this.savePreventiveTasks([]);
    this.savePreventiveActions([]);
    this.savePreventiveGuides([]);
    this.savePreventivePlans([]);

    this.saveCorrectiveInterventions([]);
    this.saveCorrectiveActionsByPanne({});
    this.saveCorrectivePanneCategories({});
    this.saveCorrectiveTravaux([]);
    this.saveCorrectiveIntervenants([]);

    this.savePersonnel([], [], []);

    this.saveWarehouseItems([]);
    this.saveEntrepotComponents([]);
    this.saveCompGroups([]);
    this.saveCompFamilies([]);
    this.saveCompTemplates([]);
    this.savePartTypes([]);
    this.savePartDesignations([]);

    this.saveSortiesExterne([]);

    if (setters.setMachines) setters.setMachines([]);
    if (setters.setFamilies) setters.setFamilies([]);
    if (setters.setTemplates) setters.setTemplates([]);
    if (setters.setBlueprints) setters.setBlueprints([]);
    if (setters.setZones) setters.setZones([]);
    if (setters.setMachineElementsLedger) setters.setMachineElementsLedger([]);

    if (setters.setRawStock) setters.setRawStock([]);
    if (setters.setTypes) setters.setTypes([]);
    if (setters.setDesignations) setters.setDesignations([]);
    if (setters.setMouvements) setters.setMouvements([]);

    if (setters.setPreventiveTasks) setters.setPreventiveTasks([]);
    if (setters.setPreventiveActions) setters.setPreventiveActions([]);
    if (setters.setPreventiveGuides) setters.setPreventiveGuides([]);
    if (setters.setPreventivePlans) setters.setPreventivePlans([]);

    if (setters.setCorrectiveInterventions) setters.setCorrectiveInterventions([]);
    if (setters.setCorrectiveActionsByPanne) setters.setCorrectiveActionsByPanne({});
    if (setters.setCorrectivePanneCategories) setters.setCorrectivePanneCategories({});
    if (setters.setCorrectiveTravauxAFaire) setters.setCorrectiveTravauxAFaire([]);
    if (setters.setCorrectiveIntervenants) setters.setCorrectiveIntervenants([]);

    if (setters.setUsers) setters.setUsers([]);
    if (setters.setTechnicians) setters.setTechnicians([]);
    if (setters.setOperations) setters.setOperations([]);

    if (setters.setWarehouseItems) setters.setWarehouseItems([]);
    if (setters.setEntrepotComponents) setters.setEntrepotComponents([]);
    if (setters.setCompGroups) setters.setCompGroups([]);
    if (setters.setCompFamilies) setters.setCompFamilies([]);
    if (setters.setCompTemplates) setters.setCompTemplates([]);
    if (setters.setPartTypes) setters.setPartTypes([]);
    if (setters.setPartDesignations) setters.setPartDesignations([]);

    if (setters.setSortiesExterne) setters.setSortiesExterne([]);
  },
};

export default DataGateway;
