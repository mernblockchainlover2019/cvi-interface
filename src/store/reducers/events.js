import * as actionTypes from '../actions/types';

const initialState = {
    actionConfirmed: 0
};

export const eventsReducer = (state = initialState, action) => {
    switch ( action.type ) {
        case actionTypes.ADD_EVENT: {
            return state[action.contractName] ? {...state, 
                [action.contractName] : {
                    ...state[action.contractName],
                    [action.eventName]: state[action.contractName][action.eventName] ? {
                        ...state[action.contractName][action.eventName],
                        events: [...state[action.contractName][action.eventName].events, action.eventObj]
                    } : {
                        events: [action.eventObj]
                    }
                }
            } : {
                ...state,
                [action.contractName] : {
                    [action.eventName]: {
                        events: [action.eventObj]
                    }
                }
            }
        }

        case actionTypes.ACTION_CONFIRMED: {
            return {
                ...state,
                actionConfirmed: state.actionConfirmed +1
            }
        }

        default:
            return state;
    }
};