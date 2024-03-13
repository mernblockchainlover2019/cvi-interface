import config from "config/config";
import Highcharts from "highcharts/highstock";
import Exporting from 'highcharts/modules/map';
Exporting(Highcharts);

export const markedEventsData = {
    // 100: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin purus mauris, cursus eleifend pharetra et, tempor vitae dolor. Proin facilisis tellus ut odio pharetra ullamcorper. "
}

const ChartOptions = ({ chartInitialize, series, height, maxWidth, activeRange, onClick, activeVolIndex }) => Highcharts.stockChart(chartInitialize.id, {
    credits: { 
        enabled: false,
        text: activeVolIndex?.toUpperCase() ?? "CVI",
        position: {
            align: "center",
            verticalAlign: "middle"
        },
        style: {
            fontSize: "42px",
            color: "rgba(255, 255, 255, 0.1)"
        }
    },
    mapNavigation: {
        enableMouseWheelZoom: true,
    },
    chart: {
        backgroundColor: 'transparent',
        width: maxWidth ?? 700,
        height: height ?? 370,
        animation: false,
        plotBackgroundColor: "rgba(0,0,0,0)",
        events: {
            load: function(){
                if(this.plotBackground) {
                    this.plotBackground.toFront().css({ // move on top to get all events
                        cursor: "all-scroll"  
                    });
                }
            }
        }
    },
    plotOptions: {
        color: '#fff',
        series: {
            lineWidth: 1,
        }
    },  
    scrollbar: {
        enabled: false
    },
    tooltip: {
        backgroundColor: "#000",
        borderColor: '#000',
        borderWidth: 0,
        style: {
            width: '200px',
            color: '#fff'
        },
        valueDecimals: 4,
        shared: true
    },
    navigator: {
        enabled: false
    },
    rangeSelector: {
        buttonSpacing: 30,
        allButtonsEnabled: true,
        buttons: [
            {
                type: 'hour',
                count: 24,
                text: '24H',
                events: {
                    click: () => onClick("24h")
                }
            },
            {
                type: 'month',
                count: 1,
                text: '1M',
                events: {
                    click: () => onClick("1m")
                }
            },
            {
                type: 'all',
                text: 'All',
                events: {
                    click: () => onClick("all")
                }
            }
        ],
        selected: activeRange === "all" ? 2 : activeRange === "24h" ? 0 :  1,
        inputEnabled: false,
        labelStyle: {
            display: 'none'
        },
        buttonTheme: {
            fill: 'rgba(255, 255, 255, 0.1)',
            width: 30,
            padding: 3,
            style: {
                color: '#ffffff',
                fontSize: '14px',
                letterSpacing: '-1px',
            },
            states: {
                hover: {
                    fill: 'rgba(255, 255, 255, 0.2)',
                },
                select: {
                    fill: '#fea716',
                    style: {
                        fontWeight: 'normal',
                        color: "#ffffff",
                    }
                },
                disabled: {
                    style: {
                        display: "none"
                    }
                }
            }
        }
    },
    title: {
        text: '',
        style: {
            direction: 'rtl',
        }
    },
    plotLines: {
        color: "#000"
    },
    xAxis: {
        crosshair: {
            color: "rgba(255, 255, 255, 0.25)",
            dashStyle: "LongDash"
        },
        labels: {
            useHTML: true,
            color: "#fff",
            style: {
                color: "#fff",
            }
        },
    },
    yAxis: {
        gridLineColor: "rgba(255, 255, 255, 0.1)",
        gridLineWidth: 1,
        label: {
            align: "left",
            enabled: false,
        },
        labels: {
            useHTML: true,
            align: 'left',
            style: {
                color: '#fff',
            }
        },
        title: {
            enabled: false
        }
    },
    series: [{
        color: "#f8ba15",
        name: config.volatilityLabel?.[activeVolIndex] ?? 'CVI',
        turboThreshold: 4000,
        data: series.map((item, index) => {
            // if(index === 806) {
            //     return {
            //         marker: {
            //             symbol: `url(${require('../../../images/icons/astrix-w-bg.svg').default})`,
            //             enabled: true,
            //             width: 84,
            //             height: 84,
            //         },
            //         x: item[0],
            //         y: item[1], 
            //     }
            // }
        
            return {
                x: item[0],
                y: item[1], 
            }
        }),
        id: 'dataseries',
    }],
});

export default ChartOptions;