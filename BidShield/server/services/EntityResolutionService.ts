export interface EntityComparisonResult {
  score: number; // 0 to 100
  isMatch: boolean;
  matchClassification: 'EXACT' | 'LEGAL_ABBREVIATION' | 'PARTIAL' | 'MISMATCH';
  reason: string;
  differences: string[];
}

export class EntityResolutionService {
  private static normalizeEntityName(name: string): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\./g, ' ')
      .replace(/,\s*/g, ' ')
      .replace(/\bprivate limited\b/g, 'pvt ltd')
      .replace(/\bpvt\.\s*ltd\b/g, 'pvt ltd')
      .replace(/\blimited\b/g, 'ltd')
      .replace(/\bllp\b/g, 'limited liability partnership')
      .replace(/\bcorp\b/g, 'corporation')
      .replace(/\binc\b/g, 'incorporated')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static stripLegalSuffixes(name: string): string {
    if (!name) return '';
    const norm = this.normalizeEntityName(name);
    return norm
      .replace(/\bpvt ltd\b/g, '')
      .replace(/\bltd\b/g, '')
      .replace(/\blimited liability partnership\b/g, '')
      .replace(/\btechnologies\b/g, 'tech')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public static compareNames(nameA: string, nameB: string): EntityComparisonResult {
    if (!nameA || !nameB) {
      return {
        score: 0,
        isMatch: false,
        matchClassification: 'MISMATCH',
        reason: 'One or both entity names are missing for comparison.',
        differences: ['Missing entity identifier'],
      };
    }

    const cleanA = nameA.trim().toLowerCase();
    const cleanB = nameB.trim().toLowerCase();

    if (cleanA === cleanB) {
      return {
        score: 100,
        isMatch: true,
        matchClassification: 'EXACT',
        reason: 'Exact verbatim string match across entity identifiers.',
        differences: [],
      };
    }

    const normA = this.normalizeEntityName(nameA);
    const normB = this.normalizeEntityName(nameB);

    if (normA === normB) {
      return {
        score: 98,
        isMatch: true,
        matchClassification: 'LEGAL_ABBREVIATION',
        reason: 'Names differ only by legal abbreviation (e.g., "Private Limited" vs "Pvt Ltd").',
        differences: [`Punctuation and corporate expansion variation: "${nameA}" vs "${nameB}"`],
      };
    }

    const coreA = this.stripLegalSuffixes(nameA);
    const coreB = this.stripLegalSuffixes(nameB);

    if (coreA === coreB && coreA.length > 3) {
      return {
        score: 96,
        isMatch: true,
        matchClassification: 'LEGAL_ABBREVIATION',
        reason: 'Names differ only by legal entity suffixes and standard abbreviations.',
        differences: [`Corporate structure suffix difference: "${nameA}" vs "${nameB}"`],
      };
    }

    // Levenshtein distance on normalized
    const distance = this.levenshtein(normA, normB);
    const maxLen = Math.max(normA.length, normB.length);
    const similarity = Math.max(0, 1 - distance / maxLen);
    const score = Math.round(similarity * 100);

    if (score >= 80) {
      return {
        score,
        isMatch: true,
        matchClassification: 'PARTIAL',
        reason: `Minor spelling or spacing variance detected (${score}% similarity).`,
        differences: [`Minor lexical variation between "${nameA}" and "${nameB}"`],
      };
    }

    return {
      score,
      isMatch: false,
      matchClassification: 'MISMATCH',
      reason: `Critical discrepancy: Legal entity names do not match ("${nameA}" vs "${nameB}").`,
      differences: [`Distinct legal entities: "${nameA}" vs "${nameB}"`],
    };
  }

  private static levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
