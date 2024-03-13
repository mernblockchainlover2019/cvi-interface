import React from "react";
import "./Input.scss";

const Input = ({error, ...props}) => (<>
    <input
        type={props.type ?? "text"}
        placeholder={props.placeholder ?? ""}
        value={props.value ?? ""}
        onChange={props.onChange}
        {...props}
        className={`input ${props.className ?? ""}${error ? ' error' : ''}`}
      />
      {error && <div className="error-message">{error}</div> }
  </>
);

export default Input;