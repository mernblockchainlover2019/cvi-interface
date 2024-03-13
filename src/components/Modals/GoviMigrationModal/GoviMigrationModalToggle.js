import { useInDOM } from 'components/Hooks';
import { useActiveWeb3React } from 'components/Hooks/wallet';
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setGoviMigrationModalOpen } from 'store/actions';
import GoviMigrationModal from '.';
import { useCallback } from 'react';
import { toBN } from 'utils';
import useCviSdk from 'components/Hooks/CviSdk';

const GoviMigrationModalToggle = () => {
    const isActiveInDOM = useInDOM();
    const dispatch = useDispatch();
    const { account } = useActiveWeb3React();
    const { goviMigrationModalIsOpen, goviMigrationModalInitiallized } = useSelector(({app}) => app);
    const [isStakedGovi, setIsStakedGovi] = useState();
  
    const w3 = useCviSdk();

    const isGoviStaker = useCallback(async () => {
        try {
            if(!w3?.stakings?.["Staking"]) return;
            const stakedBalance = await w3.stakings["Staking"].staked(account);
            if(!isActiveInDOM()) return; 
            const hasStakeAmount = stakedBalance?.stakedAmount?.gt(toBN("0"));
            setIsStakedGovi(hasStakeAmount);
        } catch(error) {
            console.log(error);
        }
    }, [account, w3?.stakings, isActiveInDOM])

    useEffect(() => {
        if(!w3 || !account) return;
        isGoviStaker();
    }, [w3, account, isGoviStaker]);

    useEffect(() => {
        if(!account || goviMigrationModalInitiallized || !isStakedGovi) return;
        dispatch(setGoviMigrationModalOpen(true, true));
    }, [account, goviMigrationModalInitiallized, isStakedGovi, dispatch]);

    return useMemo(() => goviMigrationModalIsOpen && (
        <GoviMigrationModal />
    ), [goviMigrationModalIsOpen]);
}

export default GoviMigrationModalToggle;