import { describe, it, expect } from 'vitest';
import { buildLedgerEntriesFromBlueprint } from '../../core/domain/Blueprint';

describe('buildLedgerEntriesFromBlueprint (Nexus N3)', () => {
  it('should map pdr_theoriques, components_theoriques, and parts_theoriques correctly without duplicates', () => {
    const machine = {
      id_machine_registered: 'DET-01',
      technician: 'Tech A',
    };

    const blueprint = {
      id_blueprint: 'BP-01',
      pdr_theoriques: [
        { id_pdr: 'PDR-001', libelle: 'Roulement 6204', qte: 2, criticite: 'CRITIQUE' },
        { id_pdr: 'PDR-002', libelle: 'Courroie V', qte: 1 },
      ],
      components_theoriques: [
        { id_component: 'COMP-01', libelle: 'Distributeur Pneu' },
      ],
      parts_theoriques: [
        { id_part: 'PART-01', libelle: 'Arbre Principal' },
      ],
    };

    // Existing ledger already contains PDR-001 for DET-01 (should not duplicate)
    const existingLedger = [
      { id_machine_registered: 'DET-01', ref_element: 'PDR-001' },
    ];

    const entries = buildLedgerEntriesFromBlueprint(machine, blueprint, existingLedger);

    // PDR-001 is already present, so only PDR-002, COMP-01, PART-01 should be added (total 3 entries)
    expect(entries.length).toBe(3);

    const refs = entries.map(e => e.ref_element);
    expect(refs).not.toContain('PDR-001');
    expect(refs).toContain('PDR-002');
    expect(refs).toContain('COMP-01');
    expect(refs).toContain('PART-01');

    // Verify component source marker (_source === 'ENTREPOT')
    const compEntry = entries.find(e => e.ref_element === 'COMP-01');
    expect(compEntry).toBeDefined();
    expect(compEntry?._source).toBe('ENTREPOT');
    expect(compEntry?.element_type).toBe('COMPONENT');

    // Verify PDR entry
    const pdrEntry = entries.find(e => e.ref_element === 'PDR-002');
    expect(pdrEntry).toBeDefined();
    expect(pdrEntry?.element_type).toBe('PDR');
    expect(pdrEntry?.qte_montee).toBe(1);
  });

  it('should return empty array if machine or blueprint is missing', () => {
    expect(buildLedgerEntriesFromBlueprint(null, null)).toEqual([]);
  });
});
