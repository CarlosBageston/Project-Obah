import { createContext, useContext, useMemo } from 'react';
import { Props, AuthContextData } from './types';
import useLogic from './useLogic';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function AuthProvider({ children }: Props) {
    const {
        login,
        setEmail,
        setPassword,
        email,
        password,
        logado,
        error
    } = useLogic();


    const contextValue = useMemo(
        () => ({
            login,
            setEmail,
            setPassword,
            email,
            password,
            logado,
            error
        }), [setEmail, setPassword, login],
    );

    return <AuthContext.Provider value={contextValue}>
        {children}
    </AuthContext.Provider>;
}

function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export { AuthProvider, useAuth };