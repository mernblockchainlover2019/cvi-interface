import { useOnClickOutside } from "components/Hooks";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./Modal.scss";
import "../Modals/ArbitrageModal/ArbitrageModal.scss";

const modalRoot = document.getElementById("modal-root");

const Modal = ({ type = "basic", clickOutsideDisabled, className="", id, children, handleCloseModal, closeIcon }) => {
  const containerRef = useRef(null);
  useOnClickOutside(containerRef, () => !clickOutsideDisabled && handleCloseModal(false));

  useEffect(() => {
    modalRoot.className = (modalRoot.children.length > 0 && type) ? type : "";

    return () => {
      modalRoot.className = "";
    }
  }, [type]);

  return ReactDOM.createPortal(
    <div {...id ? {id: id} : {}} className={`modal ${type} ${className}`}>
      <div ref={containerRef} className="modal__container">
        {closeIcon && <button className="close-button" onClick={handleCloseModal}>
          <img src={require("images/icons/close-no-bg.svg").default} alt="close icon" />
        </button> }
        {children}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;