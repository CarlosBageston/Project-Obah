import moment from "moment";
import { db } from "../firebase";
import GetData from "../firebase/getData";
import { Dispatch, SetStateAction } from "react";
import TelaDashboard from "../enumeration/telaDashboard";
import Dashboard from "../Pages/admin/dashboard/model/dashboardCompra";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { useTableKeys } from "./tableKey";

// Função para calcular o valor total e atualizar o painel
async function updateDashboard(
    qntdTotal: number,
    date: Date | null,
    tela: number,
    dataTableDashboard: Dashboard[],
    setRecarregueDashboard: Dispatch<SetStateAction<boolean>>,
    tableKeys: Record<string, string>,
    qntdLucro?: number,
) {

    const mesAtual = moment(date, "DD/MM/YYYY").format("MM/YYYY");
    const existingMonth = dataTableDashboard.find(
        (compraMes) =>
        compraMes.mes ===  mesAtual &&
        compraMes.tela === tela
    );
    const sumValue: number = existingMonth ? existingMonth.qntdTotal + qntdTotal : qntdTotal;
    const sumValueLucro: number = existingMonth && existingMonth.qntdLucro && qntdLucro
    ? existingMonth.qntdLucro + qntdLucro : 0;

    const refID: string = existingMonth ? existingMonth.id ?? "" : '';
    const refTable = existingMonth ? doc(db, tableKeys.DadosDashboard, refID) : null;

  const dataToUpdate = existingMonth
    ? {
        nrTotal: existingMonth.nrTotal + 1,
        qntdTotal: parseFloat(sumValue.toFixed(2)),
        ...(tela !== TelaDashboard.COMPRA && { qntdLucro: parseFloat(sumValueLucro.toFixed(2)) }),
      }
    : {
        tela,
        qntdTotal,
        qntdLucro: qntdLucro ? qntdLucro : 0,
        mes: mesAtual,
        nrTotal: 1,
      };

    await (existingMonth && refTable ? updateDoc(refTable, dataToUpdate) : addDoc(collection(db, tableKeys.DadosDashboard), dataToUpdate));
    setRecarregueDashboard(false);
}

// Função principal
export function useCalculateValueDashboard(recarregueDashboard: boolean, setRecarregueDashboard: Dispatch<SetStateAction<boolean>>) {
    const tableKeys = useTableKeys();
    const {
        dataTable: dataTableDashboard,
    } = GetData(tableKeys.DadosDashboard, recarregueDashboard) as { dataTable: Dashboard[] };

    return {
        calculateValueDashboard: async (qntdTotal: number, date: Date | null, tela: number, qntdLucro?: number) => {
            await updateDashboard(qntdTotal, date, tela, dataTableDashboard, setRecarregueDashboard, tableKeys, qntdLucro);
        },
    };
}