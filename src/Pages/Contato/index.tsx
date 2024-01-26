import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import ContatoModel from './model/contato';
import Input from '../../Components/input';
import Button from '../../Components/button';
import ToolTip from '../../Components/ToolTip';
import formatPhone from '../../Components/masks/maskTelefone';

//Import Imagens/Icons
import detalhe from '../../assets/Image/detalhe.png';
import iconFacebook from '../../assets/Icon/facebook-icon.png';
import iconwhatsapp from '../../assets/Icon/whatsapp-icon.png';
import iconinstagram from '../../assets/Icon/instagram-icon.png';
import fundo from '../../../src/assets/Image/fundo.jpg';
import derreter from '../../../src/assets/Image/derreter.png';

//import do styled components
import {
    Box,
    Title,
    Ancora,
    TitleBox,
    SubTitleBox,
    ContainerBox,
    ContainerAll,
    ContainerIcons,
    ContainerTitle,
    ContainerContato,
    SubTitleWhatsapp,
    ImageDetail,
    ImageBackground,
} from './style';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { Alert, AlertTitle } from '@mui/material';



export default function Contato() {
    const targetRef = useRef<HTMLDivElement>(null);
    const [submitForm, setSubmitForm] = useState<boolean | undefined>(undefined);
    const [key, setKey] = useState<number>(0);

    const initialValues: ContatoModel = ({
        msgContato: '',
        nmContato: '',
        tfContato: '',
        emailContato: '',
        msgOpenContato: false
    });


    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue, resetForm } = useFormik<ContatoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            msgContato: Yup.string().required('Campo obrigatório'),
            nmContato: Yup.string().required('Campo obrigatório'),
            tfContato: Yup.string().required('Campo obrigatório').min(11, "Digite o número de telefone completo"),
            emailContato: Yup.string().email('E-mail invalido').optional().nullable()
        }),
        onSubmit: hundleSubmitForm,
    });

    function cleanState() {
        setFieldValue('msgContato', '')
        setFieldValue('nmContato', '')
        setFieldValue('tfContato', '')
        setFieldValue('emailContato', '')
        setKey(Math.random());
    }

    //envia informações para o banco
    async function hundleSubmitForm() {
        await addDoc(collection(db, "Pedidos"), {
            ...values
        }).then(() => {
            setSubmitForm(true);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        }).catch(() => {
            setSubmitForm(false);
            setTimeout(() => { setSubmitForm(undefined) }, 3000)
        });
        resetForm()
        cleanState()
    }
    return (
        <>
            <Box id="contato">
                {/*toolTip */}
                <ToolTip tooltipRef={targetRef} />
                <div>
                    <ImageDetail src={derreter} alt='derreter' />
                    <ImageBackground src={fundo} alt='fundo' />
                </div>
                <ContainerAll>

                    <ContainerTitle >
                        <img src={detalhe} alt="Sorvete" width={250} />
                        <Title>Fale Conosco</Title>
                    </ContainerTitle>
                    <ContainerContato>
                        <ContainerBox ref={targetRef}>
                            <TitleBox>Nos acompanhe</TitleBox>
                            <SubTitleBox>nas redes sociais</SubTitleBox>
                            <ContainerIcons>
                                <div>
                                    <Ancora
                                        target='_blank'
                                        href="https://www.instagram.com/marbellasorvetes/"> {/* colocar o link correto*/}
                                        <img src={iconinstagram} alt="instagram" width={50} />
                                        @sorveteObah!
                                    </Ancora>
                                </div>
                                <div>
                                    <Ancora
                                        target='_blank'
                                        href="https://www.facebook.com/marbella.sorvetes"> {/* colocar o link correto*/}
                                        <img src={iconFacebook} alt="facebook" width={50} />
                                        SorveteriaObah!
                                    </Ancora>
                                </div>
                                <SubTitleWhatsapp>Se preferir entre em contato pelo whatsapp</SubTitleWhatsapp>
                                <div>
                                    <Ancora
                                        target='_blank'
                                        href="https://api.whatsapp.com/send?phone=5546999358718&text=Oi,%20tenho%20interesse%20em%20adquirir%20seus%20produtos%20:)">
                                        <img src={iconwhatsapp} alt="facebook" width={50} />
                                        SorveteriaObah!
                                    </Ancora>
                                </div>
                            </ContainerIcons>
                        </ContainerBox>
                        <ContainerBox>
                            <TitleBox>Entre em contato</TitleBox>
                            <SubTitleBox>Preencha o formulario abaixo</SubTitleBox>
                            <Input
                                key={`nmContato-${key}`}
                                label='Nome'
                                name='nmContato'
                                onBlur={handleBlur}
                                value={values.nmContato}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nmContato && errors.nmContato ? errors.nmContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                                style={{ color: '#ffffff' }}
                                raisedLabel={values.nmContato ? true : false}
                            />
                            <Input
                                key={`tfContato-${key}`}
                                maxLength={12}
                                label='Telefone'
                                name='tfContato'
                                onBlur={handleBlur}
                                value={formatPhone(values.tfContato)}
                                onChange={e => setFieldValue(e.target.name, e.target.value.replace(/[^0-9]/g, ''))}
                                error={touched.tfContato && errors.tfContato ? errors.tfContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                                style={{ color: '#ffffff' }}
                                raisedLabel={values.tfContato ? true : false}
                            />
                            <Input
                                key={`emailContato-${key}`}
                                label='Email'
                                name='emailContato'
                                onBlur={handleBlur}
                                value={values.emailContato}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.emailContato && errors.emailContato ? errors.emailContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                                style={{ color: '#ffffff' }}
                                raisedLabel={values.emailContato ? true : false}
                            />
                            <Input
                                key={`msgContato-${key}`}
                                label='Mensagem'
                                name='msgContato'
                                onBlur={handleBlur}
                                value={values.msgContato}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.msgContato && errors.msgContato ? errors.msgContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                                style={{ color: '#ffffff' }}
                                raisedLabel={values.msgContato ? true : false}
                            />
                            <Button
                                type={'button'}
                                label={'Enviar'}
                                onClick={handleSubmit}
                                style={{ margin: '15px 0px' }}
                            />
                            {submitForm === undefined ? null :
                                submitForm ? (
                                    <Alert severity="success"
                                        style={{
                                            position: 'absolute',
                                            width: '25rem'
                                        }}
                                    >
                                        <AlertTitle>
                                            <strong>Sucesso</strong>
                                        </AlertTitle>
                                        Mensagem enviada com <strong>Sucesso!</strong>
                                    </Alert>
                                ) : (
                                    <Alert severity="error"
                                        style={{
                                            position: 'absolute',
                                            width: '25rem'
                                        }}
                                    >
                                        <AlertTitle>
                                            <strong>Erro</strong>
                                        </AlertTitle>
                                        Erro ao Enviar mensagem. <strong>Tente novamente</strong>
                                    </Alert>
                                )
                            }
                        </ContainerBox>
                    </ContainerContato>
                </ContainerAll>
            </Box>
        </>
    )
}