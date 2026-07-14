// ═════════════════════════════════════════════════════════════════════════════
//  LINEUP — EDIT EVERYTHING HERE
//  ---------------------------------------------------------------------------
//  This is the ONLY file you touch to change the programmation.
//
//  Three name tiers per day, matching the poster reference:
//    • headliners  → BIG, beige, always UPPERCASE. First entry is top-billed.
//                    Add a 2nd entry for a B2B that needs its own line, e.g.
//                        MAX DEAN B2B
//                        LUKE DEAN
//    • support     → medium, red, bold. ONE name. Keep the casing you want
//                    shown (e.g. "NIFRA" vs "Invité Surprise") — it renders
//                    exactly as typed, nothing is auto-uppercased.
//    • locals      → small, red. One or more names, same casing rule.
//
//  Add or remove days by adding/removing objects in the array — the grid and
//  all animations adapt automatically (works for 1, 2, 3, 4+ days).
// ═════════════════════════════════════════════════════════════════════════════

export interface LineupDay {
	/** Shown in light red, uppercase, above the names. */
	date: string;
	/** Beige, biggest, forced uppercase. 2 entries = B2B split onto two lines. */
	headliners: string[];
	/** Red, medium. Exactly one name, shown as typed. */
	support: string;
	/** Red, smallest. One or more names, shown as typed. */
	locals: string[];
}

export const LINEUP: LineupDay[] = [
	{
		date: 'VEN 04 SEPT.',
		headliners: ['TRYM'],
		support: 'NIFRA',
		locals: ['Deroz']
	},
	{
		date: 'SAM 05 SEPT.',
		headliners: ['DON DIABLO'],
		support: 'Invité Surprise',
		locals: ['Anna Wilder']
	},
	{
		date: 'DIM 06 SEPT.',
		headliners: ['MAX DEAN B2B', 'LUKE DEAN'],
		support: 'Tommy Phillips',
		locals: ['Simon Fitch']
	}
];

// ── Section header copy (also editable) ──────────────────────────────────────
export const LINEUP_EYEBROW = 'Programmation';
export const LINEUP_TITLE = 'Lineup';