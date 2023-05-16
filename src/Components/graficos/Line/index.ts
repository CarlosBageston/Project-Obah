import { collection, CollectionReference, getDocs } from "firebase/firestore";
import moment from "moment";
import { useState, useEffect, useRef } from "react";
import { EntregaModel } from "../../../Pages/admin/entregas/model/entrega";
import { db } from "../../../firebase";
import 'chart.js/auto'


export default function ChartLine() {
    const [entregas, setEntregas] = useState<EntregaModel[]>([])
    const _collectionEntregas = collection(db, 'Entregas') as CollectionReference<EntregaModel>;
    const ref = useRef();
    //buscar dados no banco 
    useEffect(() => {
        const getEntregas = async () => {
            const data = await getDocs<EntregaModel>(_collectionEntregas);
            setEntregas(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
        };
        getEntregas()
    }, []);

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
            const valorEntrega = item.vlEntrega ? Number(item.vlEntrega.match(/\d+/g)?.join('.')) : 0;
            return total + valorEntrega;
        }, 0);
        
        const valorLucro = dadosFiltrado.reduce((total, item) => {
            const valueLucro = item.vlLucro ? Number(item.vlLucro.match(/\d+/g)?.join('.')) : 0;
            return total + valueLucro;
        }, 0)
        return {
            mes,
            quantidade,
            valorTotal,
            valorLucro
        }
    };
    const dadosPorMes = mesesDoAno.map(mes => filtrarDados(entregas, mes));

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