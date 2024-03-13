import React from 'react'
import './Column.scss';

const Column = ({children, className = ""}) => {
    return (
        <div className={`column-component ${className}`}>
            {children}
        </div>
    )
}

export default Column;