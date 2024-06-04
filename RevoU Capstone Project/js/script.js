document.addEventListener('DOMContentLoaded', function () {
    const ctx1 = document.getElementById('myChart1').getContext('2d');
    const ctx2 = document.getElementById('myChart2').getContext('2d');
    const ctx3 = document.getElementById('myChart3').getContext('2d');
    const ctx4 = document.getElementById('myChart4').getContext('2d');
    const ctx5 = document.getElementById('myChart5').getContext('2d');

    const netProfitElement = document.querySelector('.card p i.fa-chart-line').parentElement;
    const revenueElement = document.querySelector('.card p i.fa-chart-column').parentElement;
    const clvElement = document.querySelector('.card p i.fa-id-card').parentElement;
    const totalOrderElement = document.querySelector('.card p i.fa-basket-shopping').parentElement;
    
    let myChart1, myChart2, myChart3, myChart4, myChart5;
    
    fetch('../asset/data.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('yearDropdown').addEventListener('change', () => updateCharts(data));
            document.getElementById('discountDropdown').addEventListener('change', () => updateCharts(data));
            document.getElementById('regionDropdown').addEventListener('change', () => updateCharts(data));
            document.getElementById('segmentDropdown').addEventListener('change', () => updateCharts(data));
            updateCharts(data);

            // Calculate and display total Net Profit
            const totalNetProfit = data.reduce((sum, item) => sum + parseFloat(item.Profit), 0);
            netProfitElement.innerHTML = `<i class="fa-solid fa-chart-line"></i> $${Math.round(totalNetProfit).toLocaleString()}`;

            // Calculate and display total Revenue
            const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.Sales), 0);
            revenueElement.innerHTML = `<i class="fa-solid fa-chart-column"></i> $${Math.round(totalRevenue).toLocaleString()}`;

            // Calculate and display CLV
            const orderDates = data.map(item => new Date(item.Order_Date));
            const minOrderDate = Math.min(...orderDates);
            const maxOrderDate = Math.max(...orderDates);
            const dateDiff = (maxOrderDate - minOrderDate) / (1000 * 60 * 60 * 24); // Difference in days

            const orderCount = data.length;
            const avgSales = totalRevenue / orderCount;
            const clv = orderCount * avgSales * dateDiff;

            clvElement.innerHTML = `<i class="fa-solid fa-id-card"></i> $${Math.round(clv).toLocaleString()}`;

            // Display Total Orders
            totalOrderElement.innerHTML = `<i class="fa-solid fa-shopping-cart"></i> ${orderCount.toLocaleString()}`;
        });
    
    
    function updateCharts(data) {
        const year = document.getElementById('yearDropdown').value;
        const discount = document.getElementById('discountDropdown').value;
        const region = document.getElementById('regionDropdown').value;
        const segment = document.getElementById('segmentDropdown').value;
    
        const filteredData = data.filter(item => {
            const itemYear = new Date(item.Order_Date).getFullYear().toString();
            const itemDiscount = parseFloat(item.Discount);
    
            const yearMatch = (year === '' || itemYear === year);
            const discountMatch = (discount === '' || (
                (discount === 'noDiscount' && itemDiscount === 0) ||
                (discount === 'lowDiscount' && itemDiscount > 0 && itemDiscount < 30) ||
                (discount === 'moderateDiscount' && itemDiscount >= 30 && itemDiscount <= 50) ||
                (discount === 'bigDiscount' && itemDiscount > 50)
            ));
            const regionMatch = (region === '' || item.Region === region);
            const segmentMatch = (segment === '' || item.Segment === segment);
    
            return yearMatch && discountMatch && regionMatch && segmentMatch;
        });

        // Update Net Profit
        const totalNetProfit = filteredData.reduce((sum, item) => sum + parseFloat(item.Profit), 0);
        netProfitElement.innerHTML = `<i class="fa-solid fa-chart-line"></i> $${Math.round(totalNetProfit).toLocaleString()}`;

        // Update Revenue
        const totalRevenue = filteredData.reduce((sum, item) => sum + parseFloat(item.Sales), 0);
        revenueElement.innerHTML = `<i class="fa-solid fa-chart-column"></i> $${Math.round(totalRevenue).toLocaleString()}`;

        // Calculate and display CLV
        const orderDates = filteredData.map(item => new Date(item.Order_Date));
        const minOrderDate = Math.min(...orderDates);
        const maxOrderDate = Math.max(...orderDates);
        const dateDiff = (maxOrderDate - minOrderDate) / (1000 * 60 * 60 * 24); // Difference in days

        const orderCount = filteredData.length;
        const avgSales = totalRevenue / orderCount;
        const clv = orderCount * avgSales * dateDiff;

        clvElement.innerHTML = `<i class="fa-solid fa-id-card"></i> $${Math.round(clv).toLocaleString()}`;

        // Display Total Orders
        totalOrderElement.innerHTML = `<i class="fa-solid fa-shopping-cart"></i> ${orderCount.toLocaleString()}`;
    
        // Data processing for Chart 1 (Total Order ID dan Net Profit per Sub-Category)
        const subCategories1 = [...new Set(filteredData.map(item => item.Sub_Category))];
        const totalOrders1 = {};
        const profits1 = {};

        subCategories1.forEach(subCategory => {
            totalOrders1[subCategory] = 0;
            profits1[subCategory] = 0;
        });

        filteredData.forEach(item => {
            const subCategory = item.Sub_Category;

            // Hitung total order_id dan profit per subkategori
            totalOrders1[subCategory]++;
            profits1[subCategory] += parseFloat(item.Profit);
        });

        // Urutkan subcategories berdasarkan total order_id (dari yang terbesar ke terkecil)
        subCategories1.sort((a, b) => totalOrders1[b] - totalOrders1[a]);

        const labels1 = subCategories1;
        const totalOrderData1 = labels1.map(subCategory => totalOrders1[subCategory]);
        const profitData1 = labels1.map(subCategory => profits1[subCategory]);

        // Destroy previous chart if it exists
        if (myChart1) myChart1.destroy();

        // Create new Chart.js instance for Chart 1
        myChart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels1,
                datasets: [{
                    label: 'Total Order ID',
                    data: totalOrderData1,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1
                }, {
                    label: 'Net Profit (USD)',
                    data: profitData1,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    yAxisID: 'profit-y-axis',
                    type: 'line'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Order ID'
                        }
                    },
                    'profit-y-axis': {
                        position: 'right',
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Net Profit (USD)'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });

        // Data processing for Chart 2 (Top 5 Profitable Sub-Category)
        const profits2 = {};

        // Mengumpulkan total profit untuk setiap Sub_Category
        filteredData.forEach(item => {
            const subCategory = item['Sub_Category'];
            profits2[subCategory] = (profits2[subCategory] || 0) + parseFloat(item.Profit);
        });

        // Mengambil lima Sub_Category dengan profit tertinggi
        const top5SubCategories = Object.keys(profits2)
            .sort((a, b) => profits2[b] - profits2[a])
            .slice(0, 5);
        const profitData2 = top5SubCategories.map(subCategory => profits2[subCategory]);

        // Destroy previous chart if it exists
        if (myChart2) myChart2.destroy();

        // Create new Chart.js instance for Chart 2
        myChart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: top5SubCategories,
                datasets: [{
                    label: 'Net Profit (USD)',
                    data: profitData2,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Net Profit (USD)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Sub-Category'
                        }
                    }
                }
            }
        });


        // Data processing for Chart 3 (Revenue by Category)
        const categories3 = [...new Set(filteredData.map(item => item.Category))];
        const revenues3 = {};

        categories3.forEach(category => {
            revenues3[category] = 0;
        });

        filteredData.forEach(item => {
            const category = item.Category;
            revenues3[category] += parseFloat(item.Sales);
        });

        // Prepare data for Chart.js
        const labels3 = categories3;
        const revenueData3 = labels3.map(category => revenues3[category]);

        // Calculate total revenue for percentage
        const totalRevenue3 = revenueData3.reduce((sum, value) => sum + value, 0);

        // Destroy previous chart if it exists
        if (myChart3) myChart3.destroy();

        // Create new Chart.js instance for Chart 3 (Pie Chart)
        myChart3 = new Chart(ctx3, {
            type: 'pie',
            data: {
                labels: labels3,
                datasets: [{
                    label: 'Revenue (USD)',
                    data: revenueData3,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const percentage = ((value / totalRevenue3) * 100).toFixed(2);
                            return `${percentage}%`;
                        },
                        color: '#404040',
                        borderRadius: 3,
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
        // Data processing for Chart 4
        const categories4 = [...new Set(filteredData.map(item => item.Category))];
        const totalQuantities4 = {};
        const profits4 = {};

        categories4.forEach(category => {
            totalQuantities4[category] = 0;
            profits4[category] = 0;
        });

        filteredData.forEach(item => {
            const category = item.Category;

            // Calculate total quantity and profit per category
            totalQuantities4[category] += parseFloat(item.Quantity);
            profits4[category] += parseFloat(item.Profit);
        });

        // Prepare data for Chart.js
        const labels4 = categories4;
        const totalQuantityData4 = labels4.map(category => totalQuantities4[category]);

        // Calculate total net profit
        const totalNetProfit4 = Object.values(profits4).reduce((total, profit) => total + profit, 0);

        // Calculate cumulative percentage of net profit
        let cumulativePercentage4 = 0;
        const profitPercentageData4 = labels4.map(category => {
            cumulativePercentage4 += (profits4[category] / totalNetProfit4) * 100;
            return cumulativePercentage4.toFixed(0);
        });


        // Destroy previous chart if it exists
        if (myChart4) myChart4.destroy();

        // Create new Chart.js instance for Chart 4
        myChart4 = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: labels4,
                datasets: [{
                    label: 'Total Quantity',
                    data: totalQuantityData4,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }, {
                    label: 'Net Profit (%)',
                    data: profitPercentageData4,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    yAxisID: 'percentage-y-axis',
                    type: 'line'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Quantity'
                        }
                    },
                    'percentage-y-axis': {
                        position: 'right',
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Net Profit (%)'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        // Destroy previous chart if it exists
        if (myChart5) myChart5.destroy();

        // Create new Chart.js instance for Chart 3 (Pie Chart)
        myChart5 = new Chart(ctx5, {
            type: 'doughnut',
            data: {
                labels: ['No Discount', 'Low Discount', 'Moderate Discount', 'Big Discount'],
                datasets: [{
                    data: [18, 255, 68, 452],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    datalabels: {
                        formatter: (value, context) => {
                            const percentage = ((value / 793) * 100).toFixed(2);
                            return `${percentage}%`;
                        },
                        color: '#404040',
                        borderRadius: 3,
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
});

$(document).ready(function() {
    $.getJSON("../asset/table.json", function(data) {
        console.log("Data loaded successfully:", data); // Debugging: log the data to console
        $('#myTable').DataTable({
            data: data,
            columns: [
                { data: 'Product_Name' },
                { data: 'CLV' },
                { data: 'Profit' },
                { data: 'Revenue' },
                { data: 'Quantity' }
            ]
        });
    });
});
