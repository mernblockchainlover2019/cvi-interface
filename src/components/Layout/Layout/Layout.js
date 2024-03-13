import React from 'react'
import './Layout.scss';

const Layout = ({children, className}) => {
    return (
        <div className={`layout-component ${className ?? ''}`}>
            {children}
        </div>
    )
}

export default Layout;