document.getElementById('barChartBtn').addEventListener('click', () => {
    fetchDataAndRenderChart('bar');
});

document.getElementById('lineChartBtn').addEventListener('click', () => {
    fetchDataAndRenderChart('line');
});

async function fetchDataAndRenderChart(chartType) {
    const response = await fetch('/data');
    const data = await response.json();

    if (data.length === 0) {
        alert('No data available. Please upload a file first.');
        return;
    }

    const statType = document.querySelector('input[name="statType"]:checked').value;
    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }

    let labels, datasets;

    if (statType === 'tasks') {
        labels = ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'];
        datasets = [
            {
                label: 'MIN',
                data: data.tasks.mins,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'MAX',
                data: data.tasks.maxs,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'AVG',
                data: data.tasks.avgs,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'STD DEV',
                data: data.tasks.stdDevs,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }
        ];
    } else {
        labels = data.cores.map(core => core.core);
        const mins = data.cores.map(core => core.mins[0]);
        const maxs = data.cores.map(core => core.maxs[0]);
        const avgs = data.cores.map(core => core.avgs[0]);
        const stdDevs = data.cores.map(core => core.stdDevs[0]);
        datasets = [
            {
                label: 'MIN',
                data: mins,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'MAX',
                data: maxs,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'AVG',
                data: avgs,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
            {
                label: 'STD DEV',
                data: stdDevs,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }
        ];
    }
    
    window.myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}