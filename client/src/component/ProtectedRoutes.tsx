import React, { useEffect } from 'react'
import Cookies from 'js-cookie'
import { Navigate , Outlet } from 'react-router-dom';

function ProtectedRoutes() {
  const isAuthenticated = Cookies.get('isAuthenticated');
  console.log(isAuthenticated)

  if(!isAuthenticated){
    return <Navigate to="/login"/>
  }
  return (
    <div>
      <Outlet/>  
    </div>
  )
}

export default ProtectedRoutes
