import _, { uniqWith, isEqual } from 'lodash';
import * as actionTypes from '../actions/types';

const initialState = {
    positions: null,
    liquidities: null,
    arbitrage: null,
    unfulfilledRequests: null
};

const setData = (state, {view, data, isUpdate, existKey = "transactionHash"}) => {
    if(isUpdate) {
        if(data instanceof Array) {
            if(state[view]?.length > 0) {
                return {
                    ...state,
                    [view]: [
                        ..._(state[view])
                            .keyBy(existKey)
                            .merge(_.keyBy(data, existKey))
                            .values()
                            .sort((a, b) => (b.timestamp < a.timestamp) ? -1 : 1)
                    ]
                }
            }
            return {
                ...state, 
                [view]: data
            }
        }
       
        const txExist = state[view]?.some((event)=> event[existKey] === data[existKey]);
        return txExist ? state : {
            ...state,
            [view]: [data, ...state[view] ?? []]
        }
    }

    if(state[view]) {
        return data.length < state[view].length ? {
            ...state,
            [view]: data
        } : { 
            ...state,
            [view]: uniqWith(state[view].concat(data), isEqual).sort((a, b) => (b.timestamp < a.timestamp) ? -1 : 1)
        }
    }

    return { 
        ...state,
        [view]: data
    }
}

export const walletReducer = (state = initialState, action) => {
    switch ( action.type ) {
        case actionTypes.SET_DATA: return setData(state, action)
        default:
            return state;
    }
};