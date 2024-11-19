import { useEffect, useRef } from "react";

/**
 * Hook customizado para lidar com eventos de teclado em campos de entrada.
 * Ele fornece funcionalidades para navegar pelas sugestões e lidar com a submissão ao pressionar Enter.
 *
 * @returns Um objeto contendo referência ao elemento de sugestões, funções de manipulação de eventos de teclado e o índice da sugestão selecionada.
 * @public
 */
export default function useHandleInputKeyPress() {
    const inputRefF2 = useRef<HTMLInputElement>(null);
    const inputRefF3 = useRef<HTMLInputElement>(null);
    const inputRefF4 = useRef<HTMLInputElement>(null);

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
    // Adiciona o atalho de teclado usando o hook useShortcutPay
    useShortcut("F4", () => {
        if (inputRefF4.current) {
            inputRefF4.current.focus();
        }
    });

    useShortcut("F3", () => {
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
    function onKeyPressHandleSubmit(e: React.KeyboardEvent<HTMLDivElement>,handleSubmit: (e?: React.FormEvent<HTMLFormElement> | undefined) => void) {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            handleSubmit(); 
        }
    }
    return{
        onKeyPressHandleSubmit,
        inputRef: inputRefF2,
        inputRefF3,
        inputRefF4,
    }
}