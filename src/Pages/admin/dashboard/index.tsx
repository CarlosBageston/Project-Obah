import { Bar, Line } from "react-chartjs-2";
import ChartLine from "../../../Components/graficos/Line";
import ChartBarVertical from "../../../Components/graficos/BarVertical";
import ChartBarHorizontal from "../../../Components/graficos/BarHorizontal";
import {
    Box,
    Title,
    DivResult,
    Paragraph,
    SumResult,
    Container,
    TextResult,
    DivGraficLine,
    ContainerResult,
    ContainerGrafic,
    DivGraficVertical,
    ContainerTwoGrafic,
    DivGraficHortizontal,
} from './style'

export default function Dashboard() {

    const { dataVertical, optionsVertical, dadosPorMesVertical } = ChartBarVertical();
    const { dataLine, optionsLine, ref, dadosPorMes } = ChartLine();
    const { dataHorizontal, optionsHotizontal } = ChartBarHorizontal()


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
    return (
        <Box>
            <div>
                <Title>Dashboard Sorveteria Obah!</Title>
            </div>
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