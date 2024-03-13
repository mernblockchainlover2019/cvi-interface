import Spinner from 'components/Spinner/Spinner';
import React, { useMemo } from 'react'
import { RowItem } from '.';
import platformConfig from '../../../../config/platformConfig';
import { useIsMobile } from '../../../Hooks';
import { Value } from '../Values';

const StatsRow = ({rowData}) => {
    const { index, liquidityPools, openPositions } = rowData;
    const isMobile = useIsMobile();
    const header = useMemo(() => platformConfig.headers.stats, []);

    return useMemo(() => <tr> 
        <RowItemLoader isLoading={!index}>
            <RowItem 
                isTable
                content={<Value text={`${index}${isMobile ? ' index' : ''}`} />} 
            />
        </RowItemLoader>

        <RowItemLoader isLoading={!liquidityPools}>
            <RowItem 
                isTable
                header={isMobile && header['Liquidity pools'].label}
                tooltip={isMobile && header['Liquidity pools'].tooltip}
                content={liquidityPools?.map((pool, index) => <Value key={index} prefix="$" className="multiline" subText={pool[0]} />)} 
            />
        </RowItemLoader>

        <RowItemLoader isLoading={!openPositions}>
            <RowItem 
                isTable
                header={isMobile && header['Open positions'].label}
                tooltip={isMobile && header['Open positions'].tooltip}
                content={openPositions?.map((pool, index) => <Value key={index} prefix="$" className="multiline" subText={pool[0]} />)} 
            />
        </RowItemLoader> 

    </tr>, [header, index, isMobile, liquidityPools, openPositions])
}

const RowItemLoader = ({children, isLoading}) => {
    return useMemo(() => {
        if(isLoading) return <RowItem 
            isTable
            content={<Spinner className="statistics-spinner" />} 
        />
        return children;
    }, [children, isLoading]);
}

export default StatsRow;