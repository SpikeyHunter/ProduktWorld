// ── Info-section visibility toggle ───────────────────────────────────────────
// Flip this ONE value to control where the Information section shows up:
//   'localhost'   → only while running `npm run dev` (localhost, 127.0.0.1,
//                    AND your network IP like 10.x.x.x when testing on mobile)
//   'production'  → only on the live/hosted, production-built site
//   'both'        → always visible, everywhere
//   'off'         → fully hidden everywhere (hard kill switch)
export const INFO_SECTION_VISIBILITY: 'localhost' | 'production' | 'both' | 'off' = 'off';

export function isInfoSectionVisible(): boolean {
	if (INFO_SECTION_VISIBILITY === 'off') return false;
	if (INFO_SECTION_VISIBILITY === 'both') return true;

	// import.meta.env.DEV is true for any `vite dev` session — localhost,
	// 127.0.0.1, or a network IP (10.x/192.168.x) when testing on your phone —
	// and false once the site is production-built (`vite build`) and deployed.
	const isDev = import.meta.env.DEV;
	return INFO_SECTION_VISIBILITY === 'localhost' ? isDev : !isDev;
}