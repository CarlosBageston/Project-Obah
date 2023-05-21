import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle } from '@mui/material';
import { ContainerAlert } from './style';


interface Props {
    submitForm: boolean | undefined,
    name: string
}
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
