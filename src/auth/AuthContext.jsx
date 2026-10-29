import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const TOKEN_KEY = "letsgo_token";

//Reminder: "children" is anything that sits between AuthProvider in main.jsx.

//localStorage is an object that lives in the browser application. When a token is set, it is saved in that object which we check everytime the use brings up the application to see if a token exists. When someone logs in or out we update that object key value pair.

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  function login(newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }

  //Note setItme(TOKEN_KEY, newToken) is the same as
  //TOKEN_KEY : newTOKEN
  //Remidner we are keeping two things in sync. The token "state" in localStorage and token in our application. Note token state variable is what actually controls the rerender. So when setToken updates the token variable that is what causes the reRender of the application.

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
// There are two reasons for the useAuth() function above which is to simplify what we need to write in files we import this feature in and to help developers by throwing an error if someone tries to call this function in higher than the component tree in main.jsx.
