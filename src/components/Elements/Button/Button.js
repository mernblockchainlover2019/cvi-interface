import React, { useEffect } from "react";
import "./Button.scss";

const Button = ({
  eventOnSubmit,
  children,
  buttonText,
  onClick,
  disabled = false,
  bgColor,
  boxShadow,
  height,
  processing,
  processingText,
  ...props
}) => {
  const upHandler = (event) => {
    if(event.keyCode === 13 && !disabled){
        onClick();
    }
  }

  useEffect(() => {
      eventOnSubmit && window.addEventListener('keyup', upHandler);
      return () => {
          eventOnSubmit && window.removeEventListener('keyup', upHandler);
      };
      // eslint-disable-next-line
  });

  return (
    <button
      className="button"
      type="button"
      style={{ backgroundColor: bgColor, boxShadow, height }}
      disabled={disabled || processing}
      {...(disabled ? {} : { onClick })}
      {...props}
    >
      {processing ? <div className="processing">{processingText || "Processing"} <div className="dot-flashing"></div></div> : (children || buttonText) }
    </button>
  );
};

export default Button;