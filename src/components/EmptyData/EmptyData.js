import Spinner from 'components/Spinner/Spinner';
import React from 'react'
import './EmptyData.scss';

const EmptyData = ({isSpinner, text = "No data found."}) => {
    return (
        <div className={`empty-data-component ${isSpinner ? 'is-spinner' : ''}`}>
            {isSpinner ? <Spinner className="statistics-spinner" /> : <> 
                <img src={require('images/icons/empty-search.svg').default} alt="empty" />
                <span>{text}</span>
            </>}
        </div>
    )
}

export default EmptyData;