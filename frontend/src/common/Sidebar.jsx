import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Train,
  Calendar,
  User,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import vi from '@/lib/translations';

const navigation = [
  { name: vi.sidebar.dashboard, href: '/dashboard', icon: LayoutDashboard },
  { name: vi.sidebar.stations, href: '/stations', icon: MapPin },
  { name: vi.sidebar.trains, href: '/trains', icon: Train },
  { name: vi.sidebar.schedules, href: '/schedules', icon: Calendar },
  { name: vi.sidebar.profile, href: '/profile', icon: User },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md dark:bg-slate-800 dark:text-white"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600 dark:bg-blue-700">
          <h1 className="text-xl font-bold text-white">{vi.sidebar.title}</h1>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700'
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

      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
