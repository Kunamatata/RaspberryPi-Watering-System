import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { relative } from 'path';
import Slider from '../slider/slider'
import './chart.css';

class Chart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'RPI Temperature in C° over time',
                        fill: true,
                        lineTension: 0.01,
                        backgroundColor: 'rgba(42,63,72,1)',
                        borderColor: 'rgba(0,174,243,1)',
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: 'rgba(0,174,243,1)',
                        pointBackgroundColor: 'rgba(0,174,243,1)',
                        pointRadius: 1,
                        pointHoverRadius: 6,
                        pointBorderWidth: 2,
                        pointHoverBorderWidth: 3,
                        pointHoverBackgroundColor: 'rgba(38,41,57,1)',
                        pointHoverBorderColor: 'rgba(0,174,243,1)',
                        pointHitRadius: 10,
                        data: []
                    }
                ],
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'RPI Temperature in C°'
                        },
                        ticks: {
                            // beginAtZero: true,
                            min: 30
                        }
                    }],
                    xAxes: [{
                        type: 'time',
                    }]
                },
                animation: {
                    easing: "easeInOutBack"
                  }
            },
            sliderRange: 100
        }

        this.updateRange = this.updateRange.bind(this);
        this.updateChart = this.updateChart.bind(this);
    }
    componentDidMount() {
        let state = Object.assign({}, this.state);

        fetch("/water", {headers: this.props.auth.getHeaders()}).then(response => {
            return response.json()
        }).then(json => {
            state.date = {
                lastModified: null,
                datasets: state.data.datasets,
                labels: state.data.labels
            }
            this.setState(state);
        })
        .catch((err) => {
            console.error(err);
        })

        this.setState({ chart: this.refs.chart.chartInstance })
        let gradientStroke = this.refs.chart.chartInstance.ctx.createLinearGradient(0, 0, 0, 150);
        gradientStroke.addColorStop(0, '#00AEF1');
        gradientStroke.addColorStop(1, '#31343F');
        this.state.data.datasets[0].backgroundColor = gradientStroke;

        let timerId = setTimeout(function tick () {
            this.updateChart()
            timerId = setTimeout(tick.bind(this), 5000)
        }.bind(this), 100)
    }

    updateChart() {
        let state = Object.assign({}, this.state);
        fetch("/water", {headers: this.props.auth.getHeaders()} ).then(response => {
            return response.json()
        }).then(json => {
            if (json.labels && state.data.lastModified !== json.lastModified) {
                state.json = json;
                state.data.labels = json.labels.slice(-state.sliderRange);
                state.data.datasets[0].data = json.data.slice(-state.sliderRange);
                state.data = {
                    lastModified: json.lastModified,
                    datasets: state.data.datasets,
                    labels: state.data.labels
                }
                this.setState(state)
                this.state.chart.update();
            }
        }).catch((err) => {
            console.error(err);
        })

    }

    updateRange(e){
        let state = Object.assign({}, this.state);
        state.sliderRange = e.target.value;
        state.data.labels = state.json.labels.slice(-state.sliderRange);
        state.data.datasets[0].data = state.json.data.slice(-state.sliderRange);
        this.setState(state);
    }

    componentWillUnmount(){
        // clear interval timer
    }

    render() {
        const data = this.state.data;
        return (
            <div className="chart-container">
                <Line ref='chart' data={data} options={this.state.options}/>        
                <Slider className="slider" handler={this.updateRange}/>
            </div>
        )
    }
}

export default Chart;