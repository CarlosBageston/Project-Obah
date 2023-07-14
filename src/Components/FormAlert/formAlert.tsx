import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { ContainerAlert } from './style';


interface Props {
    submitForm: boolean | undefined,
    name: string
}

/**
 * FormAlert Component
 * 
 * @param submitForm Indica se o formulário foi submetido (true: sucesso, false: falha)
 * @param name Nome do item cadastrado no formulário
 * 
 * Este componente exibe um alerta visual para indicar o resultado de uma submissão de formulário.
 * Dependendo do valor de "submitForm", o componente exibirá um alerta de sucesso ou erro por um determinado período de tempo.
 * O nome do item cadastrado é utilizado no conteúdo do alerta para fornecer informações específicas.
 */

const FormAlert = ({ submitForm, name }: Props) => {

    const [fail, setFail] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (submitForm === true) {
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000);
        } else if (submitForm === false) {
            setFail(true)
            setTimeout(() => setFail(false), 3000);
        }
    }, [submitForm])

    return (
        <>
            {success && (
                <ContainerAlert>
                    <Alert severity="success"
                        style={{
                            position: 'absolute',
                            marginTop: '-20px',
                            width: '25rem'
                        }}
                    >
                        <AlertTitle>
                            <strong>Sucesso</strong>
                        </AlertTitle>
                        {name} Cadastrado com <strong>Sucesso!</strong>
                    </Alert>
                </ContainerAlert>
            )}
            {fail && (
                <ContainerAlert>
                    <Alert severity="error"
                        style={{
                            position: 'absolute',
                            marginTop: '-20px',
                            width: '25rem'
                        }}
                    >
                        <AlertTitle>
                            <strong>Erro</strong>
                        </AlertTitle>
                        Erro ao Cadastrar {name}. <strong>Tente novamente</strong>
                    </Alert>
                </ContainerAlert>
            )}
        </>
    );
};

export default FormAlert;
