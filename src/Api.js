import axios from 'axios';

const { REACT_APP_HOST_V2: baseUrlV2 } = process.env;

const headers = {
   'Content-Type': 'application/json',
   'cache-control': 'no-cache',
};


const axsV2 = axios.create({
   baseURL: baseUrlV2,
   headers,
});

const Api = {
   GET_FULL_DAILY_HISTORY: (payload) => axsV2.get(`/fullDailyHistory?${payload?.chainName ? `chain=${payload.chainName}&` : ''}${payload?.index ? `index=${payload.index}` : ''}`),
   GET_INDEX_HISTORY: (payload) => axsV2.get(`/history?${payload?.chainName ? `chain=${payload.chainName}&` : ''}${payload?.index ? `index=${payload.index}` : ''}`),
   GET_VOL_INFO: (chainName) => axsV2.get(`/latest?chain=${chainName}`),
   GET_FEES_COLLECTED: (queryParams = "") => axsV2.get('/fees' + queryParams),
   CHECK_RESTRICTED_COUNTRY: () => axsV2.get('/geo'),
   GET_TVL: () => axsV2.get('/tvl'),
};

export default Api;