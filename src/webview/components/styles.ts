export const styles = `
    body {
        font-family: var(--vscode-font-family);
        background-color: var(--vscode-editor-background);
        color: var(--vscode-editor-foreground);
        padding: 10px;
    }
    .controls {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
        position: sticky;
        top: 0;
        background-color: var(--vscode-editor-background);
        z-index: 100;
        padding: 10px 0;
    }
    .search-container {
        position: relative;
        display: inline-block;
    }
    .search-box-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        width: 300px;
        background-color: var(--vscode-input-background);
        border: 1px solid var(--vscode-input-border);
        border-radius: 2px;
    }
    .search-box {
        flex: 1;
        padding: 5px;
        background: none;
        color: var(--vscode-input-foreground);
        border: none;
        outline: none;
        width: 100%;
        min-width: 0;
    }
    .search-box:focus {
        outline: none;
    }
    .search-box-wrapper:focus-within {
        outline: 1px solid var(--vscode-focusBorder);
        outline-offset: -1px;
    }
    .search-actions {
        display: flex;
        align-items: center;
        gap: 2px;
        padding-right: 4px;
    }
    .search-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px;
        border-radius: 3px;
        color: var(--vscode-input-placeholderForeground);
        border: none;
        background: none;
        cursor: pointer;
        min-width: 20px;
        height: 20px;
    }
    .search-button:hover {
        background-color: var(--vscode-toolbar-hoverBackground);
    }
    .regex-toggle.active {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
    }
    .dropdown {
        position: relative;
        display: inline-block;
    }
    .dropdown-button {
        padding: 5px;
        background-color: var(--vscode-dropdown-background);
        color: var(--vscode-dropdown-foreground);
        border: 1px solid var(--vscode-dropdown-border);
        border-radius: 2px;
        cursor: pointer;
        min-width: 150px;
        text-align: left;
    }
    .dropdown-content {
        display: none;
        position: absolute;
        background-color: var(--vscode-dropdown-background);
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid var(--vscode-dropdown-border);
    }
    .dropdown-filter {
        width: calc(100% - 16px);
        margin: 8px;
        padding: 4px;
        border: 1px solid var(--vscode-input-border);
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
    }
    .dropdown-item {
        padding: 8px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        user-select: none;
    }
    .dropdown-item:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
    .dropdown-item label {
        cursor: pointer;
        flex: 1;
        margin: 0;
        padding: 2px 0;
        user-select: none;
    }
    .dropdown-item input[type="checkbox"] {
        cursor: pointer;
        margin: 0;
    }
    .dropdown.active .dropdown-content {
        display: block;
    }
    .clear-filters {
        padding: 5px 10px;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none;
        border-radius: 2px;
        cursor: pointer;
    }
    .clear-filters:hover {
        background-color: var(--vscode-button-hoverBackground);
    }
    .match-highlight {
        background-color: var(--vscode-editor-findMatchHighlightBackground, rgba(234, 92, 0, 0.33));
        border-radius: 2px;
    }
    table { 
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }
    th, td {
        padding: 8px;
        text-align: left;
        border: 1px solid var(--vscode-panel-border);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    td.message {
        white-space: pre-wrap;
        word-break: break-word;
    }
    th {
        background-color: var(--vscode-editor-lineHighlightBackground);
        position: sticky;
        top: 60px;
        z-index: 1;
    }
    tr.error {
        background-color: var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1));
        color: var(--vscode-errorForeground, #ff6b6b);
    }
    tr.warning {
        background-color: var(--vscode-inputValidation-warningBackground, rgba(255, 166, 0, 0.1));
        color: var(--vscode-warningForeground, #ffd700);
    }
    tr.info {
        color: var(--vscode-textLink-activeForeground);
    }
    tr[hidden] {
        display: none;
    }
    .col-actions {
        width: 50px;
    }
    .time-context-button {
        padding: 2px 6px;
        background: none;
        border: none;
        color: var(--vscode-textLink-foreground);
        cursor: pointer;
        border-radius: 3px;
    }
    .time-context-button:hover {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
    }
    .time-context-button.active {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
    }
    .time-range-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 8px;
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border-radius: 3px;
        font-size: 12px;
    }
    .time-range-clear {
        background: none;
        border: none;
        color: var(--vscode-button-foreground);
        cursor: pointer;
        padding: 0 4px;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .time-range-clear:hover {
        background-color: var(--vscode-button-hoverBackground);
        border-radius: 3px;
    }
    .progress-bar {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--vscode-progressBar-background);
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 1000;
        overflow: hidden;
    }

    .progress-bar.active {
        opacity: 1;
    }

    .progress-bar::after {
        content: '';
        position: absolute;
        height: 100%;
        width: 30%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            var(--vscode-foreground) 50%,
            transparent 100%
        );
        animation: progress-animation 0.8s infinite ease-in-out;
    }

    @keyframes progress-animation {
        0% {
            transform: translateX(-100%);
        }
        100% {
            transform: translateX(400%);
        }
    }
`;
