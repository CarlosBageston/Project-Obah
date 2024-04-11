import { useRef } from "react";
import 'chart.js/auto'
import TelaDashboard from '../../../enumeration/telaDashboard';
import useDadosPorMesDashboard from "../../../hooks/useDadosPorMesDashboard";

/**
 * ChartLine Component
 * 
 * Este componente exibe um gráfico de linha que representa a quantidade e o valor total das entregas por mês.
 * Os dados são buscados no banco de dados e filtrados por mês.
 * O gráfico é configurado com opções personalizadas, como posicionamento da legenda, título e dicas de ferramenta.
 * Os dados são exibidos com rótulos de mês e valores de quantidade.
 * 
 * @returns Retorna um objeto contendo os dados do gráfico (dataLine), as opções de configuração (optionsLine), uma referência (ref) e os dados por mês (dadosPorMes).
 */

export default function ChartLine(freeScreen: boolean) {
    const ref = useRef();
  
    const { dadosPorMes, vlLucro, vlTotal } = useDadosPorMesDashboard(TelaDashboard.ENTREGA, freeScreen)

    const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dataLine = {
        labels,
        datasets: [
            {
                label: 'Quantidade',
                data: dadosPorMes.map(venda => venda.quantidade),
                backgroundColor: '#F5DE0D',
                borderColor: 'rgba(255, 255, 255, 0.23)'
            },
        ],
    };

    const optionsLine = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#fff',
                }
            },
            title: {
                display: true,
                text: 'Grafico de Entregas',
                color: '#fff', 
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const venda = dadosPorMes[context.dataIndex];
                        return [`Quantidade: ${venda.quantidade}`, `Valor Total: R$ ${venda.valorTotal.toFixed(2)} `];
                    },
                },
            },
        },
        scales: {
        x: {
            beginAtZero: true,
            ticks: {
                font: {
                    weight: 'bold'
                },
                color: '#fff'
            },
            grid: {
                display: false,
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                font: {
                    weight: 'bold',
                },
                color: '#fff'
            },
            grid:{
                color: 'rgba(255, 255, 255, 0.13)'
            }
        },
    }
    };

    return {
        dataLine,
        optionsLine,
        ref,
        vlLucro, 
        vlTotal,
        dadosPorMes
    };
}