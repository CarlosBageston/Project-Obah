import { SHA256 } from 'crypto-js';
import { Button } from "../../login/style";
import { Bar, Line } from "react-chartjs-2";
import GetData from "../../../firebase/getData";
import ChartLine from "../../../Components/graficos/Line";
import ChartBarVertical from "../../../Components/graficos/BarVertical";
import ChartBarHorizontal from "../../../Components/graficos/BarHorizontal";
import React, { useEffect, useRef, useState } from 'react'
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
import { generateReport } from '../../../hooks/report-excel';
import { useFormik } from 'formik';
import DashboardModel from './model/dashboard';


function Dashboard() {

    const { dataVertical, optionsVertical, dadosPorMesVertical } = ChartBarVertical();
    const { dataLine, optionsLine, ref, dadosPorMes } = ChartLine();
    const { dataHorizontal, optionsHotizontal } = ChartBarHorizontal()
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const [freeScreen, setFreeScreen] = useState<boolean>(false);
    const refInput = useRef<HTMLInputElement>(null);
    const initialValues: DashboardModel = {
        error: '',
        password: '',
        somaAnual: null,
        somaLucroAnual: null,
        somaTotalEntregas: null,
        somaTotalVendas: null
    }
    const {
        dataTable
    } = GetData('Dashboard', true);

    const { values, setFieldValue } = useFormik<DashboardModel>({
        initialValues,
        onSubmit: () => { },
    });

    function formattedMoeda(data: number): string {
        return data.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function sumValue() {
        //soma do valor total de todas as entregas do ano
        const totalEntregas = dadosPorMes.map(entregas => entregas.valorTotal).reduce((total, item) => total + item);
        const totalVendas = dadosPorMesVertical.map(vendas => vendas.valorTotal).reduce((total, item) => total + item);

        //soma do valor Lucro de todas as entregas do ano
        const lucroEntregas = dadosPorMes.map(entregas => entregas.valorLucro).reduce((lucro, item) => lucro + item)

        //soma do valor Lucro de todas as vendas do ano
        const lucroVendas = dadosPorMesVertical.map(vendas => vendas.valorLucro).reduce((lucro, item) => lucro + item)

        //somando todas as vendas e entregas do ano
        const somaLucroAnual = lucroEntregas + lucroVendas

        //somando todas as vendas e entregas do ano
        const somaAnual = totalVendas + totalEntregas

        setFieldValue('somaTotalEntregas', formattedMoeda(totalEntregas));
        setFieldValue('somaTotalVendas', formattedMoeda(totalVendas));
        setFieldValue('somaLucroAnual', formattedMoeda(somaLucroAnual));
        setFieldValue('somaAnual', formattedMoeda(somaAnual));
    }

    function getDataReport() {
        if (values.somaTotalEntregas && values.somaTotalVendas)
            generateReport(values.somaTotalEntregas, values.somaTotalVendas);
    }


    const togglePadlock = () => {
        setIsLocked(false);
    };

    function authenticateDashboard() {
        let rightPassword = null;

        for (const data of dataTable) {
            rightPassword = data.acesso.password;
        }

        if (rightPassword) {
            const hash = SHA256(values.password).toString();
            if (hash === rightPassword) {
                setFreeScreen(true);
                setFieldValue('password', '');
                setFieldValue('error', '');
                sumValue()
            } else {
                setFieldValue('error', 'Acesso Negado')
            }
        }
    }

    function onKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.code === "Enter" || e.code === "NumpadEnter") {
            authenticateDashboard()
        }
    }
    useEffect(() => {
        if (!isLocked && refInput.current) {
            refInput.current.focus();
        }
    }, [isLocked]);
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
                    <StyledGiPadlock isLocked={isLocked} />
                    <ContainerPassword isLocked={isLocked}>
                        <TitlePassword>Digite a senha para desbloquear as informações</TitlePassword>
                        <Input
                            onKeyDown={onKeyPress}
                            type="password"
                            id="password"
                            name="password"
                            placeholder='Senha'
                            value={values.password}
                            ref={refInput}
                            onChange={e => { setFieldValue('password', e.target.value) }}
                        />
                        <Error>{values.error}</Error>
                        <Button
                            onClick={authenticateDashboard}
                        >
                            Acessar
                            <div className="arrow-wrapper">
                                <div className="arrow"></div>
                            </div>
                        </Button>

                    </ContainerPassword>
                </BlockedInformation>
                <ContainerGrafic>
                    <DivGraficHortizontal>
                        <Bar data={freeScreen ? dataHorizontal : { labels: [''], datasets: [] }} options={optionsHotizontal} style={{ width: '100%', height: '100%' }} />
                    </DivGraficHortizontal>
                    <ContainerTwoGrafic>
                        <DivGraficLine>
                            <Line data={freeScreen ? dataLine : { labels: [''], datasets: [] }} options={optionsLine} ref={ref} style={{ width: '100%', height: '100%' }} />
                        </DivGraficLine>
                        <DivGraficVertical >
                            <Bar data={freeScreen ? dataVertical : { labels: [''], datasets: [] }} options={optionsVertical} style={{ width: '100%', height: '100%' }} />
                        </DivGraficVertical>
                    </ContainerTwoGrafic>
                </ContainerGrafic>
                <ContainerResult>
                    <Button onClick={() => getDataReport()}>
                        Gerar Relatório Mensal
                    </Button>
                    <DivResult>
                        <TextResult>Ganho anual</TextResult>
                        <SumResult>{freeScreen && values.somaAnual ? `${values.somaAnual}` : 'R$ 0,00'}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                    <DivResult>
                        <TextResult>Lucro anual</TextResult>
                        <SumResult>{freeScreen && values.somaLucroAnual ? `${values.somaLucroAnual}` : 'R$ 0,00'}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                </ContainerResult>
            </Container>
        </Box>
    )
}

export default Dashboard;