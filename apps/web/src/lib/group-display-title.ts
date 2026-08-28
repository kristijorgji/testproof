export function groupDisplayTitle(group: { title: string; subtitle?: string }): string {
    return group.subtitle ? `${group.title} — ${group.subtitle}` : group.title;
}
