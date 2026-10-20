import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = join(process.cwd(), 'src');
const IGNORE_DIRS = [join(ROOT, 'styles')];

const ALLOWLIST: Record<string, string> = {
  // Next-Elite library components - use their own styling patterns
  'src/components/ui/accordion.tsx': 'Next-Elite library component',
  'src/components/ui/alert.tsx': 'Next-Elite library component',
  'src/components/ui/avatar.tsx': 'Next-Elite library component',
  'src/components/ui/badge.tsx': 'Next-Elite library component',
  'src/components/ui/breadcrumb.tsx': 'Next-Elite library component',
  'src/components/ui/button-group.tsx': 'Next-Elite library component',
  'src/components/ui/button.tsx': 'Next-Elite library component',
  'src/components/ui/card.tsx': 'Next-Elite library component',
  'src/components/ui/checkbox.tsx': 'Next-Elite library component',
  'src/components/ui/collapsible.tsx': 'Next-Elite library component',
  'src/components/ui/combobox.tsx': 'Next-Elite library component',
  'src/components/ui/dialog.tsx': 'Next-Elite library component',
  'src/components/ui/dropdown-menu.tsx': 'Next-Elite library component',
  'src/components/ui/input-error.tsx': 'Next-Elite library component',
  'src/components/ui/input-group.tsx': 'Next-Elite library component',
  'src/components/ui/input.tsx': 'Next-Elite library component',
  'src/components/ui/label.tsx': 'Next-Elite library component',
  'src/components/ui/navigation-menu.tsx': 'Next-Elite library component',
  'src/components/ui/popover.tsx': 'Next-Elite library component',
  'src/components/ui/progress.tsx': 'Next-Elite library component',
  'src/components/ui/radio-group.tsx': 'Next-Elite library component',
  'src/components/ui/select.tsx': 'Next-Elite library component',
  'src/components/ui/separator.tsx': 'Next-Elite library component',
  'src/components/ui/sheet.tsx': 'Next-Elite library component',
  'src/components/ui/skeleton.tsx': 'Next-Elite library component',
  'src/components/ui/stat-card.tsx': 'Next-Elite library component',
  'src/components/ui/status-indicator.tsx': 'Next-Elite library component',
  'src/components/ui/switch.tsx': 'Next-Elite library component',
  'src/components/ui/table.tsx': 'Next-Elite library component',
  'src/components/ui/tabs.tsx': 'Next-Elite library component',
  'src/components/ui/textarea.tsx': 'Next-Elite library component',
  'src/components/ui/theme-toggle.tsx': 'Next-Elite library component',
  'src/components/ui/toggle-group.tsx': 'Next-Elite library component',
  'src/components/ui/toggle.tsx': 'Next-Elite library component',
  'src/components/ui/tooltip.tsx': 'Next-Elite library component',
  'src/components/ui/ripple.tsx': 'Next-Elite library component',

  // Theme system files - contain intentional color definitions for theme variants
  'src/components/common/theme-toggle.tsx': 'Theme system - intentional color definitions',
  'src/hooks/use-theme-settings.ts': 'Theme system - intentional color definitions',
};

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

const RULES: { name: string; regex: RegExp }[] = [
  { name: 'colour literal (hex)', regex: /#[0-9a-fA-F]{3,8}\b/ },
  { name: 'colour function', regex: /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/ },
  {
    name: 'Tailwind palette colour',
    regex: new RegExp(
      `\\b(?:bg|text|border|ring|fill|stroke|from|to|via|outline|divide|shadow)-(?:${PALETTE})-\\d{2,3}\\b`,
    ),
  },
  {
    name: 'white/black utility',
    regex: /\b(?:bg|text|border|ring|fill|stroke)-(?:white|black)\b/,
  },
  {
    name: 'arbitrary value (colour, spacing, size, radius, type)',
    regex:
      /\b(?:bg|text|border|ring|fill|stroke|p[xytblrse]?|m[xytblrse]?|gap(?:-[xy])?|space-[xy]|w|h|size|min-w|max-w|min-h|max-h|rounded(?:-[a-z]+)?|top|left|right|bottom|inset(?:-[xy])?|leading|tracking)-\[[^\]]+\]/,
  },
  { name: 'dark: colour override', regex: /\bdark:(?:bg|text|border|ring|fill|stroke)-/ },
  { name: 'inline colour style', regex: /style=\{\{[^}]*(?:color|background|border)/i },
];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(full)) return [];
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(ROOT).filter((f) => /\.(tsx?|css)$/.test(f));
const problems: string[] = [];

for (const file of files) {
  const rel = relative(process.cwd(), file).split(sep).join('/');
  if (ALLOWLIST[rel]) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const rule of RULES) {
        if (rule.regex.test(line)) problems.push(`${rel}:${i + 1}  ${rule.name}: ${line.trim()}`);
      }
    });
}

if (problems.length > 0) {
  console.error(`tokens:check failed — ${problems.length} problem(s):\n`);
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`tokens:check passed (${files.length} files)`);
