import { collection, CollectionReference, getDocs } from "firebase/firestore";
import moment from "moment";
import { useState, useEffect } from "react";
import ProdutoModel from "../../../Pages/admin/vendas/model/vendas";
import { db } from "../../../firebase";
import 'chart.js/auto'
import GetData from "../../../firebase/getData";


export default function ChartBarVertical() {
    const [recarregue, setRecarregue] = useState<boolean>(true);
    // const [vendas, setVendas] = useState<ProdutoModel[]>([])
    // const _collectionVendas = collection(db, 'Vendas') as CollectionReference<ProdutoModel>;

    // //buscar dados no banco 
    // useEffect(() => {
    //     const getVendas = async () => {
    //         const data = await getDocs<ProdutoModel>(_collectionVendas);
    //         setVendas(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    //     };
    //     getVendas();
    // }, []);

    //realizando busca no banco de dados
    const {
        dataTable: dataTableVendas,
    } = GetData('Vendas', recarregue) as { dataTable: ProdutoModel[] };

    //filtrando dados por data
    const mesesDesejados = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const filtrarDadosPorMes = (dados: ProdutoModel[], mes: number) => {
        const dadosFiltrado = dados.filter(item => {
            if (item.dtProduto === null) return false;
            const momentObj = moment(item.dtProduto, "DD/MM/YYYY HH:mm");
            const mesItem = momentObj.month() + 1;
            return mesItem === mes;
        });
        const quantidade = dadosFiltrado.length
        const valorTotal = dadosFiltrado.reduce((total, item) => total + item.vlTotal!, 0)
        const valorLucro = dadosFiltrado.reduce((total, item) => total + Number(item.vlLucroTotal), 0)
        return {
            mes,
            quantidade,
            valorTotal,
            valorLucro
        }
    };
    const dadosPorMesVertical = mesesDesejados.map(mes => filtrarDadosPorMes(dataTableVendas, mes));

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
                        const venda = dadosPorMesVertical[context.dataIndex];
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
                data: dadosPorMesVertical.map(venda => venda.quantidade),
                backgroundColor: '#165BAA',
            },
        ],
    };

    return{
        dataVertical,
        optionsVertical,
        dadosPorMesVertical
    }
}