import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";

interface Props {
    src: string;
    src2: string
    alt?: string;
    width?: number;
}

/**
 * Componente que exibe uma imagem que gira quando o mouse é colocado em cima dela.
 * A imagem inicial é definida pelo prop "src" e a imagem girada é definida pelo prop "src2".
 * O tamanho da imagem pode ser definido pelo prop "width".
 * Quando o mouse é colocado em cima da imagem, ela é alterada para a imagem girada gradualmente.
 * Quando o mouse é removido, a imagem retorna à posição inicial gradualmente.
 */

export const RotatingImage: React.FC<Props> = ({
    src,
    src2,
    alt,
    width = 150,
}) => {
    const [changeImage, setChangeImage] = useState<boolean | undefined>();
    const [rotateImage, setRotateImage] = useState<boolean | undefined>();

    useEffect(() => {
        const handleInterval = () => {
            setChangeImage(true);
            setTimeout(() => {
                setRotateImage(true);
            }, 1000);

            setTimeout(() => {
                setChangeImage(false);
                setTimeout(() => {
                    setRotateImage(false);
                }, 1000);
                setTimeout(() => {
                    setChangeImage(undefined);
                    setRotateImage(undefined);
                }, 2000);
            }, 5000);
        };
        const intervalId = setInterval(handleInterval, 12000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <ContainerImageSingle>
            <Image
                rotateImage={rotateImage}
                changeImage={changeImage}
                src={rotateImage ? src : src2}
                alt={alt}
                width={width}
            />
        </ContainerImageSingle>
    );
};

const ContainerImageSingle = styled.div`
width: 12rem;
height: 12rem;
background-color: wheat;
border-radius: 50%;
display: flex;
justify-content: center;
box-shadow: 2px 2px 2px 2px #00000024;
@media (max-width: 700px) {
    width: 10rem;
    height: 10rem;
}
`;

const Image = styled.img<{ changeImage?: boolean, rotateImage?: boolean }>`
width: 150px;

${({ changeImage }) =>
        changeImage &&
        css`
transform: rotateY(90deg);
transition: transform 1s linear;
`}
${({ rotateImage }) =>
        rotateImage &&
        css`
transform: rotateY(0deg);
transition: transform 1s1 linear;
`}
${({ changeImage }) =>
        changeImage === false &&
        css`
transform: rotateY(90deg);
transition: transform 1s linear;
`}
${({ rotateImage }) =>
        rotateImage === false &&
        css`
transform: rotateY(0deg);
transition: transform 1s linear ;
`}

@media (max-width: 700px) {
    width: 120px;
}

`