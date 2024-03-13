import React from 'react';
import { useEffect } from 'react';
import ReactDOM from "react-dom";
import { useDispatch } from 'react-redux';
import { removeAlert } from 'store/actions/app.js';
import './Notification.scss';

const notificationRoot = document.getElementById("notification-root");

const Notification = ({id, type, className, message, closeIcon, handleCloseNotification}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        setTimeout(() => {
            dispatch(removeAlert({id}));
        }, 4000);
        //eslint-disable-next-line
    }, []);

    let image = require(`../../images/icons/notifications/${type.toLowerCase()}.svg`).default;
    let closeImage = require("../../images/icons/notifications/close.svg").default;

    return ReactDOM.createPortal(
        <div {...id ? {id: id} : {}} className={`notification ${className}`}>
          <div className="notification__container">
              {closeIcon && <button className="close-button" onClick={handleCloseNotification}>
                <img src={closeImage} alt="close icon" />
              </button> }

              {type && <img className="notification__container--image" src={image} alt="close icon" /> }

              <span className="notification__container--message">{message}</span>
          </div>
        </div>,
        notificationRoot
    );
}

export default Notification;