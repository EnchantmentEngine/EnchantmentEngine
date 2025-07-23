import React from 'react'

/**
 * Router Outlet component for use with storybook-addon-remix-react-router
 */
export const RouterOutlet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="router-outlet">{children}</div>
}

export default RouterOutlet
