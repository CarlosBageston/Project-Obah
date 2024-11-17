export interface EmpresaRegister {
    id?: string;
    uid?: string;
    email: string;
    password?: string;
    confirmPassword?: string;
    passwordDashboard: string;
    oldPasswordDashboard?: string;
    cnpjEmpresa: string;
    nmEmpresa: string;
    tfEmpresa: string;
    cepEmpresa: string;
    ruaEmpresa: string;
    bairroEmpresa: string;
    cidadeEmpresa: string;
    estadoEmpresa: string;
    numeroEmpresa: string;
    isAdmin?: boolean
}