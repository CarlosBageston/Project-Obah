import { useRef, useState, useEffect } from 'react';


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