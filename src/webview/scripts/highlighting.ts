export const highlightingScript = `
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function highlightMatches(text, searchTerm, isRegex) {
        if (!searchTerm) return escapeHtml(text);
        
        try {
            if (isRegex) {
                const regex = new RegExp(searchTerm, 'gim');
                return escapeHtml(text).replace(regex, match => 
                    \`<span class="match-highlight">\${match}</span>\`
                );
            } else {
                const escapedText = escapeHtml(text);
                const escapedSearchTerm = escapeHtml(searchTerm);
                const regex = new RegExp(escapedSearchTerm, 'gi');
                return escapedText.replace(regex, match =>
                    \`<span class="match-highlight">\${match}</span>\`
                );
            }
        } catch (e) {
            return escapeHtml(text);
        }
    }

    function updateCellContent(cell, text, searchTerm) {
        if (!searchTerm) {
            cell.textContent = text;
            return;
        }
        cell.innerHTML = highlightMatches(text, searchTerm, isRegexMode);
    }

    function isValidRegex(pattern) {
        try {
            new RegExp(pattern);
            return true;
        } catch (e) {
            return false;
        }
    }

    function matchRegex(text, pattern) {
        try {
            const regex = new RegExp(pattern, 'gim');
            return regex.test(text);
        } catch (e) {
            return false;
        }
    }
`;
