export function formatDescription(description: string): string {
    return description
        .toLowerCase() // Converte para minúsculas
        .replace(/[.\-\s]/g, ''); // Remove pontos, traços e espaços
}
