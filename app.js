document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const searchInput = document.getElementById('search-input');
    const loadingState = document.getElementById('loading');
    const noResultsState = document.getElementById('no-results');
    const table = document.getElementById('benchmark-table');

    let allData = [];

    // Format distribution object into flex tags
    const formatDistribution = (distStr) => {
        if (!distStr) return '-';
        
        try {
            // The CSV already contains percentages as part of the string value.
            // Example: {"C": "303 (25.85%)", "B": "301 (25.68%)"}
            // Some keys might be invalid JSON if quotes are weird, but usually it works.
            const dist = JSON.parse(distStr);
            let html = '<div class="dist-tag-container">';
            
            // Sort keys by highest value or just keep original order
            const entries = Object.entries(dist);
            
            for (const [key, val] of entries) {
                // val is a string like "303 (25.85%)"
                html += `
                    <div class="dist-tag">
                        <span class="dist-key">${key}:</span> 
                        <span class="dist-val">${val}</span>
                    </div>
                `;
            }
            html += '</div>';
            return html;
        } catch (e) {
            console.warn('Could not parse distribution JSON:', distStr);
            return `<div class="dist-tag-container"><span class="dist-val">${distStr}</span></div>`;
        }
    };

    // Format accuracy with percentage bars
    const formatAccuracy = (val) => {
        const num = parseFloat(val);
        if (isNaN(num)) return '-';
        
        const percentage = (num * 100).toFixed(2);
        return `
            <div>${percentage}%</div>
            <div class="percent-bar-container">
                <div class="percent-bar" style="width: 0%;" data-width="${percentage}%"></div>
            </div>
        `;
    };

    const renderTable = (data) => {
        // Clear existing rows
        tableBody.innerHTML = '';
        
        if (data.length === 0) {
            table.classList.add('hidden');
            noResultsState.classList.remove('hidden');
            return;
        }

        table.classList.remove('hidden');
        noResultsState.classList.add('hidden');

        data.forEach(row => {
            const tr = document.createElement('tr');
            
            // We want to skip empty rows that might be parsed at EOF
            if (!row['Benchmark'] || !row['Total Examples']) return;

            tr.innerHTML = `
                <td class="benchmark-name">${row['Benchmark']}</td>
                <td class="num-col">${parseInt(row['Total Examples']).toLocaleString()}</td>
                <td class="num-col">${row['Num Classes']}</td>
                <td class="dist-cell">${formatDistribution(row['Distribution'])}</td>
                <td class="num-col">${formatAccuracy(row['Majority Class Acc'])}</td>
                <td class="num-col">${formatAccuracy(row['Uniform Random Acc'])}</td>
                <td class="num-col">${formatAccuracy(row['Proportional Random Acc'])}</td>
            `;
            
            tableBody.appendChild(tr);
        });

        // Trigger reflow to restart animations and apply widths
        void table.offsetWidth;
        
        // Animate the bars
        setTimeout(() => {
            const bars = tableBody.querySelectorAll('.percent-bar');
            bars.forEach(bar => {
                bar.style.width = bar.getAttribute('data-width');
            });
        }, 50);
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filteredData = allData.filter(row => {
            if (!row['Benchmark']) return false;
            return row['Benchmark'].toLowerCase().includes(query);
        });
        renderTable(filteredData);
    };

    // Initialize PapaParse to load the CSV file natively
    // Note: this assumes the webpage is hosted so that fetching relative paths works.
    // If opening locally via file:// it might run into CORS issues. Let's load the file via PapaParse config.
    Papa.parse('./benchmark_distributions.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            // Keep rows that actually have data
            allData = results.data.filter(row => row['Benchmark']);
            
            loadingState.classList.add('hidden');
            renderTable(allData);
        },
        error: (error) => {
            console.error('Error parsing CSV:', error);
            loadingState.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" class="empty-icon" style="color: #ef4444;" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Failed to load data. Please ensure you are viewing this via a local server (e.g., Python's HTTP server) rather than a file:// URL, as it requires fetching the CSV.</p>
            `;
            loadingState.classList.remove('hidden');
            table.classList.add('hidden');
        }
    });

    // Attach event listeners
    searchInput.addEventListener('input', handleSearch);
});
