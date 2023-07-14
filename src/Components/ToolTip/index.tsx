import { useRef, useState, useEffect } from 'react';
import { Box, StyledIcon, Title } from './style'

interface Props {
    tooltipRef: React.RefObject<HTMLDivElement>;
}
/**
 * Componente de Tooltip que exibe um botão de "Voltar ao Topo" quando o elemento alvo está visível no viewport.
 * @param tooltipRef - Referência para o elemento que será observado pelo IntersectionObserver.
 * @returns  O componente de Tooltip.
*/
export default function ToolTip({ tooltipRef }: Props) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const options = {
            rootMargin: "50% 0px",
            threshold: 0,
        };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            });
        }, options);

        if (tooltipRef.current) {
            observer.observe(tooltipRef.current);
        }

        return () => {
            if (tooltipRef.current) {
                observer.unobserve(tooltipRef.current);
            }
        };
    }, []);

    return (
        <>
            {isVisible &&
                <Box
                    to='menu'
                    spy={true}
                    smooth={true}
                    offset={-70}
                    duration={500}
                    activeClass="active"
                >
                    <Title>Voltar ao Topo</Title>
                    <StyledIcon />
                </Box>
            }
        </>
    )
}