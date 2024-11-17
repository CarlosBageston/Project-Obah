// hooks/useauth.tsx
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { setUser, setuserLogado } from '../../store/reducer/reducer';
import {
    setNmEmpresa,
    setCnpjEmpresa,
    setPasswordDashboard,
    setTfEmpresa,
    setCepEmpresa,
    setRuaEmpresa,
    setBairroEmpresa,
    setCidadeEmpresa,
    setEstadoEmpresa,
    setNumeroEmpresa,
    setIsAdmin,
    setId
} from '../../store/reducer/empresaOnline';
import { getSingleItemByQuery } from '../queryFirebase';
import { RootState } from '../../store/reducer/store';
import { EmpresaRegister } from '../../Pages/signup/model/empresa';

function UseAuth() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const user = useSelector((state: RootState) => state.user.user);
    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setUser({
                    uid: user.uid,
                    email: user.email || '',
                }));
                dispatch(setuserLogado(true));
            } else {
                dispatch(setUser(null));
                dispatch(setuserLogado(false));
            }
            setIsLoading(false);
        });
    }, [dispatch]);

    useEffect(() => {
        if (user === null) return
        getEmpresa();
    }, [user]);
    const getEmpresa = async () => {
        const empresaOnline = await getSingleItemByQuery<EmpresaRegister>(`UsersData/${user?.uid}/Empresa`, [], dispatch);
        if (empresaOnline) {
            dispatch(setNmEmpresa(empresaOnline.nmEmpresa));
            dispatch(setCnpjEmpresa(empresaOnline.cnpjEmpresa));
            dispatch(setPasswordDashboard(empresaOnline.passwordDashboard));
            dispatch(setTfEmpresa(empresaOnline.tfEmpresa));
            dispatch(setCepEmpresa(empresaOnline.cepEmpresa));
            dispatch(setRuaEmpresa(empresaOnline.ruaEmpresa));
            dispatch(setBairroEmpresa(empresaOnline.bairroEmpresa));
            dispatch(setCidadeEmpresa(empresaOnline.cidadeEmpresa));
            dispatch(setEstadoEmpresa(empresaOnline.estadoEmpresa));
            dispatch(setIsAdmin(empresaOnline.isAdmin));
            dispatch(setNumeroEmpresa(empresaOnline.numeroEmpresa));
            dispatch(setId(empresaOnline.id ?? ''));
        }
    };
    return { isLoading };
}
export default UseAuth
