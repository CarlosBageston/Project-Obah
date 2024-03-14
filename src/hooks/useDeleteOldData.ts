import moment from "moment";
import { EntregaModel } from "../Pages/admin/entregas/model/entrega";
import VendaModel from "../Pages/admin/vendas/model/vendas";
import GetData from "../firebase/getData";


export default function useDeleteOldData(){
    const {
        dataTable: dataTableEstoque,
    } = GetData('Entregas', true) as { dataTable: EntregaModel[] };
    const {
        dataTable: dataTableVenda,
    } = GetData('Vendas', true) as { dataTable: VendaModel[] };

    function deleteVendas(){
        const currentDate = moment();
    
        // Filtra as vendas com mais de 30 dias
        const filteredVendas = dataTableVenda.filter(venda => {
            const vendaDate = moment(venda.dtProduto, 'DD/MM/YYYY');
            const differenceInDays = currentDate.diff(vendaDate, 'days');
            return differenceInDays >= 30;
        });
    
        // Aqui, filteredVendas contém apenas as vendas com até 30 dias
        console.log(filteredVendas);
    }

    return {deleteVendas}

}