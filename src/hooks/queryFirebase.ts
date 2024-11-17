import { 
    collection, 
    query, 
    getDocs, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    QueryConstraint, 
    DocumentData, 
    limit,
    startAfter,
    QueryDocumentSnapshot,
    Query,
    getDoc,
    endBefore
} from 'firebase/firestore';
import { Dispatch } from 'redux';
import { setAddItemLoading, setDeleteItemLoading, setGetAllItemsLoading, setGetItemPaginationLoading, setGetItemsByQueryLoading, setGetSumLoading, setUpdateItemLoading } from '../store/reducer/loadingSlice';
import { db } from '../firebase';
import { setMessage } from '../store/reducer/reducer';

// Função para obter todos os itens de uma coleção
export async function getAllItems<T = DocumentData>(
    collectionName: string,
    dispatch: Dispatch,
    pageSize: number,                  // Tamanho da página
    lastVisible?: QueryDocumentSnapshot // Cursor para a próxima página
): Promise<{ data: T[], lastDoc: QueryDocumentSnapshot | null }> {
    dispatch(setGetAllItemsLoading(true));

    try {
        const collectionRef = collection(db, collectionName);

        // Cria um array de constraints para a query
        const queryConstraints: QueryConstraint[] = [limit(pageSize)];
        
        if (lastVisible) {
            queryConstraints.push(startAfter(lastVisible)); // Adiciona o startAfter se houver um cursor
        }

        const itemsQuery = query(collectionRef, ...queryConstraints);
        const querySnapshot = await getDocs(itemsQuery);

        // Pega o último documento visível para ser o cursor na próxima página
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        // Mapeia os documentos para os dados tipados
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as T));

        return { data, lastDoc };
    } catch (error) {
        console.error('Erro ao buscar itens com paginação:', error);
        throw new Error('Erro ao buscar itens com paginação.');
    } finally {
        dispatch(setGetAllItemsLoading(false));
    }
}

// Função para obter itens com base em uma consulta
export async function getItemsByQuery<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[],
    dispatch: Dispatch,
    maxItems?: number,
    lastVisibleDoc?: DocumentData | null,
): Promise<{ data: T[], lastVisible: DocumentData | null }> {
    dispatch(setGetItemsByQueryLoading(true));
    try {
        const collectionRef = collection(db, collectionName);

        let q = query(collectionRef, ...constraints)
        if(maxItems){
            q = query(collectionRef, ...constraints, limit(maxItems));
            if (lastVisibleDoc) {
                q = query(collectionRef, ...constraints, startAfter(lastVisibleDoc), limit(maxItems || 10));
            }
        }

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as T));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

        return { data, lastVisible };
    } catch (error) {
        console.error('Erro ao buscar itens com consulta:', error);
        throw new Error('Erro ao buscar itens com consulta.');
    } finally {
        dispatch(setGetItemsByQueryLoading(false));
    }
}
export async function getDocumentById<T = DocumentData>(
    collectionName: string,
    docId: string,
    dispatch: Dispatch
  ): Promise<T | null> {
    try {
      dispatch(setGetItemsByQueryLoading(true));
  
      // Referência ao documento usando o ID do Firestore
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        console.log("Nenhum documento encontrado com esse ID.");
        return null;
      }
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
      throw new Error("Erro ao buscar documento.");
    } finally {
      dispatch(setGetItemsByQueryLoading(false));
    }
  }
export async function getSingleItemByQuery<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[],
    dispatch: Dispatch,
): Promise<T | null> {
    dispatch(setGetItemsByQueryLoading(true));
    try {
        const collectionRef = collection(db, collectionName);

        // Limita a query para retornar apenas um item
        const q = query(collectionRef, ...constraints, limit(1));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Retorna o primeiro item, ou seja, o único item que encontramos
            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
            } as T;
        }

        return null; // Se não encontrar nada, retorna null
    } catch (error) {
        console.error('Erro ao buscar item único com consulta:', error);
        throw new Error('Erro ao buscar item único com consulta.');
    } finally {
        dispatch(setGetItemsByQueryLoading(false));
    }
}

export async function getItemsByPage<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[],
    dispatch: Dispatch,
    pageSize: number,
    cursor?: QueryDocumentSnapshot | null,
    direction?: 'next' | 'previous'
): Promise<{ data: T[], firstVisible: QueryDocumentSnapshot | null, lastVisible: QueryDocumentSnapshot | null, hasMore: boolean, hasError: boolean }> {
    dispatch(setGetItemPaginationLoading(true));
    try {
        let queryRef: Query<DocumentData> = collection(db, collectionName);

        if (constraints.length > 0) {
            queryRef = query(queryRef, ...constraints);
        }

        if (cursor) {
            queryRef = query(
                queryRef,
                direction === 'next' ? startAfter(cursor) : endBefore(cursor),
                limit(pageSize + 1)
            );
        } else {
            queryRef = query(queryRef, limit(pageSize + 1));
        }

        // Obtém os documentos
        const snapshot = await getDocs(queryRef);
        const data: T[] = snapshot.docs.slice(0, pageSize).map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as T[];

        const hasMore = snapshot.docs.length > pageSize;
        const firstVisible = snapshot.docs[0] || null;
        const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[pageSize - 1] || null : null;
        
        if (direction === 'previous' ) {
            return { data, firstVisible, lastVisible, hasMore: true, hasError: false };
        }
        return { data, firstVisible, lastVisible, hasMore, hasError: false };
    } catch (error) {
        console.error('Erro ao buscar dados paginados:', error);
        return { data: [], firstVisible: null, lastVisible: null, hasMore: false, hasError: true };
    } finally {
        dispatch(setGetItemPaginationLoading(false));
    }
    
}
// Função para obter a soma de um campo específico
export async function getSum(
    collectionName: string,
    constraints: QueryConstraint[],
    fieldName: string,
    dispatch: Dispatch
): Promise<number> {
    dispatch(setGetSumLoading(true));
    try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);

        let sum = 0;
        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data[fieldName]) {
                sum += Number(data[fieldName]);
            }
        });

        return sum;
    } catch (error) {
        console.error('Erro ao calcular a soma:', error);
        throw new Error('Erro ao calcular a soma.');
    } finally {
        dispatch(setGetSumLoading(false));
    }
}

// Função para adicionar um novo item
export async function addItem<T extends DocumentData>(
    collectionName: string,
    item: T,
    dispatch: Dispatch
): Promise<void> {
    dispatch(setAddItemLoading(true));
    try {
        const collectionRef = collection(db, collectionName);
        await addDoc(collectionRef, item);
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        dispatch(setMessage("Erro ao adicionar Item"))
    } finally {
        dispatch(setAddItemLoading(false));
    }
}

// Função para atualizar um item existente
export async function updateItem(
    collectionName: string,
    id: string,
    updates: Partial<DocumentData>,
    dispatch: Dispatch
): Promise<void> {
    dispatch(setUpdateItemLoading(true));
    try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updates);
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        dispatch(setMessage("Erro ao Editar Item"))
    } finally {
        dispatch(setUpdateItemLoading(false));
    }
}

// Função para deletar um item
export async function deleteItem(
    collectionName: string,
    id: string,
    dispatch: Dispatch
): Promise<void> {
    dispatch(setDeleteItemLoading(true));
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        throw new Error('Erro ao deletar item.');
    } finally {
        dispatch(setDeleteItemLoading(false));
    }
}
