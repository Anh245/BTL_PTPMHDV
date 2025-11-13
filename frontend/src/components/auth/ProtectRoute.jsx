import { useAuthStore } from '@/stores/useAuthStore.js';
import React, { useState } from 'react'
import { Navigate, Outlet } from 'react-router';
import { useEffect } from 'react';
const ProtectRoute = () => {
    const {accessToken, user, loading, refresh, fetchMe} = useAuthStore();
    const [starting, setStarting] = useState(true);
    const init = async() =>{
      //xay ra khi f5 trang

      if(!accessToken){
        await refresh();
      }
      if(accessToken && !user){
        await fetchMe();

      }
      setStarting(false);
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
