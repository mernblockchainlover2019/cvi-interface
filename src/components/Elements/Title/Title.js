import React from 'react';
import './Title.scss';

const Title = ({text, color = "#6885bf", borderColor, textAlign, fontSize, className, ...props}) => {
    return (
        <h2 {...props} className={`title ${borderColor ? 'border' : ''} ${className ? className : ''}`} style={{color, borderColor, fontSize, textAlign}}>
            {text}
        </h2>
    )
}

export default Title;