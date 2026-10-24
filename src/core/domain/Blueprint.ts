export class Blueprint {
  constructor(data) {
    this.id = data.id_blueprint || data.id;
    this.specs = data.specs || {}; 
    this.components_theoriques = data.components_theoriques || []; 
    this.parts_theoriques = data.parts_theoriques || []; 
    this.pdr_theoriques = data.pdr_theoriques || []; 
  }

  isSameSpecs(other) {
    const clean = (s) => Object.fromEntries(Object.entries(s || {}).filter(([_, v]) => v != null && String(v).trim() !== ''));
    return JSON.stringify(clean(this.specs)) === JSON.stringify(clean(other.specs));
  }

  isTwin(other) {
    const key = (arr, field) => JSON.stringify([...(arr || [])].map(x => ({id: String(x[field] || '').trim(), q: Number(x.qte || 1)})).sort((a, b) => a.id.localeCompare(b.id)));
    return this.isSameSpecs(other) &&
           key(this.components_theoriques, 'id_component') === key(other.components_theoriques || other.components_reels, 'id_component') &&
           key(this.parts_theoriques, 'id_part') === key(other.parts_theoriques || other.parts_reels, 'id_part') &&
           key(this.pdr_theoriques, 'id_pdr') === key(other.pdr_theoriques || other.pdr_historique, 'id_pdr');
  }

  extractFromNexus(machine, mouvements) {
    const related = mouvements.filter(m => m.id_machine_registered === machine.id_machine_registered);
    this.components_theoriques = machine.components_reels || [];
    this.pdr_theoriques = related.map(m => ({ id_pdr: m.ref || m.id_article, qte: 1, criticite: 'Moyenne' }));
  }

  getMachinesLiees(machines) {
    return machines.filter(m => m.id_blueprint === this.id);
  }

  getBOMSummary() {
    return `Comp:${this.components_theoriques.length} Parts:${this.parts_theoriques.length} PDR:${this.pdr_theoriques.length}`;
  }
}

export function buildLedgerEntriesFromBlueprint(machine, blueprint, existingLedger = []) {
  if (!machine || !blueprint) return [];
  const machineId = machine.id_machine_registered;
  const existingForMachine = existingLedger.filter(e => e.id_machine_registered === machineId);
  const existingRefs = new Set(existingForMachine.map(e => String(e.ref_element || '').trim()));

  const newEntries = [];

  // 1. pdr_theoriques -> PDR
  const pdrList = blueprint.pdr_theoriques || [];
  for (const pdr of pdrList) {
    const ref = String(pdr.id_pdr || pdr.ref || pdr.id || '').trim();
    if (!ref) continue;
    if (!existingRefs.has(ref)) {
      existingRefs.add(ref);
      newEntries.push({
        id_machine_registered: machineId,
        element_type: 'PDR',
        ref_element: ref,
        designation: pdr.libelle || pdr.designation || ref,
        qte_montee: Number(pdr.qte || pdr.quantite || 1),
        unite: pdr.unite || 'U',
        criticalite: pdr.criticite || 'CRITIQUE',
        duree_vie_estimee_heures: Number(pdr.duree_vie_estimee_heures || 5000),
        heures_actuelles: 0,
        date_installation: new Date().toISOString().split('T')[0],
        emplacement_machine: pdr.emplacement || pdr.emplacement_machine || '',
        technicien: machine.technician || 'tech',
        statut: 'OPERATIONNEL',
        remarques: pdr.remarques || 'Généré depuis Blueprint',
      });
    }
  }

  // 2. components_theoriques -> COMPONENT (without stock deduction)
  const compList = blueprint.components_theoriques || [];
  for (const comp of compList) {
    const ref = String(comp.id_component || comp.ref || comp.id || '').trim();
    if (!ref) continue;
    if (!existingRefs.has(ref)) {
      existingRefs.add(ref);
      newEntries.push({
        id_machine_registered: machineId,
        element_type: 'COMPONENT',
        ref_element: ref,
        designation: comp.libelle || comp.designation || ref,
        qte_montee: Number(comp.qte || comp.quantite || 1),
        unite: comp.unite || 'U',
        criticalite: comp.criticite || 'MAJEURE',
        duree_vie_estimee_heures: Number(comp.duree_vie_estimee_heures || 8000),
        heures_actuelles: 0,
        date_installation: new Date().toISOString().split('T')[0],
        emplacement_machine: comp.emplacement || comp.emplacement_machine || '',
        technicien: machine.technician || 'tech',
        statut: 'OPERATIONNEL',
        remarques: comp.remarques || 'Généré depuis Blueprint (Composant)',
        _source: 'ENTREPOT',
      });
    }
  }

  // 3. parts_theoriques -> PART
  const partsList = blueprint.parts_theoriques || [];
  for (const part of partsList) {
    const ref = String(part.id_part || part.ref || part.id || '').trim();
    if (!ref) continue;
    if (!existingRefs.has(ref)) {
      existingRefs.add(ref);
      newEntries.push({
        id_machine_registered: machineId,
        element_type: 'PART',
        ref_element: ref,
        designation: part.libelle || part.designation || ref,
        qte_montee: Number(part.qte || part.quantite || 1),
        unite: part.unite || 'U',
        criticalite: part.criticite || 'MINEURE',
        duree_vie_estimee_heures: Number(part.duree_vie_estimee_heures || 10000),
        heures_actuelles: 0,
        date_installation: new Date().toISOString().split('T')[0],
        emplacement_machine: part.emplacement || part.emplacement_machine || '',
        technicien: machine.technician || 'tech',
        statut: 'OPERATIONNEL',
        remarques: part.remarques || 'Généré depuis Blueprint (Organe)',
      });
    }
  }

  return newEntries;
}