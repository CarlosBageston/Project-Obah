import { ContainerAlert } from './style';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { State } from '../../store/reducer/reducer';
import { Alert, AlertTitle, Box, CircularProgress } from '@mui/material';


interface Props {
    submitForm: boolean | undefined,
    name: string,
    styleLoadingMarginTop?: string
    styleLoadingMarginLeft?: string
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

const FormAlert = ({ submitForm, name, styleLoadingMarginTop, styleLoadingMarginLeft }: Props) => {

    const [fail, setFail] = useState(false);
    const [success, setSuccess] = useState(false);
    const { loading } = useSelector((state: State) => state.user);
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

            {loading ? (
                <ContainerAlert>
                    <Box
                        style={{
                            position: 'absolute',
                            marginTop: styleLoadingMarginTop ? styleLoadingMarginTop : '5rem',
                            marginLeft: styleLoadingMarginLeft ? styleLoadingMarginLeft : 0
                        }}
                    >
                        <CircularProgress />
                    </Box>
                </ContainerAlert>
            ) : null}
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
