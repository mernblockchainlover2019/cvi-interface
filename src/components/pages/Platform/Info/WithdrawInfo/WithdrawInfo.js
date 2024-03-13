import { useActionController } from 'components/Actions/ActionController';
import { useActiveToken } from 'components/Hooks';
import Spinner from 'components/Spinner/Spinner';
import { useWeb3Api } from 'contracts/useWeb3Api';
import React, { useMemo } from 'react'
import { toBN, toBNAmount, commaFormatted, customFixedTokenValue } from 'utils';
import './WithdrawInfo.scss';

const WithdrawInfo = () => {
    const { token, amount } = useActionController();
    const activeToken = useActiveToken(token);
    const tokenAmount = useMemo(() => toBN(toBNAmount(amount, activeToken.decimals)), [amount, activeToken.decimals]);
    const lpTokenPayload = useMemo(() => ({tokenAmount}), [tokenAmount]);
    const [lpTokenAmount] = useWeb3Api("toLPTokens", token, lpTokenPayload, { validAmount: true })

    return (
        <div className="withdraw-info-component">
            {lpTokenAmount === "N/A" ? <span>N/A</span> : <span>
                You will send {lpTokenAmount === null ? <>&nbsp;<Spinner className="statistics-spinner withdraw-info" />&nbsp;&nbsp;</> : <>{commaFormatted(customFixedTokenValue(lpTokenAmount?.toString(), 2, activeToken.lpTokensDecimals))} CVI-{activeToken.name.toUpperCase()}</>}
                &nbsp;LP and receive  {commaFormatted(amount) || 0} {activeToken.name.toUpperCase()}
                </span>}
          
        </div>
    )
}

export default WithdrawInfo;