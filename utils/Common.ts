export function generateId(): string {
    const timestamp = Date.now().toString(16).padStart(12, "0");
    const random = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    return (timestamp + random).slice(0, 32);
}

export function formatDisplayDate(date: Date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

export function formatDatabaseDate(date: Date) {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
}

export function formatDate(dateString: string | null) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}