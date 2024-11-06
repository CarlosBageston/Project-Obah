import moment from "moment";
import { EntregaModel } from "../Pages/admin/entregas/model/entrega";
import VendaModel from "../Pages/admin/vendas/model/vendas";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useTableKeys } from "./tableKey";


export default function useDeleteOldData(){
   
    //TODO: adicionar lógica para deletar Compras Antigas
    const tableKeys = useTableKeys();

    function deleteVendas(dataTableVenda: VendaModel[]) {
        if (!dataTableVenda) return;
        const currentDate = moment();

        const filteredVendas = dataTableVenda.filter(venda => {
            const vendaDate = moment(venda.dtProduto, 'DD/MM/YYYY');
            const differenceInDays = currentDate.diff(vendaDate, 'days');
            return differenceInDays >= 30;
        });
        filteredVendas.forEach(async (item) => {
            const refID: string = item.id ?? '';
            await deleteDoc(doc(db, tableKeys.Vendas, refID))
        })
    }

    function deleteEntregas(dataTableEstoque: EntregaModel[]) {
        if (!dataTableEstoque) return; 
        const currentDate = moment();

        const filteredEntregas = dataTableEstoque.filter(venda => {
            const entregaDate = moment(venda.dtEntrega, 'DD/MM/YYYY');
            const differenceInDays = currentDate.diff(entregaDate, 'days');
            return differenceInDays >= 30;
        });

        filteredEntregas.forEach(async (item) => {
            const refID: string = item.id ?? '';
            await deleteDoc(doc(db, tableKeys.Entregas, refID))
        })
    }

    return { deleteVendas, deleteEntregas };

}