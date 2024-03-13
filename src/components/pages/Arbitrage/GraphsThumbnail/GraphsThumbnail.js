import { useIsMobile, useViewport } from "components/Hooks";
import arbitrageConfig from 'config/arbitrageConfig';
import React, { useMemo, useRef, useState } from 'react';
import Container from 'components/Layout/Container';
import TabsForm from 'components/TabsForm';
import { useSelector } from "react-redux";
import './GraphsThumbnail.scss';

const GraphsThumbnail = () => {
    const tabs = useMemo(() => ({
      fulfillment: arbitrageConfig.tabs.graphs['fulfillment'],
      penalty: arbitrageConfig.tabs.graphs['penalty']
    }), []);
    const tabsFormRef = useRef();
    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0] : undefined);
    const isMobile = useIsMobile();

    return useMemo(() => {
        return (
            <Container className="graphs-thumbnail-component">
                <TabsForm 
                  ref={tabsFormRef}
                  className="arbitrage-graphs-tabs"
                  id="graphs"
                  tabs={tabs} 
                  isDropdown={isMobile}
                  activeTab={activeTab} 
                  setActiveTab={(tab) => setActiveTab(tab)}
                >
                  <ActiveGraph 
                    activeTab={activeTab}
                  />
                </TabsForm>
            </Container>
        )
    }, [tabs, isMobile, activeTab])
}

const ActiveGraph = ({activeTab = ""}) => {
    const { width } = useViewport();
    const { selectedNetwork } = useSelector(({app}) => app);

    return useMemo(() => {
      const fulfillGraphSrc = arbitrageConfig.graphsThumbnails[selectedNetwork].fulfill
      const penaltyGraphSrc = arbitrageConfig.graphsThumbnails[selectedNetwork].penalty
      return (
            <div className="graph-wrapper">
              {activeTab.toLowerCase() === 'fulfillment' ? 
                <>
                  <img 
                    className="graph-image" 
                    src={require(`images/graphs/${width <= 767 ? fulfillGraphSrc.mobile : width <= 1365 ? fulfillGraphSrc.tablet : fulfillGraphSrc.desktop}`).default} 
                    alt="Time to fullfillment fee" 
                  />
                  <p className="graph-note">The fee decreases the more the user's time to fulfillment target gets closer to the {arbitrageConfig.timeToFulfillment[selectedNetwork].maxTime} bound.</p>
                </>
                :
                <>
                  <img 
                    className="graph-image" 
                    src={require(`images/graphs/${width <= 767 ? penaltyGraphSrc.mobile : width <= 1365 ? penaltyGraphSrc.tablet : penaltyGraphSrc.desktop}`).default} 
                    alt="Time penalty fee" 
                  />
                  <p className="graph-note">A time penalty fee is introduced if the user fulfills his request prior/after his specified target time.</p>
                </>
              }
            </div> 
        )
    }, [activeTab, selectedNetwork, width]);
}

export default GraphsThumbnail;

