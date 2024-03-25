import moment from "moment";
import GetData from "../firebase/getData";
import { useState, useEffect } from "react";
import { TableKey } from "../types/tableName";
import Dashboard from "../Pages/admin/dashboard/model/dashboardCompra";


export default function useDadosPorMesDashboard(tela: number, freeScreen: boolean) {
    const [dadosPorMes, setDadosPorMes] = useState<any[]>([])
    const [vlTotal, setVlTotal] = useState<number>(0)
    const [vlLucro, setVlLucro] = useState<number>(0)

    //realizando busca no banco de dados
    const {
        dataTable: dataTableVendas,
    } = GetData(TableKey.DadosDashboard, freeScreen) as { dataTable: Dashboard[] };
    
    const gerarMesesDesejados = () => {
        const meses = [];
        const anoAtual = moment().year();
        const quantidadeMeses = 12; 
    
        for (let i = 1; i <= quantidadeMeses; i++) {
            const mesFormatado = moment(`${i}/${anoAtual}`, "M/YYYY").format("MM/YYYY");
            meses.push(mesFormatado);
        }
    
        return meses;
    };
    
    const filtrarDadosPorMes = (dados: Dashboard[], mes: string) => {
        const dadosDoMes = dados.find(item => item.mes === mes && item.tela === tela);
        if (dadosDoMes) {
            const month = dadosDoMes.mes;
            const quantidade = dadosDoMes.nrTotal;
            const valorTotal = dadosDoMes.qntdTotal;
            const valorLucro = dadosDoMes.qntdLucro ? dadosDoMes.qntdLucro : 0;
            return { month, quantidade, valorTotal, valorLucro };
        } else {
            return { month: mes, quantidade: 0, qntdReais: 0 };
        }
    };
    useEffect(() => {
        if(dataTableVendas){
            const dadosPorMes = gerarMesesDesejados().map(mes => filtrarDadosPorMes(dataTableVendas, mes));
            setDadosPorMes(dadosPorMes)
            let soma = 0.0;
            let somaLucro = 0.0;
            dadosPorMes.forEach(mes => {
                soma += mes.valorTotal ? mes.valorTotal : 0
                somaLucro += mes.valorLucro ? mes.valorLucro : 0
            })
            setVlTotal(soma);
            setVlLucro(somaLucro);
        }
    },[dataTableVendas]);

    return {dadosPorMes, vlTotal, vlLucro}

}