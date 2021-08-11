import React from 'react'

import {Navbar} from './Nav'

export const Layout = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex">
        <div className="flex-1 min-w-0 bg-white">
          <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
            <div className="h-full relative" style={{ minHeight: '12rem' }}>
              <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg" />
            </div>
          </div>
      </div>
      <div className="flex-1 min-w-0 bg-white">
          <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
            <div className="h-full relative" style={{ minHeight: '12rem' }}>
              <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg" />
            </div>
          </div>
      </div>
      <div className="flex-1 min-w-0 bg-white">
          <div className="h-full pl-4 pr-6 py-6 sm:pl-6 lg:pl-8 xl:pl-0">
            <div className="h-full relative" style={{ minHeight: '12rem' }}>
              <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg" />
            </div>
          </div>
      </div>
    </div>
    </div>
  )
}

export default Layout
