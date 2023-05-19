
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Menu from '../Components/Menu/Menu'
import PrivateRoute from '../store/reducer/private';
import CadastroCliente from '../Pages/admin/cadastroClientes';
import CadastroProduto from '../Pages/admin/cadastroProdutos';
import Dashboard from '../Pages/admin/dashboard';
import Entregas from '../Pages/admin/entregas';
import Vendas from '../Pages/admin/vendas';
import Carousel from '../Pages/Carousel';
import Contato from '../Pages/Contato';
import Footer from '../Pages/Footer';
import Login from '../Pages/login';
import MaisVendidos from '../Pages/MaisVendidos';
import SobreNos from '../Pages/SobreNos';
import NovasCompras from '../Pages/admin/compras';
import Estoque from '../Pages/admin/estoque';


export default function Router() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={
                    <>
                        <Carousel />
                        <MaisVendidos />
                        <SobreNos />
                    </>
                }
                />
                <Route path='/contato' element={
                    <Contato />
                }
                />
                <Route path='/login' element={
                    <Login />
                }
                />

                <Route element={<PrivateRoute />}>
                    <Route path='dashboard' element={<Dashboard />} />
                    <Route path='/vendas' element={<Vendas />} />
                    <Route path='/cadastro-cliente' element={<CadastroCliente />} />
                    <Route path='/cadastro-produto' element={<CadastroProduto />} />
                    <Route path='/entregas' element={<Entregas />} />
                    <Route path='/compras' element={<NovasCompras />} />
                    <Route path='/estoque' element={<Estoque />} />
                </Route>
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}