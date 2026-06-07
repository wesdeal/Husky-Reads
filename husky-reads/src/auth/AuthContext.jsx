import { useContext, createContext, useState, useEffect } from "react";
import { API } from "../api"

const AuthContext = createContext(null);

export function AuthProvider( {children} ) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        if (storedToken) {
            setToken(storedToken);
            // Decode JWT payload to restore user info
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                setUser(payload)
            } catch (err) {
                // Invalid token, clear it
                localStorage.removeItem("access_token");
            }
        }
        setAuthLoading(false);
    }, []);

    

    const login = async (formData) => {

        

        try {
            const response = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.detail || "Error logging in, please try again.")
          }

          localStorage.setItem('access_token', data.access_token);
          setToken(data.access_token)

          
          const payload = JSON.parse(atob(data.access_token.split(".")[1]));
          setUser(payload);
          return { success: true }

        }
        catch (err) {
            console.log(err)
            return { success: false, error: err.message }
        }
    }


    function logout() {
        localStorage.removeItem("access_token");
        setToken(null);
        setUser(null);
        setAuthLoading(false);
    }


    return (
        <AuthContext.Provider value={{ token, user, login, logout, authLoading }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}