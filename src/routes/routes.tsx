
import Login from '../Pages/login';
import Footer from '../Pages/Footer';
import Contato from '../Pages/Contato';
import SobreNos from '../Pages/SobreNos';
import Carousel from '../Pages/Carousel';
import Vendas from '../Pages/admin/vendas';
import Estoque from '../Pages/admin/estoque';
import Entregas from '../Pages/admin/entregas';
import MaisVendidos from '../Pages/MaisVendidos';
import Dashboard from '../Pages/admin/dashboard';
import PrivateRoute from '../store/reducer/private';
import AtualizarEstoque from '../Pages/admin/compras';
import CadastroProduto from '../Pages/admin/cadastroProdutos';
import CadastroCliente from '../Pages/admin/cadastroClientes';
import { BrowserRouter, Route, Routes } from 'react-router-dom';


export default function Router() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={
                    <>
                        <Carousel />
                        <MaisVendidos />
                        <SobreNos />
                        <Contato />
                    </>
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
                    <Route path='/atualizar-estoque' element={<AtualizarEstoque />} />
                    <Route path='/estoque' element={<Estoque />} />
                </Route>
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}