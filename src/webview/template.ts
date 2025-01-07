import { MECMLogEntry } from '../types';
import { styles } from './components/styles';
import { generateTable } from './components/table';
import { generateFilters } from './components/filters';
import { filteringScript } from './scripts/filtering';
import { highlightingScript } from './scripts/highlighting';
import { dropdownsScript } from './scripts/dropdowns';

export function generateWebviewContent(entries: MECMLogEntry[]): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            ${styles}
        </style>
    </head>
    <body class="vscode-dark">
        <div class="progress-bar"></div>
        <div class="container">
            ${generateFilters(entries)}
            ${generateTable(entries)}
            <script>
                const rows = document.querySelectorAll('#logTable tbody tr');
                const totalRows = rows.length;

                ${highlightingScript}
                ${filteringScript}
                ${dropdownsScript}

                // Inline the worker code to avoid path issues in VSCode webview
                const workerCode = \`
                    self.onmessage = function(e) {
                        const { 
                            rows, 
                            searchTerm, 
                            isRegexMode, 
                            selectedSources, 
                            selectedComponents, 
                            selectedTypes,
                            timeContextFilter,
                            TIME_RANGE_MINUTES
                        } = e.data;

                        function isWithinTimeRange(timestamp, targetTime, secondsRange) {
                            const time = new Date(timestamp).getTime() / 1000;
                            const target = new Date(targetTime).getTime() / 1000;
                            const range = secondsRange;
                            return Math.abs(time - target) <= range;
                        }

                        function matchRegex(text, pattern) {
                            try {
                                const regex = new RegExp(pattern);
                                return regex.test(text);
                            } catch (e) {
                                return false;
                            }
                        }

                        const results = rows.map(row => {
                            const cellTexts = row.cells.map(cell => cell.text || '');
                            
                            let matchesSearch = true;
                            if (searchTerm) {
                                if (isRegexMode) {
                                    matchesSearch = cellTexts.some(text => matchRegex(text, searchTerm));
                                } else {
                                    matchesSearch = cellTexts.some(text => 
                                        text.toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }
                            }

                            const matchesSource = selectedSources.length === 0 || selectedSources.includes(row.source);
                            const matchesComponent = selectedComponents.length === 0 || selectedComponents.includes(row.component);
                            const matchesType = selectedTypes.length === 0 || selectedTypes.includes(row.type);
                            const matchesTimeContext = !timeContextFilter || isWithinTimeRange(row.timestamp, timeContextFilter, TIME_RANGE_MINUTES * 60);

                            const isVisible = matchesSearch && matchesSource && matchesComponent && matchesType && matchesTimeContext;
                            
                            return {
                                id: row.id,
                                isVisible,
                                shouldHighlight: isVisible && searchTerm ? searchTerm : null
                            };
                        });

                        self.postMessage(results);
                    };
                \`;

                // Create a blob URL for the worker
                const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
                const workerUrl = URL.createObjectURL(workerBlob);

                // Set up search functionality
                const searchInput = document.getElementById('searchInput');
                const searchClear = document.getElementById('searchClear');
                const regexToggle = document.getElementById('regexToggle');
                const regexError = document.getElementById('regexError');
                const clearFilters = document.getElementById('clearFilters');
                const rowCounter = document.getElementById('rowCounter');

                // Event listeners are now set up in the filtering script
            </script>
        </div>
    </body>
    </html>`;
}
