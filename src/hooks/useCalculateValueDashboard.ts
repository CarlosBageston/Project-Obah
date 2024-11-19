import moment from "moment";
import { db } from "../firebase";
import { addDoc, collection, doc, updateDoc, where, writeBatch } from "firebase/firestore";
import { getSingleItemByQuery } from "./queryFirebase";
import { Dispatch } from "@reduxjs/toolkit";
import { SubProdutoModel } from "../Pages/admin/cadastroProdutos/model/subprodutos";

export interface DashboardCompraModel{
    id?: string
    nmProduto: string
    dtProdutoAuxiliar?: string[],
    dtProduto?: string,
    vlTotal?: number
    qntdTotal?: number
    totalMensal?: TotalMensal[]
}
interface TotalMensal {
    dtProduto: string
    vlTotal?: number
    qntdTotal?: number
}

export async function updateAddDashboardCompra(
    values: DashboardCompraModel,
    collectionName: string,
    dispatch: Dispatch
) {
    const dtCompraFormatted = moment(values.dtProduto, "DD/MM/YYYY").format("YYYY/MM");

    const compra = await getSingleItemByQuery<DashboardCompraModel>(collectionName, [where('nmProduto', '==', values.nmProduto)], dispatch);
    const totalMensal: TotalMensal = {
            vlTotal: values.vlTotal,
            dtProduto: dtCompraFormatted,
            qntdTotal: values.qntdTotal
        }
    
    if (compra) {
        const refID: string = compra.id ?? '';
        const refTable = doc(db, collectionName, refID);
        const dtProdutoAuxiliarUpdated = compra.dtProdutoAuxiliar 
        ? (compra.dtProdutoAuxiliar.includes(dtCompraFormatted) 
            ? compra.dtProdutoAuxiliar 
            : [...compra.dtProdutoAuxiliar, dtCompraFormatted])
        : [dtCompraFormatted];

        const updatedData = {
            nmProduto: values.nmProduto,
            dtProdutoAuxiliar: dtProdutoAuxiliarUpdated,
            totalMensal: compra.totalMensal ? [...compra.totalMensal, totalMensal] : [totalMensal]
        };
        await updateDoc(refTable, updatedData);
    } else {
        const refTable = collection(db, collectionName);
        const newValue: DashboardCompraModel = {
            nmProduto: values.nmProduto,
            dtProdutoAuxiliar: [dtCompraFormatted],
            totalMensal: [totalMensal]
        }
        await addDoc(refTable, newValue);
    }
}

export interface DashboardVendasEntregaModel {
    id?: string
    nmProduto: string
    dtProdutoAuxiliar?: string[],
    totalMensal?: TotalMensalVendas[]
}
interface TotalMensalVendas {
    dtProduto: string
    quantidade: number | null
    vlTotal?: number,
}

export async function updateAddDashboardVendasEntregas(
    values: SubProdutoModel[],
    dtProduto: string,
    collectionName: string,
    dispatch: Dispatch
) {
    const dtVendaFormatted = moment(dtProduto, "DD/MM/YYYY").format("YYYY/MM");

    // Inicia um batch para operações em lote
    const batch = writeBatch(db);

    // Processa cada item em paralelo
    const promises = values.map(async (item) => {
        // Obtenha o documento para cada produto
        const venda = await getSingleItemByQuery<DashboardVendasEntregaModel>(
            collectionName, 
            [where('nmProduto', '==', item.nmProduto)], 
            dispatch
        );

        const totalMensal: TotalMensalVendas = {
            vlTotal: item.vlTotalMult ? item.vlTotalMult : item.valorItem,
            dtProduto: dtVendaFormatted,
            quantidade: item.quantidade,
        };

        if (venda) {
            const refID: string = venda.id ?? '';
            const refTable = doc(db, collectionName, refID);

            // Atualiza `dtProdutoAuxiliar` apenas se `dtVendaFormatted` ainda não existir
            const dtProdutoAuxiliarUpdated = venda.dtProdutoAuxiliar?.includes(dtVendaFormatted)
                ? venda.dtProdutoAuxiliar
                : [...(venda.dtProdutoAuxiliar || []), dtVendaFormatted];

            // Atualiza apenas se houver mudanças
            const updatedData = {
                nmProduto: item.nmProduto,
                dtProdutoAuxiliar: dtProdutoAuxiliarUpdated,
                totalMensal: [...(venda.totalMensal || []), totalMensal],
            };

            batch.update(refTable, updatedData);

        } else {
            // Se não existe, cria um novo documento
            const refTable = collection(db, collectionName);
            const newValue: DashboardVendasEntregaModel = {
                nmProduto: item.nmProduto,
                dtProdutoAuxiliar: [dtVendaFormatted],
                totalMensal: [totalMensal],
            };

            batch.set(doc(refTable), newValue);
        }
    });

    // Aguarda que todas as promessas se resolvam e depois executa o batch
    await Promise.all(promises);
    await batch.commit();
}
