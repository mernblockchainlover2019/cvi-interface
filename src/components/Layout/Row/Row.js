import React from 'react'
import './Row.scss';

const Row = ({children, className = "", flex}) => {
    return (
        <div style={flex ? {flex} : {}} className={`row-component ${className}`}>
            {children}
        </div>
    )
}

export default Row;