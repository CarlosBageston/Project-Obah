import React, { useState } from "react";
import styled, { css } from "styled-components";

interface Props {
    src: string;
    src2: string
    alt?: string;
    width?: number;
}

export const RotatingImage: React.FC<Props> = ({
    src,
    src2,
    alt,
    width = 150,
}) => {
    const [changeImage, setChangeImage] = useState<boolean>();
    const [rotateImage, setRotateImage] = useState<boolean>();

    const handleMouseEnter = () => {
        setChangeImage(true);
        setTimeout(() => {
            setRotateImage(true);
        }, 200);
    };

    const handleMouseLeave = () => {
        setChangeImage(false);
        setTimeout(() => {
            setRotateImage(false);
        }, 200);
        setTimeout(() => {
            setChangeImage(undefined);
            setRotateImage(undefined);
        }, 250);
    };

    return (
        <ContainerImageSingle
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
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
`;

const Image = styled.img<{ changeImage?: boolean, rotateImage?: boolean }>`
width: 150px;

${({ changeImage }) =>
        changeImage &&
        css`
transform: rotateY(90deg);
transition: transform 0.2s linear;
`}
${({ rotateImage }) =>
        rotateImage &&
        css`
transform: rotateY(0deg);
transition: transform 0.2s linear 0.2s;
`}
${({ changeImage }) =>
        changeImage === false &&
        css`
transform: rotateY(90deg);
transition: transform 0.2s linear;
`}
${({ rotateImage }) =>
        rotateImage === false &&
        css`
transform: rotateY(0deg);
transition: transform 0.2s linear 0.2s;
`}

`