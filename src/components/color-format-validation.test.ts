import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const UNSAFE_COLOR_FORMATS = ['oklch(', 'oklab(', 'oklch', 'oklab'];
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

function findColorFormatIssues(content: string, fileName: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, lineNumber) => {
    if (line.includes('oklch') || line.includes('oklab')) {
      if (
        line.includes('className') ||
        line.includes('style=') ||
        line.includes('background') ||
        line.includes('color:') ||
        line.includes('border')
      ) {
        issues.push(
          `${fileName}:${lineNumber + 1} - Found unsafe color format: ${line.trim()}`
        );
      }
    }
  });
  
  return issues;
}

describe('Color format validation across all components', () => {
  const componentFiles = getAllComponentFiles(COMPONENT_DIR);
  
  it('should find component files to test', () => {
    expect(componentFiles.length).toBeGreaterThan(0);
  });

  it('CRITICAL: No component should contain oklch or oklab color formats', () => {
    const allIssues: string[] = [];
    
    componentFiles.forEach((filePath) => {
      const fileName = filePath.split('/').pop() || filePath;
      const fileContent = readFileSync(filePath, 'utf-8');
      const issues = findColorFormatIssues(fileContent, fileName);
      allIssues.push(...issues);
    });

    if (allIssues.length > 0) {
      throw new Error(
        `\n${'='.repeat(80)}\n` +
        `CRITICAL ERROR: Unsafe color formats detected!\n` +
        `oklch/oklab causes "Attempting to parse an unsupported color function" error in html2canvas\n` +
        `${'='.repeat(80)}\n\n` +
        `Found ${allIssues.length} issue(s):\n\n` +
        allIssues.join('\n') +
        `\n\n${'='.repeat(80)}\n` +
        `SOLUTION: Use these safe color formats instead:\n` +
        `  ✅ Hex colors: #FFFFFF, #87CEEB, #CD7F32\n` +
        `  ✅ HSL colors: hsl(320, 30%, 96%)\n` +
        `  ✅ RGB colors: rgb(255, 255, 255)\n` +
        `  ✅ RGBA colors: rgba(255, 255, 255, 0.5)\n` +
        `  ✅ Named colors: gold, silver, bronze\n` +
        `  ✅ CSS variables: var(--color-name)\n` +
        `${'='.repeat(80)}\n`
      );
    }

    expect(allIssues.length).toBe(0);
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

describe('CSS files validation', () => {
  it('ensures index.css uses only HSL color format', () => {
    const cssPath = join(__dirname, '../index.css');
    const content = readFileSync(cssPath, 'utf-8');
    
    const issues: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, lineNumber) => {
      if (line.includes('oklch') || line.includes('oklab')) {
        if (line.trim().startsWith('*') || line.trim().startsWith('//')) {
          return;
        }
        issues.push(`Line ${lineNumber + 1}: ${line.trim()}`);
      }
    });
    
    if (issues.length > 0) {
      throw new Error(
        `\n${'='.repeat(80)}\n` +
        `CRITICAL: index.css contains unsafe color formats!\n` +
        `${'='.repeat(80)}\n\n` +
        `These will cause export failures with html2canvas:\n\n` +
        issues.join('\n') +
        `\n\n${'='.repeat(80)}\n` +
        `REQUIRED: Use HSL format in index.css:\n` +
        `  Example: --primary: 340 50% 60%;\n` +
        `  NOT: --primary: oklch(0.6 0.12 340);\n` +
        `${'='.repeat(80)}\n`
      );
    }
    
    expect(issues.length).toBe(0);
  });

  it('ensures all CSS color variables use HSL format', () => {
    const cssPath = join(__dirname, '../index.css');
    const content = readFileSync(cssPath, 'utf-8');
    
    const colorVarPattern = /--[\w-]+:\s*([^;]+);/g;
    let match;
    const invalidVars: string[] = [];
    
    while ((match = colorVarPattern.exec(content)) !== null) {
      const value = match[1].trim();
      if (value.includes('oklch') || value.includes('oklab')) {
        invalidVars.push(`${match[0]} (contains ${value.includes('oklch') ? 'oklch' : 'oklab'})`);
      }
    }
    
    if (invalidVars.length > 0) {
      throw new Error(
        `Found CSS variables with unsafe color formats:\n` +
        invalidVars.join('\n') +
        `\n\nUse HSL format instead: --color: 340 50% 60%;`
      );
    }
    
    expect(invalidVars.length).toBe(0);
  });
});
