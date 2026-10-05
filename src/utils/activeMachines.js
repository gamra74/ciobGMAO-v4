/**
 * Machines eligible for NEW links (create forms, bulk relink targets).
 * Archived / inactive machines must never appear in selectors.
 */
export function filterActiveMachines(machines = []) {
  return (machines || []).filter((m) => {
    if (!m) return false;
    if (m.status === 'ARCHIVEE' || m.statut === 'Archivée') return false;
    if (m.is_active === false || m.actif === false) return false;
    return Boolean(m.id_machine_registered || m.id || m.code || m.id_machine);
  });
}

export function getActiveMachineCodes(machines = []) {
  return filterActiveMachines(machines).map((m) =>
    String(m.id_machine_registered || m.id || m.code || m.id_machine).trim()
  );
}
