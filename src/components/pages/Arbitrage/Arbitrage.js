import React, { useState, useMemo, useEffect } from "react";
import { appViewContext } from "components/Context";
import SubNavbar from "components/SubNavbar";
import Layout from "components/Layout/Layout";
import Row from "components/Layout/Row";
import arbitrageConfig from "config/arbitrageConfig";
import ArbitrageTables from "./ArbitrageTables/ArbitrageTables";
import config from "config/config";
import ActiveSection from "./ActiveSection";
import MainSection from "components/MainSection";
import useCvi from 'components/Hooks/Cvi';
import Statistics from "./Statistics";
import { useActiveToken } from "components/Hooks";
import useArbitrageEvents from "components/Hooks/useArbitrageEvents";
import useCviSdk from "components/Hooks/CviSdk";
import "./Arbitrage.scss";
import { useSelector } from "react-redux";
import { chainNames } from "connectors";
import Column from "components/Layout/Column";
import MintBurnSection from "./MintBurnSection";

const Arbitrage = () => {
  useCvi();
  const [activeView, setActiveView] = useState();
  const [activeTokenKey, setActiveTokenKey] = useState();
  const activeToken = useActiveToken(activeTokenKey, config.routes.arbitrage.path);
  const { selectedNetwork } = useSelector(({app}) => app);
  const w3 = useCviSdk();
  useArbitrageEvents(w3, activeToken);

  useEffect(() => {
    if (selectedNetwork === chainNames.Matic) {
      setActiveTokenKey(arbitrageConfig.tokens[selectedNetwork].cvol.key);
    }
  }, [selectedNetwork])
  
  const ArbitrageEthereum = useMemo(() => (
    <>
      <SubNavbar
        tabs={Object.keys(arbitrageConfig.tabs["sub-navbar"])}
        activeView={activeView}
        setActiveView={setActiveView} 
      />

      <appViewContext.Provider value={{ activeView, w3, activeToken }}>
        <Layout>
          <Row className="statistics-row-component">
            <Statistics />
          </Row>

          <Row flex="100%">
            <MainSection path={config.routes.arbitrage.path} cb={(tab) => setActiveTokenKey(tab)}>
              <ActiveSection />
            </MainSection>
          </Row>

          <Row>
            <ArbitrageTables />
          </Row>
        </Layout>
      </appViewContext.Provider>
    </>
  ), [activeToken, activeView, setActiveView, w3]);

  const ArbitragePolygon = useMemo(() => (
    <>
      <appViewContext.Provider value={{ activeView, w3, activeToken }}>
        <Layout>
          <Row className="statistics-row-component">
            <Statistics />
          </Row>

          <Row flex="100%">
            <Column className="mint-burn-column-component">
              <MintBurnSection tabs={Object.keys(arbitrageConfig.tabs["sub-navbar"])} setActiveView={setActiveView}/>
            </Column>
            <Column className="arbitrage-table-column-component">
              <ArbitrageTables />
            </Column>
          </Row>
        </Layout>
      </appViewContext.Provider>
    </>
  ), [activeToken, activeView, setActiveView, w3]);

  return useMemo(() => (
    <div className="arbitrage-component">
      {selectedNetwork === chainNames.Matic ? ArbitragePolygon : ArbitrageEthereum}   
    </div>
  ), [selectedNetwork, ArbitragePolygon, ArbitrageEthereum]);
};

export default Arbitrage;
