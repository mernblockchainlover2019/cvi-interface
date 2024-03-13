import Container from 'components/Layout/Container';
import IndexStats from 'components/pages/Platform/IndexStats';
import Graphs from 'components/pages/Platform/Graphs';
import React, { useMemo } from 'react';
import CommentsSection from '../CommentsSection';
import platformConfig from 'config/platformConfig';
import './CviChartAndData.scss';

const CviChartAndData = () => {
    
    return useMemo(() => {
        return (
            <Container className="cvi-index-chart-and-data-component">
                <CommentsSection />
                <h3>CVI Index Chart & Data</h3>
                <IndexStats type="home" />
                <Graphs tabs={[platformConfig.tabs.graphs.index]} />
            </Container>
        )
    }, []);
}

export default CviChartAndData;