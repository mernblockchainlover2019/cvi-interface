import { contractState } from "components/Hooks/useHistoryEvents";
import config from "config/config";
import { getChainName } from "contracts/utils";
import * as TheGraph from 'graph/queries';
import moment from "moment";
import { toBN, toDisplayAmount } from "utils";
import { DEFAULT_STEPS } from '../../components/Hooks/useEvents';
import { chainsData } from 'connectors';

export async function toLPTokens(contracts, token, { tokenAmount }) {
  let totalSupply = toBN(await contracts[token.rel.platform].methods.totalSupply().call());
  let totalBalance;
  if(token.type === "v3" || token.type === "usdc") {
    totalBalance = toBN(await contracts[token.rel.platform].methods.totalBalance(true).call());
  } else {
    totalBalance = toBN(await contracts[token.rel.platform].methods.totalBalanceWithAddendum().call());
  }
  return totalBalance.isZero() ? toBN(0) : tokenAmount.mul(totalSupply).div(totalBalance);
}

async function getLiquidityPNL(contracts, token, {account, library, eventsUtils}) {

  try {
    let events = [];
    const isUSDC = token.name === "usdc";
    if(config.isMainnet) {
      events = await TheGraph.account_liquidities(account, contracts[token.rel.platform]._address);
      const migrationsTokens = ['usdc','usdt'];
      if(migrationsTokens.includes(token.key.toLowerCase())) {
        const migrationEvents = await eventsUtils.getMigrationEvents(account, token.key);
        console.log(migrationEvents);
        const actionType =  isUSDC ? "deposits" : "withdraws";
        events[actionType] = events[actionType].concat(migrationEvents);
      }
      events = Object.values(events).map((_events, idx) => _events.map((event) => ({...event, event: Object.keys(contractState.liquidities)[idx]}))).flat();
    } else {
      events = await TheGraph.account_liquidities(account, contracts[token.rel.platform]._address);
      events = Object.values(events).map((_events, idx) => _events.map((event) => ({...event, event: ["deposits", "withdraws"][idx]}))).flat();
      const chainName = await getChainName();
      let options = {};
      const {number: latestBlockNumber, timestamp: latestTimestamp} = await (await library.eth.getBlock("latest"));
      const oneWeekBeforeLastestTimestamp = moment(latestTimestamp*1000).subtract(1, "week").valueOf()
      const oneWeekBeforeBlockNumber = latestBlockNumber - Math.floor((((latestTimestamp*1000) - oneWeekBeforeLastestTimestamp) / 1000) / chainsData[chainName].blockRate) 
      // const stepSize = latestBlockNumber - oneWeekBeforeBlockNumber;
      events = events.filter(event => event.blockNumber < oneWeekBeforeBlockNumber);
      // console.log('events: ', events);
      options = { stepSize: 9999, steps: DEFAULT_STEPS, days: 7 }
      const filters = { Deposit: [{ account }], Withdraw: [{ account }] };
      const eventsData = [{ contract: contracts[token.rel.platform], events: filters }];
      const latestEvents = await eventsUtils.getEventsFast(eventsData, options);
      events = events.concat(latestEvents);
    }

    events.sort((a, b) => toBN(a.blockNumber).cmp(toBN(b.blockNumber)));
    
    let depositSum = toBN(0);
    let withdrawSum = toBN(0);
    let lpTokenSum = toBN(0);
    events.forEach((_event) => {
      const eventName = _event.event;
      const event = _event.returnValues ?? _event;

      switch (eventName) {
        case 'deposits': {
          depositSum = depositSum.add(toBN(event.tokenAmount.toString()));
          lpTokenSum = lpTokenSum.add(toBN(event.lpTokensAmount.toString()));
          break;
        }

        case 'withdraws': {
          withdrawSum = withdrawSum.add(toBN(event.tokenAmount.toString()));
          lpTokenSum = lpTokenSum.sub(toBN(event.lpTokensAmount.toString()));
          if (lpTokenSum.isZero()) {
            depositSum = toBN(0);
            withdrawSum = toBN(0);
            lpTokenSum = toBN(0);
          }
          break;
        }

        case 'Deposit': {
          depositSum = depositSum.add(toBN(event.tokenAmount.toString()));
          lpTokenSum = lpTokenSum.add(toBN(event.lpTokensAmount.toString()));
          break;
        }

        case 'Withdraw': {
          withdrawSum = withdrawSum.add(toBN(event.tokenAmount.toString()));
          lpTokenSum = lpTokenSum.sub(toBN(event.lpTokensAmount.toString()));
          if (lpTokenSum.isZero()) {
            depositSum = toBN(0);
            withdrawSum = toBN(0);
            lpTokenSum = toBN(0);
          }
          break;
        }

        default:
            break;
        }
      });
      
      let totalSum = depositSum.sub(withdrawSum);
      let lpBalance = toBN(await contracts[token.rel.platform].methods.balanceOf(account).call());
      const stakedAmount = toBN(await contracts[token.rel.stakingRewards].methods.balanceOf(account).call());
      if(stakedAmount) {
          lpBalance = lpBalance.add(stakedAmount);
      }

      let totalSupply = toBN(await contracts[token.rel.platform].methods.totalSupply().call());
      let totalBalance;
      if(token.type === "v3" || token.type === "usdc") {
        totalBalance = toBN(await contracts[token.rel.platform].methods.totalBalance(true).call());
      } else {
        totalBalance = toBN(await contracts[token.rel.platform].methods.totalBalanceWithAddendum().call());
      }

      let tokenAmount = totalSupply !== 0 ? lpBalance.mul(totalBalance).div(totalSupply) : toBN(0);
      
      let pnl = tokenAmount.sub(totalSum);
      let pnlPercent = 0;

      try {
          pnlPercent = !depositSum.isZero() ? toDisplayAmount(toBN(pnl.toString(), 4).div(depositSum), 2) : 0;
      } catch(error) {
          console.log(error);
      }

    return { amount: pnl.toString(), percent: pnlPercent };
  } catch(error) {
    console.log(error);
    return "N/A";
  }
}

async function getPoolSize(contracts, token) {
  if(token.type === "v3" || token.type === "usdc") {
    return await contracts[token.rel.platform].methods.totalBalance(true).call();
  }
  return await contracts[token.rel.platform].methods.totalBalance().call();
}

const liquidityApi = {
  toLPTokens,
  getLiquidityPNL,
  getPoolSize
}

export default liquidityApi;