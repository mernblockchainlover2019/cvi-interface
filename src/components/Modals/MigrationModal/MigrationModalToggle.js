import React, { useMemo } from 'react'
import { useSelector } from 'react-redux';
import MigrationModal from '.';
import useCviSdk from 'components/Hooks/CviSdk';

const MigrationModalToggle = () => {
    const { migrationModalIsOpen } = useSelector(({app}) => app);
    const w3 = useCviSdk();

    return useMemo(() => {
        return migrationModalIsOpen && (
            <MigrationModal w3={w3} />
        )
    }, [migrationModalIsOpen, w3]);
}

export default MigrationModalToggle;