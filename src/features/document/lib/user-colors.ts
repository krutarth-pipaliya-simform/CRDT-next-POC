// Curated high-contrast collaborator palette checked against light and dark backgrounds
const COLLAB_COLORS = [
    "#2563eb", // Blue
    "#dc2626", // Red
    "#16a34a", // Green
    "#d97706", // Amber
    "#7c3aed", // Purple
    "#0891b2", // Cyan
    "#db2777", // Pink
    "#ea580c", // Orange
    "#4f46e5", // Indigo
    "#059669", // Emerald
];

export function getUserColor(userId: string): string {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = (hash << 5) - hash + userId.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % COLLAB_COLORS.length;
    return COLLAB_COLORS[index] ?? "#2563eb";
}
