import 'chart.js/auto'
import moment from "moment";
import { db } from "../../../firebase";
import { useState, useEffect } from "react";
import ComprasModel from "../../../Pages/admin/compras/model/compras";
import { collection, CollectionReference, getDocs } from "firebase/firestore";


export default function ChartBarHorizontal() {
    const [compras, setCompras] = useState<ComprasModel[]>([])
    const _collectioncompras = collection(db, 'Compras') as CollectionReference<ComprasModel>;

    //buscar dados no banco 
    useEffect(() => {
        const getcompras = async () => {
            const data = await getDocs<ComprasModel>(_collectioncompras);
            setCompras(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        getcompras();
    }, []);

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
    const dadosPorMes = mesesDesejados.map(mes => filtrarDadosPorMes(compras, mes));

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