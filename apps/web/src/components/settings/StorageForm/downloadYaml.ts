export function downloadYaml(yaml: string): void {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flows.yaml';
    link.click();
    URL.revokeObjectURL(url);
}
