import Button from 'components/Elements/Button';
import Modal from 'components/Modal/Modal';
import React from 'react';
import './ErrorModal.scss';

const ErrorModal = ({ setModalIsOpen, error = "An error has occured", isWarning }) => {

    const closeHandler = () => {
        setModalIsOpen(false);
    }

    return (
        <Modal closeIcon className="error-modal" handleCloseModal={() => setModalIsOpen(false)}>
            <div>
                <img src={require(`images/icons/${isWarning ? "notifications/notice" : "notice-red-icon"}.svg`).default} alt="notice red icon" {...(isWarning ? {width: "80px", height: "80px"} : {} ) } />

                <h2>{error}</h2>
                
                <Button className="error-modal__close button" buttonText="CLOSE" onClick={closeHandler}/>
            </div>
        </Modal>
    )
}

export default ErrorModal;