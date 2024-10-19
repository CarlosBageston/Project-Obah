import { useState, useEffect, useCallback } from 'react';
import { getItemsByQuery } from './queryFirebase';
import { where } from 'firebase/firestore';
import SituacaoProduto from '../enumeration/situacaoProduto';

function useDebouncedSuggestions<T>(
    nmField: string,
    collectionName: string,
    dispatch: any,
    typeSearch: 'Cliente' | 'Produto',
    tpProduto?: SituacaoProduto,
    delay: number = 200,
) {
    const [suggestions, setSuggestions] = useState<T[]>([]);

    // Função de busca otimizada com useCallback
    const fetchSuggestions = useCallback(async () => {
        if (!nmField) {
            setSuggestions([]);
            return;
        }

        try {
            let constraints: any[] = [];

            if (typeSearch === 'Cliente') {
                constraints = [
                    where('nmCliente', '>=', nmField),
                    where('nmCliente', '<=', nmField + '\uf8ff')
                ];
            } else {
                constraints = [
                    where('tpProduto', '==', tpProduto),
                    where('nmProduto', '>=', nmField),
                    where('nmProduto', '<=', nmField + '\uf8ff')
                ];
            }
            const { data } = await getItemsByQuery<T>(
                collectionName,
                constraints,
                dispatch
            );
            setSuggestions(data);
        } catch (error) {
            console.error('Erro ao buscar sugestões:', error);
            setSuggestions([]);
        }
    }, [nmField, collectionName, dispatch]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchSuggestions();
        }, delay);

        // Limpar o timeout se nmProduto ou delay mudar
        return () => {
            clearTimeout(handler);
        };
    }, [nmField, fetchSuggestions, delay]);

    return suggestions;
}

export default useDebouncedSuggestions;
