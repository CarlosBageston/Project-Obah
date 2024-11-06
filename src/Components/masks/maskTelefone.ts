

/**
 * Formata um número de telefone no formato (XX) XXXXX-XXXX.
 * 
 * @param phone O número de telefone a ser formatado.
 * @returns O número de telefone formatado no formato (XX) XXXXX-XXXX.
 */
export default function formatPhone(value: string) {
    if (!value) return value;

    // Remove todos os caracteres não numéricos
    const phoneNumber = value.replace(/[^\d]/g, '');

    // Formata o número no padrão (XX) XXXXX-XXXX
    if (phoneNumber.length <= 2) return `(${phoneNumber}`;
    if (phoneNumber.length <= 7) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
}