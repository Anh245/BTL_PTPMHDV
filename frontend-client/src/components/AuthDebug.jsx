import useAuthStore from '../stores/useAuthStore';
import { toast } from 'sonner';

const AuthDebug = () => {
  const { user, token, isAuthenticated } = useAuthStore();

  const checkAuth = () => {
    toast.info(`Authentication Status`, {
      description: `Logged in: ${isAuthenticated} | User: ${user?.username || 'None'} | Token: ${token ? 'Present' : 'Missing'}`
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
        <div className="flex items-center gap-2">
          <span className="font-bold">⚠️ Not Authenticated</span>
          <button 
            onClick={checkAuth}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Debug
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
      <div className="flex items-center gap-2">
        <span className="font-bold">✅ Authenticated: {user?.username}</span>
        <button 
          onClick={checkAuth}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        >
          Debug
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;
