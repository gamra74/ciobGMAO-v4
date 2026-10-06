import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Git LFS & Binary Files Configuration (P2-1)', () => {
  it('should have .gitattributes file configured in repository root', () => {
    const gitattributesPath = path.resolve(process.cwd(), '.gitattributes');
    expect(fs.existsSync(gitattributesPath)).toBe(true);

    const content = fs.readFileSync(gitattributesPath, 'utf-8');
    
    // Check Excel spreadsheet binary tracking
    expect(content).toContain('*.xlsx filter=lfs diff=lfs merge=lfs -text');
    expect(content).toContain('*.xls filter=lfs diff=lfs merge=lfs -text');
    expect(content).toContain('*.xlsm filter=lfs diff=lfs merge=lfs -text');
    expect(content).toContain('*.xlsb filter=lfs diff=lfs merge=lfs -text');

    // Check Binary Archives & Assets tracking
    expect(content).toContain('*.zip filter=lfs diff=lfs merge=lfs -text');
    expect(content).toContain('*.pdf filter=lfs diff=lfs merge=lfs -text');
  });

  it('should have .gitignore properly excluding local temporary envs and lock conflicts', () => {
    const gitignorePath = path.resolve(process.cwd(), '.gitignore');
    expect(fs.existsSync(gitignorePath)).toBe(true);

    const content = fs.readFileSync(gitignorePath, 'utf-8');
    expect(content).toContain('.env.local');
    expect(content).toContain('.env.production.local');
    expect(content).toContain('dist/');
    expect(content).toContain('node_modules/');
  });
});
