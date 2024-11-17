import moment from "moment";
import { EntregaModel } from "../Pages/admin/entregas/model/entrega";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useTableKeys } from "./tableKey";


export default function useDeleteOldData(){
   
    //TODO: adicionar lógica para deletar Compras Antigas
    const tableKeys = useTableKeys();

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

    return { deleteEntregas };

}