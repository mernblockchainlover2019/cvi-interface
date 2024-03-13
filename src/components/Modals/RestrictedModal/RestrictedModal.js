import Api from 'Api';
import Button from 'components/Elements/Button';
import Modal from 'components/Modal/Modal';
import config from 'config/config';
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom';
import './RestrictedModal.scss';

const RestrictedModal = () => {
    const [showRestrictedModal, setShowRestrictedModal] = useState();
    const location = useLocation();
    const history = useHistory();

    const checkRestrictedCountry = async () => {
        try {
            const restrictedRoutesPathFiltered = Object.values(config.routes)
                .filter(({restricted}) => restricted)
                .map(({path}) => path.replace('/', ''));

            const isRestrictedRoute = restrictedRoutesPathFiltered.some(path => location.pathname.includes(path));
            if(!isRestrictedRoute) return;

            await Api.CHECK_RESTRICTED_COUNTRY();

        } catch (error) {
            if(error?.response?.status === 470) {
                setShowRestrictedModal(true);
                history.push('/');
            }
        }
    }

    const confirmButton = () => {
        setShowRestrictedModal(false);
    }

    useEffect(() => {
        if(!location?.pathname || process.env.NODE_ENV === 'development' || window?.location?.host?.includes("localhost:3000") || window?.location?.host?.includes("surge.sh")) return;
        checkRestrictedCountry();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location?.pathname]);

    return showRestrictedModal ? (
        <Modal className="restricted-modal" clickOutsideDisabled>
            <img src={require('../../../images/icons/notifications/notice.svg').default} alt="warning" />
            <p>The CVI trading platform is currently restricted for users from your country. For more information, don't hesitate to get in touch with support@coti.io.</p>

            <div className="restricted-modal___actions">
                <Button className="button" onClick={confirmButton} buttonText="OK" />
            </div>
        </Modal>
    ) : null
}

export default RestrictedModal;