/**
 * Modelo do dasboard
*
* @author Carlos Bageston
*/


interface DashboardModel {
    somaLucroAnual: number | null,
    somaAnual: number | null,
    somaTotalEntregas: number | null,
    somaTotalVendas: number | null,
    password: string,
    error: string,

}
export default DashboardModel