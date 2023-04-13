import { Bar, Line } from "react-chartjs-2";
import ChartBarVertical from "../../../Components/graficos/BarVertical";
import ChartLine from "../../../Components/graficos/Line";
import ChartBarHorizontal from "../../../Components/graficos/BarHorizontal";
import {
    Box,
    ContainerGrafic,
    ContainerTwoGrafic,
    Container,
    ContainerResult,
    DivResult,
    TextResult,
    Paragraph,
    SumResult,
    DivGraficHortizontal,
    DivGraficVertical,
    DivGraficLine,
    Title
} from './style'

export default function Dashboard() {

    const { dataVertical, optionsVertical, dadosPorMesVertical } = ChartBarVertical();
    const { dataLine, optionsLine, ref, dadosPorMes } = ChartLine();
    const { dataHorizontal, optionsHotizontal } = ChartBarHorizontal()


    //soma de todas as entregas do ano
    const totalEntregas = dadosPorMes.map(entregas => entregas.valorTotal)
    const somaTotalEntregas = totalEntregas.reduce((total, item) => total + item)

    //soma de todas as vendas do ano
    const totalVendas = dadosPorMesVertical.map(vendas => vendas.valorTotal)
    const somaTotalVendas = totalVendas.reduce((total, item) => total + item)

    //somando todas as vendas e entregas do ano
    const somaAnual = somaTotalVendas + somaTotalEntregas
    return (
        <Box>
            <Title>Dashboard Sorveteria Obah!</Title>
            <Container>
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
                        <SumResult>R$ {somaAnual}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                    <DivResult>
                        <TextResult>Lucro anual</TextResult>
                        <SumResult>R$ {somaAnual}</SumResult>
                        <Paragraph>Soma de todas as vendas no decorrer do ano</Paragraph>
                    </DivResult>
                </ContainerResult>
            </Container>
        </Box>
    )
}