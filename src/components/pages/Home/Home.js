import React, { useMemo } from "react";
import Header from "./Header";
import PlatformUsecase from "./PlatformUsecase";
import { UseCase } from "./PlatformUsecase/PlatformUsecase";
import Row from "components/Layout/Row";
import useCvi from "components/Hooks/Cvi";
import CviChartAndData from "./CviChartAndData";
import "./Home.scss";
import { useScript } from "components/Hooks";

const Home = () => {
  useCvi();
  useScript("https://crypto.com/price/static/widget/index.js")
 
  return useMemo(() => {
    return (
      <div className="home-component">
        <Header />
        <PlatformUsecase />

        <Row className="graph-section">
          <CviChartAndData />
        </Row>

        <Row className="govi-dao-row">
          <UseCase
            type="inner-icon"
            icon="govi-dao"
            title="GOVI DAO token"
            description={() => (<> 
                <span>
                  CVI includes a decentralized governance component, where holders
                  of the GOVI token can vote on matters such as the tradable
                  assets, leverage used, deposit amounts, platform fees, and more.<br/>
                  By staking their GOVI tokens, GOVI holders will
                  also earn a share of the fees collected from the CVI platform.
                </span>
                <div className="crypto-com-widget">
                  <span id="crypto-widget-CoinList" data-transparent="true" data-theme="dark" data-design="classic" data-coins="govi"/>
                </div>
            </>
            )}
          />

          <UseCase
            type="inner-icon"
            icon="volatility-token"
            title="Volatility Tokens"
            description={() => (
              <span>
                Volatility tokens bring a new and innovative concept for trading
                volatility while making the CVI eco-system composable with the
                greater DeFi ecosystem. <br /> <br />
                The architecture is based on the first of its kind funding fee
                adjusted and rebased volatility tokens. <br />
                Therefore, the tokens remain pegged to the index over time,
                allowing any user to buy and sell the tokens on secondary
                markets.
              </span>
            )}
          />
        </Row>
      </div>
    );
  }, []);
};

export default Home;
