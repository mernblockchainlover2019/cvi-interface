import Container from 'components/Layout/Container';
import React, { useMemo } from 'react';
import './VolatilityToken.scss';

const VolatilityToken = () => {
    return useMemo(() => {
        return (
            <Container className="volatility-token-component">
                <h3>Volatility Tokens</h3>
                <p>
                    Volatility tokens bring a new and innovative concept for trading volatility while making the CVI eco-system composable with the greater DeFi ecosystem. <br/><br/>
                    The architecture is based on the first of their kind - funding fee adjusted leveraged rebased volatility tokens. The token is adjusted by funding fees and is being rebased to keep it pegged to the index. <br/><br/>
                    In addition, arbitrageurs can mint and burn tokens, thereby causing the price on decentralized exchanges to follow the token's intrinsic value in the CVI platform. <br/><br/>
                    ‌By combining these two methods, the volatility tokens remain pegged to the index over time, allowing any user to buy and sell the tokens on secondary markets, such as Uniswap/Sushiwap/Quickswap. <br/><br/>
                </p>
            </Container>
        )
    }, []);
}

export default VolatilityToken;