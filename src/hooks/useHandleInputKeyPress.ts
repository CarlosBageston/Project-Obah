import { useEffect, useRef, useState } from "react";
import ProdutosModel from "../Pages/admin/cadastroProdutos/model/produtos";

/**
 * Hook customizado para lidar com eventos de teclado em campos de entrada.
 * Ele fornece funcionalidades para navegar pelas sugestões e lidar com a submissão ao pressionar Enter.
 *
 * @returns Um objeto contendo referência ao elemento de sugestões, funções de manipulação de eventos de teclado e o índice da sugestão selecionada.
 * @public
 */
export default function useHandleInputKeyPress(setShowSuggestion?: (value: React.SetStateAction<boolean>) => void) {
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(0);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const inputRefF1 = useRef<HTMLInputElement>(null);
    const inputRefF2 = useRef<HTMLInputElement>(null);
    const inputRefF3 = useRef<HTMLInputElement>(null);
    const inputRefF4 = useRef<HTMLInputElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && setShowSuggestion) {
            setShowSuggestion(false);
        }
    };

    useEffect(() => {
        // Adiciona um event listener para capturar cliques fora da lista de sugestões
        document.addEventListener('mousedown', handleClickOutside);

        // Remove o event listener quando o componente for desmontado para evitar vazamentos de memória
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /**
     * ajustar o scroll quando o índice da sugestão selecionada muda.
     */
    useEffect(() => {
        // Ajusta o scroll quando o selectedSuggestionIndex muda
        if (suggestionsRef.current && selectedSuggestionIndex !== null) {
            const selectedSuggestionElement = suggestionsRef.current.children[selectedSuggestionIndex];
            if (selectedSuggestionElement) {
                // Ajusta o scroll para trazer o item selecionado para a visão
                selectedSuggestionElement.scrollIntoView({
                    behavior: 'auto',
                    block: 'nearest',
                });
            }
        }
    }, [selectedSuggestionIndex]);

    /**
     * Manipula eventos de teclado em campos de entrada, permitindo a navegação entre sugestões e a seleção ao pressionar Enter.
     *
     * @param e - Evento de teclado React.
     * @param productSuggestion - Lista de sugestões de produtos.
     * @param selectSuggestion - Função para selecionar uma sugestão.
     */
    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>, 
        productSuggestion: ProdutosModel[], 
        selectSuggestion: (produto: ProdutosModel) => void
        ) => {
        // Verifica se a tecla pressionada é a seta para baixo
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (productSuggestion.length > 0) {
                const nextIndex = (selectedSuggestionIndex + 1) % productSuggestion.length;
                setSelectedSuggestionIndex(nextIndex);
            }
        } else if (e.key === 'Enter') {
            if (productSuggestion.length > 0 && selectedSuggestionIndex !== null) {
                selectSuggestion(productSuggestion[selectedSuggestionIndex]);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (productSuggestion.length > 0) {
                const nextIndex = (selectedSuggestionIndex - 1) % productSuggestion.length;
                setSelectedSuggestionIndex(nextIndex);
            }
        }
    };
    /**
     * Adiciona o efeito ao nível do documento para ouvir eventos de teclado para a tecla especificada.
     *
     * @param key - Código da tecla.
     * @param callback - Função que retorna chamada quando a tecla é pressionada.
     */
    const useShortcutComanda = (key: string, callback: () => void) => {
        useEffect(() => {
            const handleKeyPress = (e: Event) => {
                if (e instanceof KeyboardEvent && e.key === key) {
                    e.preventDefault();
                    callback();
                }
            };

            document.addEventListener("keydown", handleKeyPress);

            return () => {
                document.removeEventListener("keydown", handleKeyPress);
            };
        }, [key, callback]);
    };
    // Adiciona o atalho de teclado usando o hook useShortcutCodProduct
    useShortcutComanda("F1", () => {
        if (inputRefF1.current) {
            const input = inputRefF1.current.querySelector('input');
                    if (input) {
                        input.focus();
                    }
        }
    });
    /**
     * Adiciona o efeito ao nível do documento para ouvir eventos de teclado para a tecla especificada.
     *
     * @param key - Código da tecla.
     * @param callback - Função que retorna chamada quando a tecla é pressionada.
     */
    const useShortcut = (key: string, callback: () => void) => {
        useEffect(() => {
            const handleKeyPress = (e: Event) => {
                if (e instanceof KeyboardEvent && e.key === key) {
                    e.preventDefault();
                    callback();
                }
            };
    
            document.addEventListener("keydown", handleKeyPress);
    
            return () => {
                document.removeEventListener("keydown", handleKeyPress);
            };
        }, [key, callback]);
    };
    // Adiciona o atalho de teclado usando o hook useShortcut
    useShortcut("F2", () => {
        if (inputRefF2.current) {
            inputRefF2.current.focus();
        }
    });
    /**
     * Adiciona o efeito ao nível do documento para ouvir eventos de teclado para a tecla especificada.
     *
     * @param key - Código da tecla.
     * @param callback - Função que retorna chamada quando a tecla é pressionada.
     */
    const useShortcutPay = (key: string, callback: () => void) => {
        useEffect(() => {
            const handleKeyPress = (e: Event) => {
                if (e instanceof KeyboardEvent && e.key === key) {
                    e.preventDefault();
                    callback();
                }
            };

            document.addEventListener("keydown", handleKeyPress);

            return () => {
                document.removeEventListener("keydown", handleKeyPress);
            };
        }, [key, callback]);
    };
    // Adiciona o atalho de teclado usando o hook useShortcutPay
    useShortcutPay("F4", () => {
        if (inputRefF4.current) {
            inputRefF4.current.focus();
        }
    });

    /**
     * Adiciona o efeito ao nível do documento para ouvir eventos de teclado para a tecla especificada.
     *
     * @param key - Código da tecla.
     * @param callback - Função que retorna chamada quando a tecla é pressionada.
     */
    const useShortcutCodProduct = (key: string, callback: () => void) => {
        useEffect(() => {
            const handleKeyPress = (e: Event) => {
                if (e instanceof KeyboardEvent && e.key === key) {
                    e.preventDefault();
                    callback();
                }
            };

            document.addEventListener("keydown", handleKeyPress);

            return () => {
                document.removeEventListener("keydown", handleKeyPress);
            };
        }, [key, callback]);
    };
    // Adiciona o atalho de teclado usando o hook useShortcutCodProduct
    useShortcutCodProduct("F3", () => {
        if (inputRefF3.current) {
            inputRefF3.current.focus();
        }
    });
    /**
     * Manipula o evento de tecla Enter para submeter um formulário.
     *
     * @param e - Evento de teclado React.
     * @param handleSubmit - Função de submissão do formulário.
     */
    function onKeyPressHandleSubmit(e: React.KeyboardEvent<HTMLInputElement>,handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            handleSubmit(); 
        }
    }
    return{
        suggestionsRef,
        handleInputKeyDown,
        selectedSuggestionIndex,
        onKeyPressHandleSubmit,
        inputRef: inputRefF2,
        inputRefF3,
        inputRefF4,
        inputRefF1
    }
}