import React, {
  useContext, useEffect, useMemo, useReducer,
} from 'react';

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

export const AuthProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    token: null,
  });

  const value = useMemo(() => ({
    state,
    dispatch,
  }), [state, dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('uptimeMonitorToken');
    if (token) {
      dispatch({
        type: 'login',
        token,
      });
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
