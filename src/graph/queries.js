import { getGraphEndpoint } from "contracts/utils";
import { request, gql } from "graphql-request";

const allPlatformEventsQuery = gql`
  {
    openPositions(orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      account
      tokenAmount
      feeAmount
      positionUnitsAmount
    }
    closePositions(orderBy: timestamp, orderDirection: desc) {
      id
      timestamp
      account
      tokenAmount
      feeAmount
      positionUnitsAmount
    }
  }
  {
    deposits(orderBy: timestamp, orderDirection: desc) {
      timestamp
      account
      tokenAmount
      feeAmount
      lpTokensAmount
    }
    withdraws(orderBy: timestamp, orderDirection: desc) {
      timestamp
      account
      tokenAmount
      feeAmount
      lpTokensAmount
    }
  }
`;

const accountPositionsQuery = gql`
  query getPositions($account: String!, $platformAddress: String!, $fromTimestamp: BigInt! = 0) {
    openPositions(
      where: { account: $account, platformAddress: $platformAddress, timestamp_gt: $fromTimestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      leverage
      cviValue
      blockNumber
      timestamp
      account
      tokenAmount
      feeAmount
      positionUnitsAmount
    }
    closePositions(
      where: { account: $account, platformAddress: $platformAddress, timestamp_gt: $fromTimestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      leverage
      cviValue
      blockNumber
      timestamp
      account
      tokenAmount
      feeAmount
      positionUnitsAmount
    }
  }
`;

const accountLiquidityQuery = gql`
  query getLiquidity($account: String!, $platformAddress: String!, $fromTimestamp: BigInt! = 0) {
    deposits(
      where: { account: $account, platformAddress: $platformAddress, timestamp_gt: $fromTimestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      account
      blockNumber
      tokenAmount
      feeAmount
      lpTokensAmount
    }
    withdraws(
      where: { account: $account, platformAddress: $platformAddress, timestamp_gt: $fromTimestamp }
      orderBy: timestamp
      orderDirection: desc
    ) {
      id
      timestamp
      account
      blockNumber
      tokenAmount
      feeAmount
      lpTokensAmount
    }
  }
`;

const collectedFeesQuery = gql`
  query getCollectedFees($fromTimestamp: BigInt! = 0) {
    collectedFees(
      where: { timestamp_gt: $fromTimestamp }
      first: 1000,
      orderBy: timestamp, 
      orderDirection: desc
    ) {
      id
      timestamp
      token
      tokenAddress
      account
      tokenAmount
    }
  }
`;

const lastOpenQuery = gql`
  query getPositions($account: String!, $platformAddress: String!) {
    openPositions(where: { account: $account, platformAddress: $platformAddress }, first: 1, orderBy: timestamp, orderDirection: desc) {
      id
      blockNumber
      cviValue
      timestamp
      account
      tokenAmount
      feeAmount
      positionUnitsAmount
    }
  }
`;

const collectedFeesAggregationsQuery = gql`
  {
    collectedFeesAggregations(first: 10) {
      id
      sum
    }
  }
`;

const accountMigrationsQuery = gql`
  query getMigrations($account: String!, $fromTimestamp: BigInt! = 0, $toTimestamp: BigInt! = 0) {
    migrations(where: { account: $account, timestamp_gte: $fromTimestamp, timestamp_lte: $toTimestamp }, orderBy: timestamp, orderDirection: desc) {
      id
      account
      oldPlatformAddress
      newPlatformAddress
      oldLPTokensAmount
      newLPTokensAmount
      oldTokensAmount
      newTokensAmount
      rewardAmount
      blockNumber
      timestamp
    }
  }
`;

export async function account_liquidities(account, platformAddress, fromTimestamp) {
  return await request(await getGraphEndpoint(), accountLiquidityQuery, { account, platformAddress, fromTimestamp });
}

export async function account_positions(account, platformAddress, fromTimestamp) {
  return await request(await getGraphEndpoint(), accountPositionsQuery, { account, platformAddress, fromTimestamp });
}

export async function lastOpen(account, platformAddress) {
  return await request(await getGraphEndpoint(), lastOpenQuery, { account, platformAddress });
}

export async function allPlatformEvents() {
  return await request(await getGraphEndpoint(), allPlatformEventsQuery);
}

export async function collectedFees(fromTimestamp = 0) {
  return await request(await getGraphEndpoint("fees"), collectedFeesQuery, { fromTimestamp });
}

export async function collectedFeesSum() {
  return await request(await getGraphEndpoint("fees"), collectedFeesAggregationsQuery);
}

export async function migrations(account, fromTimestamp=1637013600, toTimestamp=(new Date().getTime()/1000).toFixed(0)) { // fromTimestamp === migration publish time - 1 day
  return await request(await getGraphEndpoint(), accountMigrationsQuery, { account, fromTimestamp, toTimestamp});
}