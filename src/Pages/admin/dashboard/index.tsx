import { SHA256 } from 'crypto-js';
import { Button } from "../../login/style";
import { Bar, Line } from "react-chartjs-2";
import GetData from "../../../firebase/getData";
import ChartLine from "../../../Components/graficos/Line";
import ChartBarVertical from "../../../Components/graficos/BarVertical";
import ChartBarHorizontal from "../../../Components/graficos/BarHorizontal";
import { useState } from 'react'
import {
    Box,
    Title,
    Input,
    Error,
    DivResult,
    Paragraph,
    SumResult,
    Container,
    TextResult,
    TitlePassword,
    DivGraficLine,
    ContainerResult,
    ContainerGrafic,
    StyledGiPadlock,
    DivGraficVertical,
    ContainerPassword,
    ContainerTwoGrafic,
    BlockedInformation,
    DivGraficHortizontal,
    DivPadLock,
    StyledGiPadlockInternal,
} from './style'


export default function Dashboard() {

    const { dataVertical, optionsVertical, dadosPorMesVertical } = ChartBarVertical();
    const { dataLine, optionsLine, ref, dadosPorMes } = ChartLine();
    const { dataHorizontal, optionsHotizontal } = ChartBarHorizontal()
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [freeScreen, setFreeScreen] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const {
        dataTable
    } = GetData('Dashboard', true);


    //soma do valor total de todas as entregas do ano
    const totalEntregas = dadosPorMes.map(entregas => entregas.valorTotal)
    const somaTotalEntregas = totalEntregas.reduce((total, item) => total + item)

    //soma do valor total de todas as vendas do ano
    const totalVendas = dadosPorMesVertical.map(vendas => vendas.valorTotal)
    const somaTotalVendas = totalVendas.reduce((total, item) => total + item)
    //soma do valor Lucro de todas as entregas do ano
    const lucroEntregas = dadosPorMes.map(entregas => entregas.valorLucro)
    const somaLucroEntregas = lucroEntregas.reduce((lucro, item) => lucro + item)

    //soma do valor Lucro de todas as vendas do ano
    const lucroVendas = dadosPorMesVertical.map(vendas => vendas.valorLucro)
    const somaLucroVendas = lucroVendas.reduce((lucro, item) => lucro + item)

    //somando todas as vendas e entregas do ano
    const somaLucroAnual = somaLucroVendas + somaLucroEntregas

    //somando todas as vendas e entregas do ano
    const somaAnual = somaTotalVendas + somaTotalEntregas

    const togglePadlock = () => {
        setIsLocked(false);
    };

    function authenticateDashboard() {
        let rightPassword = null;

        for (const data of dataTable) {
            rightPassword = data.acesso.password;
        }

        if (rightPassword) {
            const hash = SHA256(password).toString();
            if (hash === rightPassword) { setFreeScreen(true); setPassword(''); setError('') }
            else setError('Acesso Negado')
        }
    }

    return (
        <Box>
            <div>
                <Title>Dashboard Sorveteria Obah!</Title>
            </div>
            <DivPadLock>
                <StyledGiPadlockInternal onClick={() => { setFreeScreen(false); setIsLocked(true) }} />
            </DivPadLock>
            <Container>
                <BlockedInformation isVisible={freeScreen} onClick={togglePadlock}>
                    {isLocked ? (
                        <StyledGiPadlock />
                    ) : (
                        <>
                            <ContainerPassword>
                                <TitlePassword>Digite a senha para desbloquear as informações</TitlePassword>
                                <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    placeholder='Senha'
                                    value={password}
                                    onChange={e => { setPassword(e.target.value) }}
                                />
                                <Error>{error}</Error>
                                <Button
                                    onClick={authenticateDashboard}
                                >
                                    Acessar
                                    <div className="arrow-wrapper">
                                        <div className="arrow"></div>
                                    </div>
                                </Button>

                            </ContainerPassword>
                        </>
                    )}
                </BlockedInformation>
                <ContainerGrafic>
                    <DivGraficHortizontal>
                        <Bar data={dataHorizontal} options={optionsHotizontal} style={{ width: '100%', height: '100%' }} />
                    </DivGraficHortizontal>
                    <ContainerTwoGrafic>
                        <DivGraficLine>
                            <Line data={dataLine} options={optionsLine} ref={ref} style={{ width: '100%', height: '100%' }} />
                        </DivGraficLine>
                        <DivGraficVertical >
                            <Bar data={dataVertical} options={optionsVertical} style={{ width: '100%', height: '100%' }} />
                        </DivGraficVertical>
                    </ContainerTwoGrafic>
                </ContainerGrafic>
                <ContainerResult>
                    <DivResult>
                        <TextResult>Ganho anual</TextResult>
                        <SumResult>R$ {somaAnual.toFixed(2)}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                    <DivResult>
                        <TextResult>Lucro anual</TextResult>
                        <SumResult>R$ {somaLucroAnual.toFixed(2)}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                </ContainerResult>
            </Container>
        </Box>
    )
}