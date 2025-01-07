import { MECMLogEntry } from '../../types';

export function generateTable(entries: MECMLogEntry[]): string {
    return `
        <table id="logTable">
            <thead>
                <tr>
                    <th class="col-source">Source</th>
                    <th class="col-timestamp">Timestamp</th>
                    <th class="col-component">Component</th>
                    <th class="col-type">Type</th>
                    <th class="col-message">Message</th>
                    <th class="col-actions">Actions</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map(entry => `
                    <tr class="${entry.type.toLowerCase()}" 
                        data-source="${entry.source}"
                        data-timestamp="${entry.timestamp}"
                        data-component="${entry.component}"
                        data-type="${entry.type}">
                        <td class="source">${entry.source}</td>
                        <td class="timestamp">${entry.timestamp}</td>
                        <td class="component">${entry.component}</td>
                        <td class="type">${entry.type}</td>
                        <td class="message">${entry.message}</td>
                        <td class="actions">
                            <button class="time-context-button" title="View logs around this time" data-timestamp="${entry.timestamp}">⌚</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
