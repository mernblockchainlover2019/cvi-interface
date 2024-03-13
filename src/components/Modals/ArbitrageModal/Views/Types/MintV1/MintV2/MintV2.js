import Checkbox from 'components/Checkbox';
import FulfillmentInTimer from 'components/pages/Arbitrage/FulfillmentInTimer';
import Stat from 'components/Stat';
import Tooltip from 'components/Tooltip';
import config from 'config/config';
import { upperCase } from 'lodash';
import React from 'react';
import { commaFormatted, customFixed, toDisplayAmount } from 'utils';

const MintV2 = ({
    activeToken,
    requestData,
    preFulfillData,
    errorMessage,
    collateralMint,
    setCollateralMint
}) => {
    return <>
        <Stat
            title="Amount to fullfill"
            className="large-value bold"
            value={requestData.amountToFulfill || "0"}
            _suffix={requestData.symbol}
        />

        <div className="stat-component">
            <h2>Fullfillment in</h2>
            <FulfillmentInTimer fulfillmentIn={requestData.fulfillmentIn} />
        </div>

        {preFulfillData === 'N/A' && errorMessage && !collateralMint && <p className="no-liquidity-msg">{errorMessage}</p>}

        <Checkbox
            className="modal-checkbox"
            onClick={() => setCollateralMint(!collateralMint)}
            title="Collateral mint"
            checked={collateralMint}
            tooltip={<Tooltip
                type="question"
                left="0"
                mobileLeft={-40}
                content={<span>
                    The collateral mint option enables the user to mint {upperCase(activeToken.name)} tokens while providing liquidity to cover the value of the long {upperCase(activeToken.oracleId)} position that those minted {upperCase(activeToken.name)} tokens hold. The liquidity provided is displayed on the platform page under provide liquidity tab. By using collateral mint option user won't be subject to the premium fees.
                </span>}
                maxWidth={400}
            />}
        />

        <Stat
            title="Time to fullfillment and penalty fees"
            className="large-value bold"
            value={preFulfillData === 'N/A' ? '' : preFulfillData}
            format={preFulfillData === 'N/A' ? 'N/A' : `${commaFormatted(customFixed(preFulfillData?.penaltyFeePercentWithTimeDelay?.toString(), 4))}%`} />

        <Stat
            title="Mint fee"
            className="large-value bold"
            value={preFulfillData === 'N/A' ? '' : preFulfillData}
            format={preFulfillData === 'N/A' ? 'N/A' : `${commaFormatted(customFixed(preFulfillData?.openFeePercent?.toString(), 4)) || "-"}%`} />

        <Stat
            name="estimateMint"
            className="large-value bold green"
            value={preFulfillData === 'N/A' ? '' : preFulfillData}
            format={preFulfillData === 'N/A' ? '' : `${customFixed(toDisplayAmount(preFulfillData?.receive?.toString(), activeToken.decimals), 4) || "0"}`}
            _suffix={activeToken.name.toUpperCase()}
            hideTooltip
            actEthvol={activeToken.oracleId === config.volatilityIndexKey.ethvi}
        />

        {collateralMint && <>
            <Stat
                className="large-value bold green no-title"
                value={preFulfillData}
                format={(!preFulfillData?.shortReceive || preFulfillData === 'N/A') ? 'N/A' : `${customFixed(toDisplayAmount(preFulfillData?.shortReceive?.toString(), activeToken.decimals), 4) || "0"}`}
                _suffix={`${activeToken.oracleId.toUpperCase()}-USDC-LP`}
            />

            <p className="modal-note">
                Please note: you won't be able to withdraw your liquidity within the
                next 36 hours.<br />
                You can stake your {activeToken.oracleId.toUpperCase()}-USDC LP tokens to earn GOVI
                rewards.
            </p>
        </>}
    </>
};

export default MintV2;
