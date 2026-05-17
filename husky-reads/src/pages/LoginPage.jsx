import Navbar from "../components/layout/Navbar"
import { use, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


function LoginPage() {

  const { user, login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const login_result = await login(formData);

    if (login_result.success) {
      console.log("Login success.")
      navigate('/')
    } else {
      setError(login_result.error || "Login error.")
      setLoading(false)
    }
    
  }



  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }


  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-linear-to-br from-slate-950 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center mb-6">
          <img src="/husky.svg" alt="Husky Reads" className="w-20 h-20 mb-4" />
          <h1 className="text-3xl font-bold text-blue-950 text-center">Sign In</h1>
          <p className="text-gray-600 text-base mt-2">Welcome Back Book Worm.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-blue-950 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              /* value={formData.username} */
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-blue-950 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              /* value={formData.password} */
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-950 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-950 text-white py-2 px-4 rounded-lg hover:bg-blue-900 transition font-medium mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
    </>
  )
}

export default LoginPage
