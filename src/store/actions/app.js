import * as actionTypes from '../actions/types';

export const addAlert = ({id, eventName, alertType, message}) => ({
  type: actionTypes.ADD_ALERT,
  payload: {
    id,
    eventName,
    alertType,
    message,
  }
});

export const removeAlert = ({id = null}) => ({
  type: actionTypes.REMOVE_ALERT,
  payload: {
    id,
  }
});

export const setSelectNetwork = (selectedNetwork) => ({
  type: actionTypes.SET_SELECT_NETWORK, 
  selectedNetwork
});

export const setNetworkStatus = (status) => ({
  type: actionTypes.SET_NETWORK_STATUS, 
  status
});

export const setVolInfo = (data) => ({
  type: actionTypes.SET_VOL_INFO,
  data,
});

export const updateVolInfo = (data, key) => ({
  type: actionTypes.UPDATE_VOL_INFO,
  data,
  key
});

export const setMigrationModalOpen = (migrationModalIsOpen, migrationModalInitiallized) => ({
  type: actionTypes.SET_MIGRATION_MODAL_IS_OPEN,
  migrationModalIsOpen,
  migrationModalInitiallized
});

export const setGoviMigrationModalOpen = (goviMigrationModalIsOpen, goviMigrationModalInitiallized) => ({
  type: actionTypes.SET_GOVI_MIGRATION_MODAL_IS_OPEN,
  goviMigrationModalIsOpen,
  goviMigrationModalInitiallized
});