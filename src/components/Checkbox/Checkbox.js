import React from "react";
import "./Checkbox.scss";

const Checkbox = ({
  onClick,
  title,
  className,
  tooltip,
  checked,
  disabled,
}) => {
  return (
    <div className={`checkbox-component ${className ?? ''}`}>
      <div 
        className={`checkbox ${className ?? ''} ${disabled ?? ''} ${!disabled && checked ? 'checked' : ''}`}
        onClick={onClick}>
          {checked && <img className="check-mark" src={require('../../images/icons/checkbox-checked.svg').default} alt="check" />}
      </div>
      <h2 className="checkbox-title">
        {title} {tooltip}
      </h2>
    </div>
  );
};

export default Checkbox;