import React, {useEffect, useState} from 'react';
import moment from 'moment';
import Chart from 'kaktana-react-lightweight-charts';
import Column from 'components/Layout/Column';
import Container from 'components/Layout/Container';
import Layout from 'components/Layout/Layout';
import Row from 'components/Layout/Row';
import { Loading, Error, RangeSelector } from './HelperComponents';
import { options, ranges } from './chartOptions.js';
import useCvi from 'components/Hooks/Cvi';
import { useActiveVolInfo } from "components/Hooks";
import './CVIIndex.scss';


const CVIIndex = () => { // @TODO: use Amir new api for fetching history
  const [data, setData] = useState();
  const [error] = useState();
  const activeVolInfo = useActiveVolInfo();
  const [activeRange, setActiveRange] = useState(ranges[0])

  useCvi();

  const formatGraphData = data => {
    let formatData = data.map(item => ({
      time: moment(item[0]).format('YYYY-MM-DD'), 
      value: item[1]
    })); 

    let timeArr = new Set();
    let result = [];

    formatData.forEach(item => {  // select only different `time` items
      if (!timeArr.has(item.time)) {
        timeArr.add(item.time);
        result.push(item);
      }
    });

    return result;    
  };

  useEffect(() => {
    if (!activeVolInfo) return;
    
    const historyData = activeRange === "Daily" ? (activeVolInfo?.history?.daily ?? []) : activeVolInfo?.history?.hourly ?? [];
    const lineSeries = formatGraphData(historyData);

    setData([{data: lineSeries}]);
  }, [activeVolInfo, activeRange])

  return (
    <Layout className="cviindex-component">
      <Column>
        <Row>
          <Container title="CVI Index">
          {
            error ?
              <Error message={error}/>
            :
              <>
                {
                  data ?
                    <div className="cviindex-component__chart-container">
                      <RangeSelector ranges={ranges} activeRange={activeRange} onClick={setActiveRange}/>
                      <Chart
                        options={options}
                        lineSeries={data}
                        darkTheme
                        height={350}
                        autoWidth
                      />
                    </div>  
                  :
                    <Loading />
                }
              </>
          }
          </Container>
        </Row>
      </Column>
    </Layout>
  );
}

export default CVIIndex;
