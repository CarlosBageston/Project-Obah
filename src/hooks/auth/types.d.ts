export interface Props {
    children: React.ReactNode;
}

export interface AuthContextData {
    email: string,
    password: string,
    setEmail:  React.Dispatch<React.SetStateAction<string>>,
    setPassword:  React.Dispatch<React.SetStateAction<string>>,
    login:  () => void,
    logado: User | null,
    error: string
}