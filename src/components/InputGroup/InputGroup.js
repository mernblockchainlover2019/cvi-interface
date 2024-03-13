import React, { useState } from 'react';
import './InputGroup.scss';

const InputGroup = ({label, children, eye, error, className, erase, onClickErase, htmlFor}) => {
    const [type, toggleType] = useState(false);
    return (
    <div className={`input-group-component ${error ? "error" : "" } ${className??""}`}>
        {label && <label htmlFor={htmlFor} style={htmlFor ? {cursor: "pointer"} : {} } >{label}</label>}
        { type ? React.cloneElement(children, {type: "text"})
        : children }
        {error && <div className="input-error">{error}</div>}
        {erase && <div className={`erase ${!eye && 'not-eye'}`} onClick={ () => onClickErase() }></div>}
        {eye && <div className={`eye ${type ? "active" : "" }`} onClick={() => toggleType(!type)} ></div>}
    </div>
)};

export default InputGroup;