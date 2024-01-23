
import { Suspense, lazy } from 'react';
import Footer from '../Pages/Footer';
import Contato from '../Pages/Contato';
import SobreNos from '../Pages/SobreNos';
import Carousel from '../Pages/Carousel';
import MaisVendidos from '../Pages/MaisVendidos';
import logo from '../assets/Image/logo.png';

const Login = lazy(() => import('../Pages/login'));
const Vendas = lazy(() => import('../Pages/admin/vendas'));
const Estoque = lazy(() => import('../Pages/admin/estoque'));
const Entregas = lazy(() => import('../Pages/admin/entregas'));
const Dashboard = lazy(() => import('../Pages/admin/dashboard'));
const PrivateRoute = lazy(() => import('../store/reducer/private'));
const CartaoPonto = lazy(() => import('../Pages/admin/cartaoPonto'));
const AtualizarEstoque = lazy(() => import('../Pages/admin/compras'));
const CadastroProduto = lazy(() => import('../Pages/admin/cadastroProdutos'));
const CadastroCliente = lazy(() => import('../Pages/admin/cadastroClientes'));
const CadastroColaborador = lazy(() => import('../Pages/admin/cadastroColaborador'));

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Dots } from '../store/assets/loadingStyle';
import { BoxLoading } from '../Pages/login/style';

export default function Router() {

    return (
        <BrowserRouter>
            <Suspense fallback={
                <BoxLoading>
                    <div>
                        <img src={logo} alt="logo da empresa" width={250} />
                    </div>
                    <Dots />
                </BoxLoading>
            }>
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
                        <Route path='/colaborador' element={<CadastroColaborador />} />
                        <Route path='/cartao-ponto' element={<CartaoPonto />} />
                    </Route>
                </Routes>
            </Suspense>
            <Footer />
        </BrowserRouter>
    )
}