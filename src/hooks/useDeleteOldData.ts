import moment from "moment";
import { EntregaModel } from "../Pages/admin/entregas/model/entrega";
import { deleteDoc, doc, where } from "firebase/firestore";
import { db } from "../firebase";
import { useTableKeys } from "./tableKey";
import { getItemsByQuery } from "./queryFirebase";
import ComprasModel from "../Pages/admin/compras/model/compras";
import { useDispatch } from "react-redux";


export default function useDeleteOldData(){
   
    const tableKeys = useTableKeys();
    const dispatch = useDispatch();
    const newDate = moment().subtract(45, 'days');
    const newDateFormatted = newDate.format('YYYY/MM/DD');

    async function deleteCompras() {
        const res = await getItemsByQuery<ComprasModel>(tableKeys.Compras, [where('dtCompra', '<', newDateFormatted)], dispatch);
        res.data.forEach(async (item) => {
            await deleteDoc(doc(db, tableKeys.Compras, item.id ?? ''))
        })
    }    

    async function deleteEntregas() {
        const res = await getItemsByQuery<EntregaModel>(tableKeys.Entregas, [where('dtEntrega', '<', newDateFormatted)], dispatch);
        res.data.forEach(async (item) => {
            await deleteDoc(doc(db, tableKeys.Entregas, item.id ?? ''))
        })
    }

    return { deleteEntregas, deleteCompras };

}