import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MapPin, 
  Train, 
  Calendar, 
  User,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ga tàu', href: '/stations', icon: MapPin },
  { name: 'Tàu', href: '/trains', icon: Train },
  { name: 'Lịch trình', href: '/schedules', icon: Calendar },
  { name: 'Hồ sơ', href: '/profile', icon: User },
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50 ">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={isOpen ? 'mx-64 p-2 rounded-md bg-white shadow-md' : 'p-2 rounded-md bg-white shadow-md'}

        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 h-100% bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-20% px-4 bg-primary-600">
          <h1 className="text-xl font-bold text-black">🚉 Train Station</h1>
        </div>
        
        <nav className="mt-8 px-4 h-128">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar

