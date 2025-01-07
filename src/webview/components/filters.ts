import { MECMLogEntry } from '../../types';

function generateDropdown(id: string, title: string, items: string[]): string {
    return `
        <div class="dropdown" id="${id}Dropdown">
            <button class="dropdown-button">${title}</button>
            <div class="dropdown-content">
                <input type="text" class="dropdown-filter" placeholder="Filter ${title.toLowerCase()}..." data-filter-for="${id}">
                <div class="dropdown-item">
                    <input type="checkbox" id="${id}All" checked>
                    <label for="${id}All">All ${title}</label>
                </div>
                ${items.map(item => `
                    <div class="dropdown-item" data-filter-value="${item.toLowerCase()}">
                        <input type="checkbox" id="${id}_${item}" value="${item}">
                        <label for="${id}_${item}">${item}</label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

export function generateFilters(entries: MECMLogEntry[]): string {
    const sources = Array.from(new Set(entries.map(e => e.source)));
    const components = Array.from(new Set(entries.map(e => e.component)));
    const types = Array.from(new Set(entries.map(e => e.type)));

    return `
        <div class="controls">
            <div class="search-container">
                <div class="search-box-wrapper">
                    <input type="text" id="searchInput" class="search-box" placeholder="Search logs...">
                    <div class="search-actions">
                        <button id="regexToggle" class="search-button regex-toggle" title="Use Regular Expression">.*</button>
                        <button id="searchClear" class="search-button" title="Clear">×</button>
                    </div>
                </div>
                <div id="regexError" class="regex-error"></div>
            </div>
            
            ${generateDropdown('source', 'Sources', sources)}
            ${generateDropdown('component', 'Components', components)}
            ${generateDropdown('type', 'Types', types)}

            <button id="clearFilters" class="clear-filters">Clear All Filters</button>

            <div id="timeRangeIndicator" class="time-range-indicator" style="display: none;">
                <span class="time-range-text"></span>
                <button class="time-range-clear" title="Clear time range filter">×</button>
            </div>

            <div id="rowCounter" class="row-counter">
                Showing all ${entries.length} rows
            </div>
        </div>
    `;
}
