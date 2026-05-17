import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'


function Navbar() {

  const {token, logout} = useAuth();
  

  return (
    <nav className="bg-blue-950 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-200">HuskyReads</h1>
          <div className="flex gap-6">
            <Link to="/" className="text-slate-200 hover:underline">Home</Link>
            <Link to="/search" className="text-slate-200 hover:underline">Search</Link>
            <Link to="/profile" className="text-slate-200 hover:underline">Profile</Link>
            {/* profile link should be conditional. show if user is logged in, otherwise do not. */}
            
            {token ?
            <Link to="/" onClick={logout} className="text-slate-200 hover:underline">Log Out</Link>
            :
            <>
              <Link to="/signup" className="text-slate-200 hover:underline">Sign Up</Link>
              <Link to="/login" className="text-slate-200 hover:underline">Login</Link>
            </>
            }
            





          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
