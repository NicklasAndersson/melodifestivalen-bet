import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const UNSAFE_COLOR_FORMATS = ['oklch(', 'oklab('];
const COMPONENT_DIR = join(__dirname, '../components');

function getAllComponentFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory() && entry.name !== 'ui' && entry.name !== '__mocks__') {
      getAllComponentFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) && !entry.name.endsWith('.test.tsx') && !entry.name.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

describe('Color format validation across all components', () => {
  const componentFiles = getAllComponentFiles(COMPONENT_DIR);
  
  it('should find component files to test', () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  componentFiles.forEach((filePath) => {
    const fileName = filePath.split('/').pop() || filePath;
    
    describe(fileName, () => {
      const fileContent = readFileSync(filePath, 'utf-8');
      
      it('should not contain oklch color values in className strings', () => {
        const classNameMatches = fileContent.match(/className\s*=\s*[`"']([^`"']*oklch[^`"']*)[`"']/g);
        
        if (classNameMatches) {
          throw new Error(
            `Found oklch in className in ${fileName}:\n${classNameMatches.join('\n')}`
          );
        }
        
        expect(classNameMatches).toBeNull();
      });

      it('should not contain oklab color values in className strings', () => {
        const classNameMatches = fileContent.match(/className\s*=\s*[`"']([^`"']*oklab[^`"']*)[`"']/g);
        
        if (classNameMatches) {
          throw new Error(
            `Found oklab in className in ${fileName}:\n${classNameMatches.join('\n')}`
          );
        }
        
        expect(classNameMatches).toBeNull();
      });

      it('should not contain oklch in template literals for className', () => {
        const templateMatches = fileContent.match(/className\s*=\s*\{`[^`]*oklch[^`]*`\}/g);
        
        if (templateMatches) {
          throw new Error(
            `Found oklch in template literal className in ${fileName}:\n${templateMatches.join('\n')}`
          );
        }
        
        expect(templateMatches).toBeNull();
      });

      it('should not contain oklab in template literals for className', () => {
        const templateMatches = fileContent.match(/className\s*=\s*\{`[^`]*oklab[^`]*`\}/g);
        
        if (templateMatches) {
          throw new Error(
            `Found oklab in template literal className in ${fileName}:\n${templateMatches.join('\n')}`
          );
        }
        
        expect(templateMatches).toBeNull();
      });

      it('should use only safe color formats in Tailwind arbitrary values', () => {
        const arbitraryColorRegex = /(?:text|bg|border)-\[([^\]]+)\]/g;
        let match;
        const unsafeMatches: string[] = [];
        
        while ((match = arbitraryColorRegex.exec(fileContent)) !== null) {
          const colorValue = match[1];
          if (colorValue.includes('oklch') || colorValue.includes('oklab')) {
            unsafeMatches.push(match[0]);
          }
        }
        
        if (unsafeMatches.length > 0) {
          throw new Error(
            `Found unsafe color formats in arbitrary values in ${fileName}:\n${unsafeMatches.join('\n')}`
          );
        }
        
        expect(unsafeMatches.length).toBe(0);
      });

      it('should not contain oklch/oklab in inline style objects', () => {
        const styleMatches = fileContent.match(/style\s*=\s*\{[^}]*(?:oklch|oklab)[^}]*\}/g);
        
        if (styleMatches) {
          throw new Error(
            `Found oklch/oklab in inline styles in ${fileName}:\n${styleMatches.join('\n')}`
          );
        }
        
        expect(styleMatches).toBeNull();
      });
    });
  });

  it('provides guidance on safe color formats', () => {
    const safeFormats = [
      'Hex colors: #FFFFFF, #87CEEB, #CD7F32',
      'HSL colors: hsl(0, 100%, 50%)',
      'RGB colors: rgb(255, 255, 255)',
      'Named colors: gold, silver, bronze',
      'CSS variables: var(--color-name)',
    ];
    
    expect(safeFormats.length).toBeGreaterThan(0);
  });
});

describe('Export compatibility checks', () => {
  it('ensures GroupLeaderboard is export-safe', () => {
    const filePath = join(COMPONENT_DIR, 'GroupLeaderboard.tsx');
    const content = readFileSync(filePath, 'utf-8');
    
    UNSAFE_COLOR_FORMATS.forEach((format) => {
      expect(content).not.toContain(format);
    });
  });

  it('ensures PersonalLeaderboard is export-safe', () => {
    const filePath = join(COMPONENT_DIR, 'PersonalLeaderboard.tsx');
    const content = readFileSync(filePath, 'utf-8');
    
    UNSAFE_COLOR_FORMATS.forEach((format) => {
      expect(content).not.toContain(format);
    });
  });

  it('ensures GlobalLeaderboard is export-safe', () => {
    const filePath = join(COMPONENT_DIR, 'GlobalLeaderboard.tsx');
    const content = readFileSync(filePath, 'utf-8');
    
    UNSAFE_COLOR_FORMATS.forEach((format) => {
      expect(content).not.toContain(format);
    });
  });
});
