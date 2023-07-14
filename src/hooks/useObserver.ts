import { useRef, useState, useEffect } from 'react';

/**
 * useObserver - Hook para observar a visibilidade de um elemento no viewport.
 * 
 * @returns Retorna um objeto contendo a referência do elemento (myRef) 
 *          e um estado booleano (isVisible) indicando se o elemento é visível.
 */
export default function useObserver() {
    const myRef = useRef(null);
    const [isVisible, setIsVisible] = useState<boolean>();
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                setIsVisible(entry.isIntersecting);
            }
        });
        observer.observe(myRef.current as unknown as Element);
    }, []);

    return {
        myRef,
        isVisible
    };
}