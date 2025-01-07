export const filteringScript = `
    // Global constants
    const TIME_RANGE_MINUTES = 5;
    let filterWorker;

    function debounce(func, wait) {
        let timeout = null;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function getSelectedValues(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        const allCheckbox = dropdown.querySelector('input[id$="All"]');
        if (allCheckbox.checked) return [];
        
        return Array.from(dropdown.querySelectorAll('input[type="checkbox"]:not([id$="All"])')).filter(cb => cb.checked).map(cb => cb.value);
    }

    function updateRowCounter(visibleCount) {
        const rowCounter = document.getElementById('rowCounter');
        if (visibleCount === window.totalRows) {
            rowCounter.textContent = 'Showing all ' + window.totalRows + ' rows';
        } else {
            rowCounter.textContent = 'Showing ' + visibleCount + ' of ' + window.totalRows + ' rows';
        }
    }

    function initializeWorker() {
        if (filterWorker) {
            filterWorker.terminate();
        }
        const workerBlob = new Blob([\`
            self.onmessage = function(e) {
                const rows = e.data.rows;
                const searchTerm = e.data.searchTerm;
                const isRegexMode = e.data.isRegexMode;
                const selectedSources = e.data.selectedSources;
                const selectedComponents = e.data.selectedComponents;
                const selectedTypes = e.data.selectedTypes;
                const timeContextFilter = e.data.timeContextFilter;
                const TIME_RANGE_MINUTES = e.data.TIME_RANGE_MINUTES;

                const results = rows.map(row => {
                    let matchesSearch = true;
                    if (searchTerm) {
                        matchesSearch = row.cells.some(cell => {
                            const text = cell.text || '';
                            if (isRegexMode) {
                                try {
                                    const regex = new RegExp(searchTerm, 'i');
                                    return regex.test(text);
                                } catch (e) {
                                    return false;
                                }
                            } else {
                                return text.toLowerCase().includes(searchTerm.toLowerCase());
                            }
                        });
                    }

                    const isVisible = (
                        matchesSearch &&
                        (selectedSources.length === 0 || selectedSources.includes(row.source)) &&
                        (selectedComponents.length === 0 || selectedComponents.includes(row.component)) &&
                        (selectedTypes.length === 0 || selectedTypes.includes(row.type)) &&
                        (!timeContextFilter || isWithinTimeRange(row.timestamp, timeContextFilter, TIME_RANGE_MINUTES * 60))
                    );

                    return { 
                        id: row.id, 
                        isVisible, 
                        shouldHighlight: isVisible && searchTerm ? searchTerm : null 
                    };
                });

                self.postMessage(results);
            };

            function isWithinTimeRange(timestamp, targetTime, secondsRange) {
                const time = new Date(timestamp).getTime() / 1000; // Convert to seconds
                const target = new Date(targetTime).getTime() / 1000; // Convert to seconds
                const range = secondsRange; // Already in seconds
                return Math.abs(time - target) <= range;
            }
        \`], { type: 'text/javascript' });
        const workerUrl = URL.createObjectURL(workerBlob);
        filterWorker = new Worker(workerUrl);
        
        filterWorker.onerror = function(e) {
            console.error('Worker error:', e);
            hideProgress();
        };
        
        filterWorker.onmessage = function(e) {
            const results = e.data;
            let visibleCount = 0;
            
            results.forEach(result => {
                const row = window.rows[result.id];
                if (result.isVisible) {
                    row.style.display = '';
                    visibleCount++;
                    
                    if (result.shouldHighlight) {
                        const cells = Array.from(row.getElementsByTagName('td'));
                        cells.forEach((cell, index) => {
                            if (index !== cells.length - 1) {
                                const originalText = cell.textContent || '';
                                updateCellContent(cell, originalText, result.shouldHighlight);
                            }
                        });
                    } else {
                        // Reset highlighting if no search term
                        const cells = Array.from(row.getElementsByTagName('td'));
                        cells.forEach((cell, index) => {
                            if (index !== cells.length - 1) {
                                const originalText = cell.textContent || '';
                                cell.textContent = originalText;
                            }
                        });
                    }
                } else {
                    row.style.display = 'none';
                }
            });

            updateRowCounter(visibleCount);
            hideProgress();
        };
    }

    function filterLogs() {
        showProgress();

        // Prepare data for the worker
        const searchInput = document.getElementById('searchInput');
        const regexError = document.getElementById('regexError');
        const searchTerm = searchInput.value;
        const selectedSources = getSelectedValues('sourceDropdown');
        const selectedComponents = getSelectedValues('componentDropdown');
        const selectedTypes = getSelectedValues('typeDropdown');

        // Clear any previous error
        regexError.textContent = '';
        
        // Validate regex if in regex mode
        if (window.isRegexMode && searchTerm && !isValidRegex(searchTerm)) {
            regexError.textContent = 'Invalid regex pattern';
            hideProgress();
            return;
        }

        // Convert rows to a serializable format
        const rowsData = Array.from(window.rows).map((row, id) => ({
            id,
            cells: Array.from(row.getElementsByTagName('td')).map(cell => ({
                text: cell.textContent || ''
            })),
            source: row.getAttribute('data-source'),
            component: row.getAttribute('data-component'),
            type: row.getAttribute('data-type'),
            timestamp: row.getAttribute('data-timestamp')
        }));

        // Send data to worker
        filterWorker.postMessage({
            rows: rowsData,
            searchTerm,
            isRegexMode: window.isRegexMode,
            selectedSources,
            selectedComponents,
            selectedTypes,
            timeContextFilter: window.timeContextFilter,
            TIME_RANGE_MINUTES
        });
    }

    function formatTimeRange(timestamp) {
        const date = new Date(timestamp);
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        return \`\${hours}:\${minutes}\`;
    }

    function updateTimeRangeIndicator() {
        const indicator = document.getElementById('timeRangeIndicator');
        const textSpan = indicator.querySelector('.time-range-text');
        
        if (window.timeContextFilter) {
            const centerTime = formatTimeRange(window.timeContextFilter);
            const beforeTime = formatTimeRange(new Date(new Date(window.timeContextFilter).getTime() - TIME_RANGE_MINUTES * 60 * 1000));
            const afterTime = formatTimeRange(new Date(new Date(window.timeContextFilter).getTime() + TIME_RANGE_MINUTES * 60 * 1000));
            
            textSpan.textContent = \`Time Range: \${beforeTime} - \${afterTime} (centered on \${centerTime})\`;
            indicator.style.display = 'flex';
        } else {
            indicator.style.display = 'none';
        }
    }

    function showProgress() {
        document.querySelector('.progress-bar').classList.add('active');
    }

    function hideProgress() {
        document.querySelector('.progress-bar').classList.remove('active');
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Initialize global state
        window.isRegexMode = false;
        window.timeContextFilter = null;
        window.searchTimer = null;
        window.rows = document.querySelectorAll('#logTable tbody tr');
        window.totalRows = window.rows.length;

        initializeWorker();

        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        const regexToggle = document.getElementById('regexToggle');
        const clearFilters = document.getElementById('clearFilters');
        
        // Set up search functionality with debounce
        searchInput.addEventListener('input', (e) => {
            showProgress(); // Show progress immediately when user starts typing
            console.log('Search input changed, scheduling filter...');
            if (window.searchTimer) {
                console.log('Clearing existing timer');
                clearTimeout(window.searchTimer);
            }
            window.searchTimer = setTimeout(() => {
                console.log('Executing delayed filter');
                filterLogs();
            }, 300);
        });

        // Clear button
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            if (window.searchTimer) {
                clearTimeout(window.searchTimer);
            }
            filterLogs(); // Immediate filter on clear
        });

        // Regex toggle
        regexToggle.addEventListener('click', () => {
            window.isRegexMode = !window.isRegexMode;
            regexToggle.classList.toggle('active');
            if (window.searchTimer) {
                clearTimeout(window.searchTimer);
            }
            filterLogs();
        });

        // Clear all filters
        clearFilters.addEventListener('click', () => {
            // Reset search
            searchInput.value = '';
            window.isRegexMode = false;
            regexToggle.classList.remove('active');
            if (window.searchTimer) {
                clearTimeout(window.searchTimer);
            }

            // Reset all dropdowns
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                const allCheckbox = dropdown.querySelector('input[id$="All"]');
                const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:not([id$="All"])');
                
                allCheckbox.checked = true;
                checkboxes.forEach(cb => {
                    cb.checked = false;
                });
                
                updateButtonText(dropdown);
            });

            // Clear time filter
            window.timeContextFilter = null;
            document.querySelectorAll('.time-context-button').forEach(b => b.classList.remove('active'));
            updateTimeRangeIndicator();

            filterLogs();
        });

        // Set up time context button functionality
        document.querySelectorAll('.time-context-button').forEach(button => {
            button.addEventListener('click', () => {
                const timestamp = button.getAttribute('data-timestamp');
                if (window.timeContextFilter === timestamp) {
                    window.timeContextFilter = null;
                    document.querySelectorAll('.time-context-button').forEach(b => b.classList.remove('active'));
                } else {
                    window.timeContextFilter = timestamp;
                    document.querySelectorAll('.time-context-button').forEach(b => {
                        b.classList.toggle('active', b.getAttribute('data-timestamp') === timestamp);
                    });
                }
                updateTimeRangeIndicator();
                filterLogs();
            });
        });

        // Set up time range clear button
        document.querySelector('.time-range-clear').addEventListener('click', () => {
            window.timeContextFilter = null;
            document.querySelectorAll('.time-context-button').forEach(b => b.classList.remove('active'));
            updateTimeRangeIndicator();
            filterLogs();
        });
    });
`;
