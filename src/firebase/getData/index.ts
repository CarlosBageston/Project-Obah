import { CollectionReference, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "..";



export default function GetData(nameDB: string, carregar: boolean) {
  const [loading, setLoading] = useState(false);
  const [dataTable, setDataTable] = useState<any[]>([]);

    const _collection = collection(db, nameDB) as CollectionReference<any>;
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