import { CollectionReference, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "..";

/**
 * Realizar busca no banco de dados.
 * 
 * @param nameColecao Nome da coleção no banco de dados.
 * @param carregar Indica se a requisição deve ser atualizada.
 * @returns Retorna um objeto contendo o estado de carregamento (loading),
 *          os dados do banco de dados (dataTable) e uma função para atualizar os dados (setDataTable).
 */

export default function GetData(nameColecao: string, carregar: boolean) {
  const [loading, setLoading] = useState(false);
  const [dataTable, setDataTable] = useState<any[]>([]);

    const _collection = collection(db, nameColecao) as CollectionReference<any>;
    useEffect(() => {
        if (carregar) {
            setLoading(true);
            const getRelatorio = async () => {
                const data = await getDocs<any>(_collection);
                setDataTable(data.docs.map(doc => ({ ...doc.data(), id: doc.id })));
                setLoading(false);
            };
            getRelatorio();
        }
    }, [carregar]);

    return {
        loading,
        dataTable,
        setDataTable
    }
}