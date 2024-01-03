
/**
 * Hook personalizado para formatação de valores monetários em reais (BRL).
 *
 * @returns Objeto contendo funções para formatação e conversão de valores monetários.
 */
export default function useFormatCurrency(){

    /**
     * Formata um valor monetário brasileiro a partir de uma string.
     *
     * @param valor - A string contendo o valor a ser formatado.
     * @returns O valor formatado como moeda brasileira (R$).
     */
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
    /**
     * Formata um valor monetário brasileiro a partir de um número.
     *
     * @param valor - O valor a ser formatado.
     * @returns O valor formatado como moeda brasileira (R$).
     */
    function formatBrazilianCurrencyTable(valor: number) {
        // Formata como moeda brasileira (R$)
        const formattedText = valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return formattedText;
    }

    /**
     * Converte uma string para um número de ponto flutuante.
     *
     * @param valor - A string contendo o valor a ser convertido.
     * @returns O valor convertido para número de ponto flutuante.
     */
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