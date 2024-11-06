// hooks/useauth.tsx
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { setUser, setuserLogado } from '../../store/reducer/reducer';

function UseAuth() {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

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

    return { isLoading };
}
export default UseAuth
