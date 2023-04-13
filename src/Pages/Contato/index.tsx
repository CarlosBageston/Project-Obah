import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useState } from 'react';
import Input from '../../Components/input';
import Button from '../../Components/button';
import ContatoModel from './model/contato';
import formatPhone from '../../Components/masks/maskTelefone';

//Import Imagens/Icons
import detalhe from '../../assets/Image/detalhe.png';
import iconFacebook from '../../assets/Icon/facebook-icon.png';
import iconwhatsapp from '../../assets/Icon/whatsapp-icon.png';
import iconinstagram from '../../assets/Icon/instagram-icon.png';

//import do styled components
import {
    Box,
    ContainerBox,
    Imagem,
    ContainerAll,
    ContainerContato,
    ContainerTitle,
    Title,
    SubTitleBox,
    TitleBox,
    ContainerIcons,
    Ancora,
    Container,
    EnterButton,
    InputStyle,
    InputBox,
    Label,
    SignupLink,
    Card
} from './style';
import Menu from '../../Components/Menu/Menu';



export default function Contato() {

    const [initialValues, setInitialValues] = useState<ContatoModel>({
        msgContato: '',
        nmContato: '',
        tfContato: '',
        emailContato: ''
    });


    const { values, errors, touched, handleBlur, handleSubmit, setFieldValue } = useFormik<ContatoModel>({
        validateOnBlur: true,
        validateOnChange: true,
        initialValues,
        validationSchema: Yup.object().shape({
            msgContato: Yup.string().required('Campo obrigatório'),
            nmContato: Yup.string().required('Campo obrigatório'),
            tfContato: Yup.string().required('Campo obrigatório'),
            emailContato: Yup.string().email('E-mail invalido').optional().nullable()
        }),
        onSubmit: () => console.log('deu boa'),
    });


    return (
        <>
            <Menu />
            <Box>
                <Imagem />
                <ContainerAll>

                    <ContainerTitle>
                        <img src={detalhe} alt="Sorvete" width={250} />
                        <Title>Fale Conosco</Title>
                    </ContainerTitle>
                    <ContainerContato>
                        <ContainerBox>
                            <TitleBox>Nos acompanhe</TitleBox>
                            <SubTitleBox>nas redes sociais</SubTitleBox>
                            <ContainerIcons>
                                <div>
                                    <Ancora
                                        href="https://www.instagram.com/marbellasorvetes/">
                                        <img src={iconinstagram} alt="instagram" width={50} />
                                        @sorveteObah!
                                    </Ancora>
                                </div>
                                <div>

                                    <Ancora
                                        href="https://www.facebook.com/marbella.sorvetes">
                                        <img src={iconFacebook} alt="facebook" width={50} />
                                        SorveteriaObah!
                                    </Ancora>
                                </div>
                                <div>
                                    <Ancora
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
                                label='Nome'
                                name='nmContato'
                                onBlur={handleBlur}
                                value={values.nmContato}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.nmContato && errors.nmContato ? errors.nmContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                            />
                            <Input
                                maxLength={12}
                                label='Telefone'
                                name='tfContato'
                                onBlur={handleBlur}
                                value={formatPhone(values.tfContato)}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.tfContato && errors.tfContato ? errors.tfContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                            />
                            <Input
                                label='Email'
                                name='emailContato'
                                onBlur={handleBlur}
                                value={values.emailContato}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.emailContato && errors.emailContato ? errors.emailContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                            />
                            <Input
                                label='Mensagem'
                                name='msgContato'
                                onBlur={handleBlur}
                                value={values.msgContato}
                                onChange={e => setFieldValue(e.target.name, e.target.value)}
                                error={touched.msgContato && errors.msgContato ? errors.msgContato : ''}
                                styleLabel={{ color: '#FFFFFF' }}
                            />

                            <Button
                                fontSize={16}
                                primary={false}
                                type={'button'}
                                children={'Enviar'}
                                onClick={handleSubmit}
                                style={{ margin: '15px 0px' }}
                            />
                        </ContainerBox>
                        <Container>
                            <Card>
                                <SignupLink>Entre em contato</SignupLink>
                                <SignupLink>faça seu pedido ou deixe seu feedback</SignupLink>
                                <InputBox>
                                    <InputStyle type="text" required />
                                    <Label>Email</Label>
                                </InputBox>

                                <InputBox>
                                    <InputStyle type="text" required />
                                    <Label>Username</Label>
                                </InputBox>

                                {/* <InputBox>
                                    <Input
                                        label=''
                                        name='msgContato'
                                        onBlur={handleBlur}
                                        value={values.msgContato}
                                        onChange={e => setFieldValue(e.target.name, e.target.value)}
                                        error={touched.msgContato && errors.msgContato ? errors.msgContato : ''}
                                        styleLabel={{ color: '#FFFFFF' }}
                                    />
                                    <Label>Mensagem</Label>
                                </InputBox> */}

                                <EnterButton>Enter</EnterButton>
                            </Card>
                        </Container>
                    </ContainerContato>
                </ContainerAll>
            </Box>
        </>
    )
}