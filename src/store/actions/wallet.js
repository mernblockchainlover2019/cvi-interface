import * as actionTypes from '../actions/types';

export const setData = (view, data, isUpdate = false, existKey) => ({
  type: actionTypes.SET_DATA, view, data, isUpdate, existKey
});
