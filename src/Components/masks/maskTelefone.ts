

/**
 * Formata um número de telefone no formato (XX) XXXXX-XXXX.
 * 
 * @param phone O número de telefone a ser formatado.
 * @returns O número de telefone formatado no formato (XX) XXXXX-XXXX.
 */
export default function formatPhone(phone: string) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
}