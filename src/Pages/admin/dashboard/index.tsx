import { SHA256 } from 'crypto-js';
import { Button } from "../../login/style";
import { Bar, Line } from "react-chartjs-2";
import GetData from "../../../firebase/getData";
import { TableKey } from '../../../types/tableName';
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
import { useFormik } from 'formik';
import DashboardModel from './model/dashboard';
import { generateReport } from '../../../hooks/report-excel';
import useFormatCurrency from '../../../hooks/formatCurrency';


function Dashboard() {
    const [freeScreen, setFreeScreen] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(true);
    const refInput = useRef<HTMLInputElement>(null);
    const { dataVertical, optionsVertical, vlLucro: vlLucroVertical, vlTotal: vlTotalVertical } = ChartBarVertical(freeScreen);
    const { dataLine, optionsLine, ref, vlLucro: vlLucroLine, vlTotal: vlTotalLine } = ChartLine(freeScreen);
    const { dataHorizontal, optionsHotizontal } = ChartBarHorizontal(freeScreen)

    const initialValues: DashboardModel = {
        error: '',
        password: '',
        somaAnual: null,
        somaLucroAnual: null,
    }
    const {
        dataTable
    } = GetData(TableKey.Dashboard, true);
    const { NumberFormatForBrazilianCurrency } = useFormatCurrency()

    const { values, setFieldValue } = useFormik<DashboardModel>({
        initialValues,
        onSubmit: () => { },
    });

    function getDataReport() {
        generateReport(vlTotalLine, vlTotalVertical);
    }
    useEffect(() => {
        if (vlLucroLine && vlLucroVertical && vlTotalLine && vlTotalVertical) {
            setFieldValue('somaAnual', vlTotalLine + vlTotalVertical);
            setFieldValue('somaLucroAnual', vlLucroLine + vlLucroVertical);
        }
    }, [vlLucroLine, vlLucroVertical, vlTotalLine, vlTotalVertical])

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
                        <SumResult>{freeScreen && values.somaAnual ? `${NumberFormatForBrazilianCurrency(values.somaAnual)}` : 'R$ 0,00'}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                    <DivResult>
                        <TextResult>Lucro anual</TextResult>
                        <SumResult>{freeScreen && values.somaLucroAnual ? `${NumberFormatForBrazilianCurrency(values.somaLucroAnual)}` : 'R$ 0,00'}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                </ContainerResult>
            </Container>
        </Box>
    )
}

export default Dashboard;