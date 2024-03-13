import Spinner from 'components/Spinner/Spinner';
import React, { useMemo } from 'react'

export const DataState = ({value, children}) => {
    return useMemo(() => {
        return value === null ? <Spinner className="statistics-spinner" /> :
            value === "N/A" ? <span>N/A</span> : <> 
                {children}
            </>
    }, [value, children]);
}
