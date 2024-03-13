import { stakingViewContext } from 'components/Context';
import { useIsTablet } from 'components/Hooks';
import useAssets from 'components/Hooks/useAssets';
import DataController from 'components/Tables/DataController';
import ExpandList from 'components/Tables/ExpandList';
import Table from 'components/Tables/Table';
import { stakingProtocols, stakingViews } from 'config/stakingConfig';
import React, { useContext, useMemo } from 'react'
import './StakingAssets.scss';

const StakingAssets = ({type}) => {
    const { w3 } = useContext(stakingViewContext);
    const filteredAssets = useAssets(type, w3);

    return useMemo(() => {
        const tableLpTokensSubHeaderPosition = filteredAssets?.filter(({protocol}) => protocol === stakingProtocols.platform)?.length;
        const tableSubHeaders = {
            0: "Platform tokens",
            [tableLpTokensSubHeaderPosition]: "Liquidity mining"
        }

        return (
            <div className="staked-assets-component">
                <DataController
                    activeTab={type} 
                    data={filteredAssets} 
                    showPaginator={type === stakingViews.staked} 
                    authGuard={type === stakingViews.staked}
                    subHeaders={tableLpTokensSubHeaderPosition && tableSubHeaders}
                >
                    <DataView />
                </DataController>
            </div>
        )
    }, [filteredAssets, type]);
}

const DataView = () => {
    const isTablet = useIsTablet();
    return useMemo(() => {
        return isTablet ? <ExpandList /> : <Table />
    }, [isTablet]);
}

export default StakingAssets;