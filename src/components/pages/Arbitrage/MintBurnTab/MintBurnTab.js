import React from 'react'
import './MintBurnTab.scss';
import TabsForm from 'components/TabsForm';

const MintBurnTab = ({tabs, setActiveView, activeView}) => {
    return (
        <div className="mint-burn-tab-component">
            <TabsForm 
                className="sub-navbar"
                tabs={tabs} 
                activeTab={activeView}
                setActiveTab={(tab) => setActiveView(tab)}
            />
        </div>
    )
}

export default MintBurnTab;