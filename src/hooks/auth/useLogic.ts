import { auth } from '../../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import{ useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';


export default function useLogic() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [logado, setLogado ] = useState< User | null>(null);
    const [error, setError ] = useState('');

    const login = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate('/dashboard');
            })
            .catch(() => {
                setError('E-mail ou senha incorreto');
            });
    };

    useEffect(() => {
        onAuthStateChanged(auth, user => {
            if(user !== null){
                return setLogado(user);
            }
            
        });
    },[auth]);

    return { 
        login, 
        setEmail, 
        setPassword, 
        email, 
        password, 
        logado,
        error
    };
}