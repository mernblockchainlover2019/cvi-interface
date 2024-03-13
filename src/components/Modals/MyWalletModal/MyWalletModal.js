import React from 'react'
import { Link } from 'react-router-dom';
import ConnectWallet from 'components/ConnectWallet';
import { useSelector } from 'react-redux';
import { chainsData } from 'connectors';
import './MyWalletModal.scss';
import Modal from 'components/Modal/Modal';
import Title from 'components/Elements/Title';
import Copy from 'components/Copy/Copy';

export const MyWalletModal = ({address, setModalIsOpen}) => {
    const { selectedNetwork } = useSelector(({app}) => app);

   

    return (
        <Modal id="my-wallet-modal" clickOutsideDisabled closeIcon handleCloseModal={() => setModalIsOpen(false)}>
            <Title className="xs-center" color="white" borderColor="#f8ba15" text="Account"/>
   
            <div className="account-info">
                <p className="address">{address}</p>
                <div className="account-info__actions">
                    <Copy title="Copy address" text={address} />

                    <Link to={{pathname: `${chainsData[selectedNetwork].explorerUrl}/${address}`}} target="_blank" rel="nofollow noopener noreferrer">
                        <img src={require('../../../images/icons/open-browser.svg').default} alt="EtherScan" />
                        <span>View on {chainsData[selectedNetwork].explorerName}</span>
                    </Link>
                </div>
                
                <ConnectWallet type="change" />
            </div>
        </Modal>
    )
}

export default MyWalletModal;