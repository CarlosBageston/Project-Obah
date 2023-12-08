import moment from "moment";
import { useRef } from "react";
import { EntregaModel } from "../../../Pages/admin/entregas/model/entrega";
import 'chart.js/auto'
import GetData from "../../../firebase/getData";

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

export default function ChartLine() {
    const ref = useRef();
  
    const {
        dataTable: dataTableEntrega,
    } = GetData('Entregas', true) as { dataTable: EntregaModel[] };
    
    //filtrando dados por data
    const mesesDoAno = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const filtrarDados = (dados: EntregaModel[], mes: number) => {
        const dadosFiltrado = dados.filter(item => {
            if (item.dtEntrega === null) return false;
            const momentObj = moment(item.dtEntrega, "DD/MM/YYYY HH:mm");
            const mesItem = momentObj.month() + 1;
            return mesItem === mes;
        });
        const quantidade = dadosFiltrado.length
        const valorTotal = dadosFiltrado.reduce((total, item) => {
           const valorEntrega = item.vlEntrega ? parseFloat(item.vlEntrega.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
            return total + valorEntrega;
        }, 0);
        
        const valorLucro = dadosFiltrado.reduce((total, item) => {
            const valueLucro = item.vlEntrega ? parseFloat(item.vlLucro.replace(/[^\d,]/g, '').replace(',', '.')) : 0;
            return total + valueLucro;
        }, 0)
        return {
            mes,
            quantidade,
            valorTotal,
            valorLucro
        }
    };
    const dadosPorMes = mesesDoAno.map(mes => filtrarDados(dataTableEntrega, mes));

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
        dadosPorMes
    };
}