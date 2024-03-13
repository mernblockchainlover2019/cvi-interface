import Button from 'components/Elements/Button';
import Title from 'components/Elements/Title';
import Modal from 'components/Modal';
import React from 'react'
import { useActionController } from '../ActionController';
import './SellAllModal.scss';

const SellAllModal = ({setSellAllModal, isProcessing, onSubmit}) => {
    const { setIsOpen } = useActionController();

    const _onSubmit = () => {
        onSubmit();
        setSellAllModal(false);
    }

    const closeModals = () => {
        setSellAllModal(false);
        setIsOpen(false);
    }
    
    return (
        <Modal clickOutsideDisabled className="error-modal sell-all-modal" handleCloseModal={setSellAllModal}>
            <img className="notice" src={require('images/icons/notifications/notice.svg').default} alt="notice red icon" />

            <Title text="Important notice." />

            <h2>
                <br/>Please make sure to claim your GOVI rewards before you sell any part of your position.
            </h2>

            <div className="sell-all-modal--actions">
                <Button className="error-modal__close button" buttonText="Cancel" onClick={closeModals} />
                <Button 
                    className="error-modal__close button" 
                    buttonText="Proceed" 
                    onClick={_onSubmit} 
                    processing={isProcessing}
                />
            </div>
        </Modal>
    )
}

export default SellAllModal;