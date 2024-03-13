import { customFixed, toBN, toDisplayAmount } from "utils";

const commonApi = {
    getTradersPoolSize: (balance, totalBalanceWithAddendum) => { // Traders pool size
        if(balance === "N/A" || totalBalanceWithAddendum === "N/A") return "N/A";
        if(!balance || !totalBalanceWithAddendum) return null;
        const openPositions = toBN(balance).sub(toBN(totalBalanceWithAddendum));
        return openPositions.lt(toBN("0")) ? "0" : customFixed(toDisplayAmount(openPositions.toString(), 6), 2);
    },
}

export default commonApi;