export function formatDescription(description: string): string {
    return description
        .toLowerCase() // Converte para minúsculas
        .replace(/[.\-\s]/g, ''); // Remove pontos, traços e espaços
}
// Formata CEP (ex: 12345-678)
export function formatCEP(value: string) {
    return value.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2").substr(0, 9);
}

// Formata telefone (ex: (11) 98765-4321)
export function formatPhoneNumber(value: string) {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    } else {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
}

// Formata CNPJ (ex: 12.345.678/0001-99)
export function formatCNPJ(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
}
