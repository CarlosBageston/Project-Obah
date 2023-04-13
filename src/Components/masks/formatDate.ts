

export default function formatDate(value: string): string {
        // Remove tudo que não for número
        const numbersOnly = value.replace(/[^\d]/g, '');
        // Adiciona separadores de dia, mês e ano
        const formattedDate = numbersOnly.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');

        return formattedDate;
    }