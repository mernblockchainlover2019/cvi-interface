import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../Elements/Button';
import platformConfig from 'config/platformConfig';
import { uniqueId } from 'lodash';
import { track } from 'shared/analytics';
import config from 'config/config';
import './Tabs.scss';

const Tabs = ({enableOnly, type = "default", suffix = "", prefix, isDropdown, tabs, activeTab, setActiveTab}) => {
    const [isOpen, setIsOpen] = useState();
    const [isClicked, setIsClicked] = useState(false);
    const isArray = tabs instanceof Array;
    const _tabsKeys = isArray ? tabs : Object.keys(tabs);

    const formattedTabs = useMemo(
        () => Object.values(platformConfig.tabs).reduce((a, b) => ({...a, ...b})), 
    []);

    useEffect(() => {
        if(_tabsKeys.includes(enableOnly)) {
            setActiveTab(enableOnly);
        }
    }, [enableOnly, _tabsKeys, setActiveTab]);

    const onTabChange = useCallback((tab) => {
        if(enableOnly === tab) return;
        setActiveTab(tab);
        track(`${tab} tab`);
    }, [enableOnly, setActiveTab])

    const onClickDropdown = useCallback(() => {
        if(!isDropdown) return;
        setIsOpen(!isOpen);
    }, [isDropdown, isOpen])
   
    return useMemo(() => {
        const renderTabs = () => {
            return _tabsKeys.map((tab, index) => {
                const volLabel = (config.volatilityIndexKey[tab] || config.volatilityTokenKey[tab]) ? `${tab.toUpperCase()}${prefix ? ` ${prefix}` : ''}` : undefined;
                const tabLabel = formattedTabs[tab] ?? volLabel ?? tab;

                return <Button
                    key={uniqueId(tab)} 
                    className={`tabs-component__tab ${(tab === activeTab || index === activeTab) ? 'active' : ''} ${isClicked ? "clicked" : ""}`}
                    buttonText={`${suffix}${isArray ? tabLabel : tabs?.[tab]}`} 
                    disabled={enableOnly && enableOnly !== "0" && enableOnly !== tab}
                    onClick={() => {
                        onTabChange(_tabsKeys[index])
                        setIsClicked(true)
                    }}
                />
            })
        }

        return (
            <div className={`tabs-component ${type ?? ''}`}
                onClick={() => {
                    onClickDropdown()
                    setIsClicked(true)
                }}>
                {isDropdown ? <div className={`tabs-component__dropdown ${isOpen ? 'is-open' : ''}`}> 
                    <div className={`tabs-component__dropdown--header ${isOpen ? 'is-open' : ''}`}>
                        <span className={`tabs-component__tab ${isClicked ? "clicked" : ""}`}>{formattedTabs[activeTab] ?? tabs?.[activeTab] ?? activeTab}</span>
                        <img src={require(`../../images/icons/dropdown-chevron.svg`).default} alt="chevron" />
                    </div>
    
                    {isOpen && <div className="tabs-component__dropdown--options">
                        {_tabsKeys?.map((tab, index) => <Button
                            key={uniqueId(tab)}
                            style={{
                                color: `${tab === activeTab || index === activeTab ? '#fea716' : ''}`,
                                textShadow: `${tab === activeTab || index === activeTab ? 'none' : ''}`,
                                borderBottom: `${tab === activeTab || index === activeTab ? 'none' : ''}`,
                                fontWeight: `${tab === activeTab || index === activeTab ? 'normal' : ''}`,
                                animation: `${tab === activeTab || index === activeTab ? 'none' : ''}`
                            }}
                            className={`tabs-component__tab ${(tab === activeTab || index === activeTab) ? 'active' : ''} ${isClicked ? "clicked" : ""}`}
                            buttonText={formattedTabs[tab] ?? tabs?.[tab] ?? tab} 
                            onClick={() => {
                                onTabChange(tab)
                                setIsClicked(true)
                            }}
                        />)}
                    </div>}
                </div> : <> 
                    {renderTabs()}
                </>}
            </div>
        )
    }, [type, isDropdown, isOpen, isClicked, formattedTabs, activeTab, tabs, _tabsKeys, prefix, suffix, isArray, enableOnly, onTabChange, onClickDropdown]);
}

export default Tabs;