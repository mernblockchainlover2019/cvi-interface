import Column from 'components/Layout/Column';
import Container from 'components/Layout/Container';
import Layout from 'components/Layout/Layout';
import Row from 'components/Layout/Row';
import { isArray } from 'lodash';
import React, { useMemo } from 'react';
import './PlatformUsecase.scss';

const _platformUsecases = [{
    title: "Trade",
    key: 'trade',
    description: [`Find profitable trading opportunities without committing to the direction of the market.`,
    `If Volatility increases, you make a profit regardless of the price change.`]
  }, {
    title: "Provide liquidity",
    key: 'liquidity',
    description: `Earn a share of all trading transactions fees by providing liquidity to the platform.
    Moreover, profit when volatility decreases.
    `
  }, {
    title: "Stake",
    key: 'stake',
    description: `Gain governance rights and platform fees from all supported chains within a few clicks.`
  }, {
    title: "Arbitrage",
    key: 'arbitrage',
    description: `Maximize revenues from your trading strategies by profit from any deviation between the volatility tokens traded in DEX/AMMs and the CVI Platform.`
}];

const PlatformUsecase = () => {
    return useMemo(() => {
        return (
            <Layout className="platform-usecases-component">
                <Column>
                    <Row>
                        <h2 className="platform-usecases-component__title">Explore CVI Platform</h2>
                    </Row>
                    <Row className="platform-usecases-component__cards-row">
                        {_platformUsecases.map(({title, key, description}) => <UseCase key={key} icon={key} title={title} description={description} />)}
                    </Row>
                </Column>
            </Layout>
        )
    }, []);
}

export const UseCase = ({title, icon, description, type}) => {
    return useMemo(() => {
        return (
            <Container key={type} className="usecase-component">
                {type !== "inner-icon" && <div className="usecase-component__icon">
                    <img src={require(`../../../../images/icons/home/${icon}.svg`).default} alt={icon} />
                </div> }

                <h3>
                    {type === 'inner-icon' && <div className="usecase-component__icon-inner">
                        <img src={require(`../../../../images/icons/home/${icon}.svg`).default} alt={icon} />
                    </div>}
                    {title}
                </h3>
                <p>{
                    // description can be a function
                    typeof description === 'function' ? description() : 
                    isArray(description) // if description is array of strings, it will render a br element in each iteration without the last one.
                    ? description.map((d, i) => <span key={i}>{d} {i !== (description.length -1) && <br/>}</span>) 
                    : description}
                </p>
            </Container>
        )
    }, [title, description, icon, type]);   
}

export default PlatformUsecase;