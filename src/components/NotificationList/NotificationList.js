import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { removeAlert } from 'store/actions';
import { useEffect } from 'react';
import Notification from '../Notification';
import './NotificationList.scss';

const NotificationList = () => {
    const { alerts } = useSelector(({app}) => app);
    const dispatch = useDispatch();
    const maxAlerts = 4;

    const onCloseNotification = (id) => {
        dispatch(removeAlert({id}))
    }

    useEffect(() => {
        if(alerts.length > maxAlerts) {
            dispatch(removeAlert({id: alerts[alerts.length - 1].id}));
        }
        //eslint-disable-next-line
    }, [alerts]);

    return (
        <>
            {alerts.map(({id, alertType, message}) => <Notification key={id} id={id} type={alertType} message={message} closeIcon handleCloseNotification={() => onCloseNotification(id)}/>)}
        </>
    )
}

export default NotificationList;