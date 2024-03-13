import { uniqueId } from 'lodash';
import { track } from 'shared/analytics';
import * as actionTypes from '../actions/types';
import { chainNames } from 'connectors';
import config from 'config/config';

const initialState = {
    alerts: [],
    selectedNetwork: chainNames[localStorage.getItem('selectedNetwork')] || chainNames.Ethereum,
    networkStatus: 'disconnected',
    migrationModalIsOpen: false,
    migrationModalInitiallized: false,
    goviMigrationModalIsOpen: false,
    goviMigrationModalInitiallized: false,
    indexInfo: {
        cvi: null,
        ethvi: null,
    },
};

export const appReducer = (state = initialState, action) => {
    switch ( action.type ) {
        case actionTypes.ADD_ALERT: {
            if(action.payload.eventName)  {
                track(action.payload.eventName);
            }
            return {...state, alerts: [...state.alerts, {...action.payload, id: uniqueId(`${action.payload.id}-`)}]}
        }
        case actionTypes.REMOVE_ALERT: {
            return {...state, alerts: state.alerts.filter(alert => alert.id !== action.payload.id)};
        }
        case actionTypes.SET_SELECT_NETWORK: {
            if(!chainNames[action.selectedNetwork]) return state; 
            localStorage.setItem('selectedNetwork', action.selectedNetwork);
            return { ...state, selectedNetwork: action.selectedNetwork}
        }
        case actionTypes.SET_NETWORK_STATUS: {
            if(!config.networkStatuses[action.status]) return state;
            return { ...state, networkStatus: action.status}
        }
        case actionTypes.SET_VOL_INFO: {
            return { 
                ...state, 
                indexInfo: {
                    ...state.indexInfo,
                    ...action.data
                }
            }
        }
        case actionTypes.UPDATE_VOL_INFO: {
            return { 
                ...state, 
                indexInfo: {
                    ...state.indexInfo,
                    [action.key]: action.data === null ? null : {
                        ...state.indexInfo[action.key],
                        ...action.data
                    }
                }
            }
        }
        case actionTypes.SET_MIGRATION_MODAL_IS_OPEN: {
            return {
                ...state,
                migrationModalIsOpen: action.migrationModalIsOpen,
                migrationModalInitiallized: state.migrationModalInitiallized || action.migrationModalInitiallized 
            };
        }
        case actionTypes.SET_GOVI_MIGRATION_MODAL_IS_OPEN: {
            return {
                ...state,
                goviMigrationModalIsOpen: action.goviMigrationModalIsOpen,
                goviMigrationModalInitiallized: state.goviMigrationModalInitiallized || action.goviMigrationModalInitiallized 
            };
        }
        default:
            return state;
    }
};