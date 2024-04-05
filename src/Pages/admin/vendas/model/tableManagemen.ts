import { Timestamp } from "firebase/firestore"

/**
 * Modelo de Gestão Das Mesas
*
* @author Carlos Bageston
*/



interface TableManagemenModel {
    id?: string,
    nmTable: string,
    createdAt: Timestamp
}
export default TableManagemenModel