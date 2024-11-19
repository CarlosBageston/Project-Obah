
import { Suspense, lazy } from 'react';
import Footer from '../Pages/Footer';
import logo from '../assets/Image/logo.png';

const Login = lazy(() => import('../Pages/login'));
const SignUp = lazy(() => import('../Pages/signup'));
const Vendas = lazy(() => import('../Pages/admin/vendas'));
const Profile = lazy(() => import('../Pages/admin/profile'));
const Entregas = lazy(() => import('../Pages/admin/entregas'));
const Dashboard = lazy(() => import('../Pages/admin/dashboard'));
const PrivateRoute = lazy(() => import('../hooks/auth/private'));
const CartaoPonto = lazy(() => import('../Pages/admin/cartaoPonto'));
const AtualizarEstoque = lazy(() => import('../Pages/admin/compras'));
const CadastroProduto = lazy(() => import('../Pages/admin/cadastroProdutos'));
const CadastroCliente = lazy(() => import('../Pages/admin/cadastroClientes'));
const EstoqueComprados = lazy(() => import('../Pages/admin/estoque/comprado'));
const EstoqueFabricados = lazy(() => import('../Pages/admin/estoque/fabricado'));
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
                    <Route path='/' element={<Login />} />
                    <Route path='/register' element={<SignUp />} />

                    <Route element={<PrivateRoute />}>
                        <Route path='dashboard' element={<Dashboard />} />
                        <Route path='/vendas' element={<Vendas />} />
                        <Route path='/cadastro-cliente' element={<CadastroCliente />} />
                        <Route path='/cadastro-produto' element={<CadastroProduto />} />
                        <Route path='/entregas' element={<Entregas />} />
                        <Route path='/atualizar-estoque' element={<AtualizarEstoque />} />
                        <Route path='/colaborador' element={<CadastroColaborador />} />
                        <Route path='/cartao-ponto' element={<CartaoPonto />} />
                        <Route path='/estoque-fabricado' element={<EstoqueFabricados />} />
                        <Route path='/estoque-comprado' element={<EstoqueComprados />} />
                        <Route path='/perfil' element={<Profile />} />
                    </Route>
                </Routes>
            </Suspense>
            <Footer />
        </BrowserRouter>
    )
}