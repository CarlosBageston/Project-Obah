

export default function useFormatCurrency(){

    function formatBrazilianCurrency(valor: string) {
        // Remove todos os caracteres não numéricos
        const cleanedValue = valor.replace(/[^\d.,]/g, '').replace(',', '.');
        
        // Transforma a string de números em um número de ponto flutuante
        const parsedValue = parseFloat(cleanedValue) || 0;

        // Formata como moeda brasileira (R$)
        const formattedText = parsedValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return formattedText;
    }
    
    function formatBrazilianCurrencyTable(valor: number) {
        // Formata como moeda brasileira (R$)
        const formattedText = valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return formattedText;
    }
    function convertToNumber(valor: string) {
        // Remove letras e substitui ponto por vírgula
        const cleanedValue = valor.replace(/[^0-9,.]/g, '').replace(/[.]/g, '');

        // Converte a string de números para um número de ponto flutuante
        return parseFloat(cleanedValue.replace(',', '.')) || 0;
    }

    return {
        formatBrazilianCurrency,
        formatBrazilianCurrencyTable,
        convertToNumber
    }
}