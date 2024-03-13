import Highcharts from "highcharts/highstock";

const Chart = ({ chartInitialize, series, activeVolInfo, indexValue }) => new Highcharts.stockChart(chartInitialize.id, {
    credits: { enabled: false },
    chart: {
        backgroundColor: 'transparent',
        width: 400,
        animation: false,
        events: {
            render: function() {
                this.pointer.reset = () => {
                    if(series && indexValue !== 0 && this.xAxis[0].series[0].points[indexValue]) {
                        this.xAxis[0].series[0].points[indexValue].setState('select');
                        this.xAxis[0].drawCrosshair(null, this.xAxis[0].series[0].points[indexValue]);
                        this.tooltip.refresh([this.xAxis[0].series[0].points[indexValue]]);
                    }
                    return undefined;
                };

                if(series && indexValue !== 0 && this.xAxis[0].series[0].points[indexValue]) {
                    this.xAxis[0].series[0].points[indexValue].setState('hover');
                    this.xAxis[0].drawCrosshair(null, this.xAxis[0].series[0].points[indexValue]);
                    this.tooltip.refresh([this.xAxis[0].series[0].points[indexValue]]);
                }
            },
        }
    },
    plotOptions: {
        color: '#fff',
        series: {
            lineWidth: 1,
            stickyTracking: true,
        }
    },  
    scrollbar: {
        enabled: false
    },
    tooltip: {
        useHTML: true,
        split: true,
        backgroundColor: "transparent",
        borderColor: 'transparent',
        borderWidth: 0,
        shadow: false,
        style: {
            color: '#fff',
        },
        formatter: function() {
            const volName = activeVolInfo?.key?.toUpperCase() || 'Unkown'
            return [ `${volName}: ${this.x}`, `Funding fee (hour): ${this.y}%`]
        },
        valueDecimals: 4,
    },
    navigator: {
        enabled: false,
    },
    rangeSelector: {
        enabled: false,
        buttonSpacing: 56,
        inputEnabled: false,
        labelStyle: {
            display: 'none'
        },
        buttonTheme: {
            fill: 'none',
            width: 24,
            style: {
                color: '#ffffff',
                fontSize: '14px'
            },
            states: {
                hover: {
                    fill: 'none',
                    style: {
                        color: "#007acb",
                    }
                },
                select: {
                    fill: 'none',
                    style: {
                        color: "#007acb",
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
        color: "#000",
    },
    xAxis: {
        crosshair: {
            color: "rgba(255, 255, 255, 0.25)",
            dashStyle: "LongDash",
        },
        labels: {
            useHTML: true,
            color: "#fff",
            style: {
                color: "#fff",
            },
            formatter: function() {
                return Highcharts.format(`${this.value}`)
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
            },
            formatter: function() {
                return Highcharts.format(`${this.value}%`)
            }
        },
        title: {
            enabled: false
        }
    },
    series: [{
        color: "#007acb",
        data: series.map((item) => {
            return {
                x: item[0],
                y: item[1], 
            }
        }),
        id: 'dataseries',
    }],
});

export default Chart;