import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  getRedirectResult,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

interface IAuthProviderProps {
  children: JSX.Element;
}

const AuthContext = React.createContext({});

export function useAuth(): any {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: IAuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<any>();
  const [loading, setLoading] = useState(true);

  async function googleSignin(): Promise<any> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error('error signing in with google: ', error);
      }
    }
  }

  function githubSignin(): Promise<any> {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setCurrentUser(result.user);
        }
      })
      .catch((error) => {
        console.error('error handling redirect result: ', error);
      });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    googleSignin,
    githubSignin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
