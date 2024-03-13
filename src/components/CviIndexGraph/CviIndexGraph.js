import React, { useState, useEffect, useContext } from "react";
import ChartOptions from "./ChartOptions";
import { useRef } from "react";
import { viewportContext } from "components/Context";
import { useActiveVolInfo } from "components/Hooks";
import "./CviIndexGraph.scss";
import Spinner from "components/Spinner/Spinner";

const chartInitialize = {
    id: "vix-graph"
}

const CviIndexGraph = ({activeVolIndex, maxWidth = 700, maxHeight = 370}) => {
    const ref = useRef();
    const [chart, setChart] = useState();
    const { width: windowWidth } = useContext(viewportContext);
    const [activeRange, setActiveRange] = useState();
    const activeVolInfo = useActiveVolInfo(activeVolIndex);

    useEffect(() => {
        const getChartSize = () => {
            return window.innerWidth < 767 ? {
                width: maxWidth,
                height: maxHeight
            } : {
                width: maxWidth,
                height: maxHeight
            }
        } 

        if(chart) {
            const {width, height } = getChartSize();
            chart.setSize(width > maxWidth ? maxWidth : width, height);
            chart.redraw();
        }
        //eslint-disable-next-line
    }, [windowWidth, chart]);

    useEffect(()=> {
        if(!activeVolInfo || !activeVolInfo?.history?.daily || activeVolInfo?.history === "N/A") return;
        setChart(ChartOptions({
            activeVolIndex,
            chartInitialize, 
            activeRange: activeRange, 
            series: activeRange === "all" ? (activeVolInfo?.history?.daily ?? []) : activeVolInfo?.history?.hourly ?? [],
            onClick: (id) => {
                setActiveRange(id);
            }
        }));
    },[activeRange, activeVolInfo, activeVolIndex]);

    useEffect(() => {
        if(ref.current && ref.current?.children[0]?.style) {
            ref.current.style.overflow = "";
            ref.current.children[0].style.overflow = "";
        }
        //eslint-disable-next-line
    }, [chart]);

    return (
        <>
        {activeVolInfo?.history?.daily ?
            <div ref={ref} id={chartInitialize.id} />
            : 
            <div className="graph-preload">
                {activeVolInfo?.history === "N/A" ? <span>Failed to fetch data.</span> : <Spinner className="graph-spinner" />}
            </div>
        }
        </>
    );
};

export default CviIndexGraph;