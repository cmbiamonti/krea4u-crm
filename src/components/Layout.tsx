import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [zoom, setZoom] = useState(0.8) // Default 80%

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Zoom Controls (opzionale) */}
        <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-600">Zoom:</span>
          <button 
            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            -
          </button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(1.2, z + 0.1))}
            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
          >
            +
          </button>
          <button 
            onClick={() => setZoom(0.8)}
            className="px-2 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
          >
            Reset
          </button>
        </div>
        
        <main className="flex-1 overflow-auto">
          <div 
            className="container mx-auto pl-0 pr-4 sm:pr-6 lg:pr-4 py-4 lg:py-8"
            style={{ zoom }}
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}