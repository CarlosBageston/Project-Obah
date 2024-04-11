import 'chart.js/auto'
import TelaDashboard from '../../../enumeration/telaDashboard';
import useDadosPorMesDashboard from "../../../hooks/useDadosPorMesDashboard";

/**
 * ChartBarVertical Component
 * 
 * Este componente exibe um gráfico de barras verticais que representa a quantidade, valor total e valor de lucro das vendas por mês.
 * Os dados são buscados no banco de dados e filtrados por mês.
 * O gráfico é configurado com opções personalizadas, como posicionamento da legenda, título e dicas de ferramenta.
 * Os dados são exibidos com rótulos de mês e valores de quantidade.
 * 
 * @returns Retorna um objeto contendo os dados do gráfico (dataVertical), as opções de configuração (optionsVertical) e os dados por mês (dadosPorMesVertical).
 */
export default function ChartBarVertical(freeScreen: boolean) {
    
    const { dadosPorMes, vlLucro, vlTotal } = useDadosPorMesDashboard(TelaDashboard.VENDA, freeScreen)

    const optionsVertical = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: '#fff'
                }
            },
            title: {
                display: true,
                text: 'Grafico de vendas',
                color: '#fff'
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const venda = dadosPorMes[context.dataIndex];
                        return [`Quantidade: ${venda.quantidade}`, `Valor Total: R$ ${venda.valorTotal.toFixed(2)}`];
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
                display: false
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

    const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dataVertical = {
        labels,
        datasets: [
            {
                label: 'Quantidade',
                data: dadosPorMes.map(venda => venda.quantidade),
                backgroundColor: '#165BAA',
            },
        ],
    };

    return{
        dataVertical,
        optionsVertical,
        vlLucro, 
        vlTotal,
        dadosPorMes
    }
}