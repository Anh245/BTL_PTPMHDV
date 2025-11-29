import { useAuthStore } from '@/stores/useAuthStore.js';
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router';
import { useEffect } from 'react';
const ProtectRoute = () => {
    const {accessToken, user, loading, refresh, fetchMe} = useAuthStore();
    const [starting, setStarting] = useState(true);
    const init = async() =>{
      //xay ra khi f5 trang
      try {
        // Nếu không có accessToken, thử refresh
        if(!accessToken){
          try {
            await refresh();
          } catch (refreshError) {
            // Nếu refresh fail, không làm gì - để ProtectRoute redirect về signin
            console.error("Refresh failed:", refreshError);
            setStarting(false);
            return;
          }
        }
        
        // Sau khi refresh (hoặc đã có token), lấy lại accessToken mới từ store
        const currentToken = useAuthStore.getState().accessToken;
        if(currentToken && !user){
          await fetchMe();
        }
      } catch (error) {
        console.error("Init failed:", error);
      } finally {
        setStarting(false);
      }
    };
    useEffect(() => {
    
      init();
    }, []);

    if(starting||loading){
      return <div className='flex h-screen items-center justify-center'>Loading...</div>;
    }

    if(!accessToken){
        return <Navigate 
        to ="/signin"
        replace
        />;

    }
  return (
    <Outlet></Outlet>
  )
}

export default ProtectRoute
