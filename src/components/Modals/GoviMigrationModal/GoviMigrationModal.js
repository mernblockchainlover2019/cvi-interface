import React from "react";
import Button from "components/Elements/Button";
import Modal from 'components/Modal/Modal';
import { useDispatch } from 'react-redux';
import { setGoviMigrationModalOpen } from 'store/actions';
import config, { newStakingProgramNotification } from "config/config";
import './GoviMigrationModal.scss';

export const GoviMigrationModal = () => {
  const dispatch = useDispatch();
  return (
    <Modal closeIcon className="govi-migration-modal" handleCloseModal={() => dispatch(setGoviMigrationModalOpen(false))}>
        <div className="govi-migration-modal__wrapper">
            <div className="migrate-icons">
                <img className="govi-icon" src={require('../../../images/coins/govi.svg').default} alt="govi" />
                <img className="v1-circle-icon" src={require('../../../images/coins/v1-circle.svg').default} alt="v1-circle" />
                <div className="arrow-icon-wrapper"><img className="arrow-icon" src={require('../../../images/icons/arrow.svg').default} alt="arrow" /></div>
                <img className="govi-icon" src={require('../../../images/coins/govi.svg').default} alt="govi" />
                <img className="v2-circle-icon" src={require('../../../images/coins/v2-circle.svg').default} alt="v2-circle" />
            </div>
            <div className="details">
                {config.goviV2StakingText.map((desc, tn) => (
                    <React.Fragment key={tn}> 
                        <p key={tn}>
                            {desc}&nbsp;
                            {tn === (config.goviV2StakingText?.length -1) && <a href={newStakingProgramNotification.link} target="_blank" rel="nofollow noopener noreferrer">
                                click here
                            </a>}
                        </p>
                    </React.Fragment>
                ))}
               
            </div>
            <div className="actions">
                <Button
                className="govi-migration-modal__close button"
                buttonText="CLOSE"
                onClick={() => dispatch(setGoviMigrationModalOpen(false))}
                />
            </div>
        </div>
    </Modal>
  );
};

export default GoviMigrationModal;