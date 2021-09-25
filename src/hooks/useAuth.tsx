import React, {
  useContext, useEffect, useMemo, useReducer,
} from 'react';

import { useRouter } from 'next/router';

import { url } from '../../.next-urls';
import { urlNeedsAuth } from '../utils/urls';

export interface AuthState {
  token: string | null;
}

export type AuthAction = {
  type: 'login',
  token: string;
} | {
  type: 'logout',
  token: string,
};

const AuthContext = React.createContext<{
  state: AuthState,
  dispatch:(action: AuthAction) => void,
}>({
      state: {
        token: null,
      },
      dispatch: () => {},
    });

const reducer = (prev: AuthState, action: AuthAction) => {
  switch (action.type) {
    case 'login':
      localStorage.setItem('uptimeMonitorToken', action.token);
      return {
        token: action.token,
      };
    case 'logout':
      localStorage.removeItem('uptimeMonitorToken');
      return {
        token: null,
      };
    default:
      return prev;
  }
};

export interface AuthProviderProps {
  initialToken: string | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const { children, initialToken } = props;

  const [state, dispatch] = useReducer(reducer, {
    token: initialToken,
  });

  const value = useMemo(() => ({
    state,
    dispatch,
  }), [state, dispatch]);

  const router = useRouter();

  useEffect(() => {
    const token = null;
    if (token && urlNeedsAuth(router.pathname)) {
      router.replace(url('/auth/login'));
    }
  }, []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
