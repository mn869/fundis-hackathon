import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'
import { fetchProfile } from '../store/slices/authSlice'

const Layout = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout