import React, { useMemo } from 'react'
import './SubNavbar.scss';
import TabsForm from '../TabsForm';
import { useIsDesktop, useIsTablet } from '../Hooks';

const SubNavbar = ({tabs, setActiveView, activeView}) => {
    const isDesktop = useIsDesktop();
    const isTablet = useIsTablet();

    const ethereumMainAssets = useMemo(() => {
        if(isTablet) return null;
        return <div className="ethereum-main-address-component">
            <span>Need your Ethereum main network assets on Polygon? please visit </span>
            <a 
                href="https://wallet.matic.network/bridge" 
                target="_blank" 
                rel="nofollow noopener noreferrer">
                    Polygon PoS bridge
            </a>
        </div>
    }, [isTablet]); 

    return (
        <div className="sub-navbar-component">
            <TabsForm 
                id="view"
                className="sub-navbar"
                isDropdown={!isDesktop}
                tabs={tabs} 
                activeTab={activeView}
                setActiveTab={(tab) => setActiveView(tab)}
                rightContent={ethereumMainAssets}
            />
        </div>
    )
}

export default SubNavbar;