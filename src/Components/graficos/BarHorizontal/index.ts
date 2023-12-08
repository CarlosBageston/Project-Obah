import 'chart.js/auto'
import moment from "moment";
import ComprasModel from "../../../Pages/admin/compras/model/compras";
import GetData from '../../../firebase/getData';

/**
 * ChartBarHorizontal Component
 * 
 * Este componente exibe um gráfico de barras horizontais que representa a quantidade e valor total de compras por mês.
 * Os dados são buscados no banco de dados e filtrados por mês.
 * O gráfico é configurado com opções personalizadas, como posicionamento da legenda, título e dicas de ferramenta.
 * Os dados são exibidos com rótulos de mês e valores de quantidade.
 * 
 * @returns Retorna um objeto contendo os dados do gráfico (dataHorizontal) e as opções de configuração (optionsHotizontal).
 */
export default function ChartBarHorizontal() {
    
    //realizando busca no banco de dados
    const {
        dataTable: dataTableVendas,
    } = GetData('Compras', true) as { dataTable: ComprasModel[] };
    console.log('renderizo')
    //filtrando dados por data
    const mesesDesejados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const filtrarDadosPorMes = (dados: ComprasModel[], mes: number) => {
        const dadosFiltrado = dados.filter(item => {
            if (item.dtCompra === null) return false;
            const momentObj = moment(item.dtCompra, "DD/MM/YYYY HH:mm");
            const mesItem = momentObj.month() + 1;
            return mesItem === mes;
        });
        const quantidade = dadosFiltrado.length
         const valorTotal = dadosFiltrado.reduce((total, item) => {
            const valorEntrega = item.vlUnitario ? Number(item.vlUnitario.match(/\d+/g)?.join('.')) : 0;
            return total + valorEntrega;
        }, 0);
        return {
            mes,
            quantidade,
            valorTotal
        }
    };
    const dadosPorMes = mesesDesejados.map(mes => filtrarDadosPorMes(dataTableVendas, mes));

    const optionsHotizontal = {
        indexAxis: 'y' as const,
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
                text: 'Grafico de Compras',
                color: '#fff',
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
        y: {
            beginAtZero: true,
            ticks: {
                font: {
                    weight: 'bold',
                },
                color: '#fff'
            },
            grid: {
                display: false
            }
        },
        x: {
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
    },
    };

    const labels = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const dataHorizontal = {
        labels,
        datasets: [
            {
                label: 'Quantidade',
                data: dadosPorMes.map(venda => venda.quantidade),
                backgroundColor: '#1DDD8D',
            },
        ],
    };

    return{
        dataHorizontal,
        optionsHotizontal
    }
}