export const dropdownsScript = `
    function updateButtonText(dropdown) {
        const button = dropdown.querySelector('.dropdown-button');
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:not([id$="All"])');
        const allCheckbox = dropdown.querySelector('input[id$="All"]');
        const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (allCheckbox.checked || selectedCount === 0) {
            button.textContent = button.textContent.split(' (')[0];
        } else {
            button.textContent = \`\${button.textContent.split(' (')[0]} (\${selectedCount})\`;
        }
    }

    // Set up dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const button = dropdown.querySelector('.dropdown-button');
        const content = dropdown.querySelector('.dropdown-content');
        const allCheckbox = dropdown.querySelector('input[id$="All"]');
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:not([id$="All"])');
        const filter = dropdown.querySelector('.dropdown-filter');

        // Toggle dropdown on button click
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
            if (content.style.display === 'block') {
                filter.focus();
            }
        });

        // Handle clicks on dropdown items
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                
                // Don't handle if we clicked directly on the checkbox
                if (e.target === checkbox) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                // Toggle the checkbox
                checkbox.checked = !checkbox.checked;

                // Handle "All" checkbox logic
                if (checkbox.id.endsWith('All')) {
                    checkboxes.forEach(cb => {
                        cb.checked = !checkbox.checked;
                    });
                } else {
                    // Update "All" checkbox based on other checkboxes
                    allCheckbox.checked = Array.from(checkboxes).every(cb => !cb.checked);
                }

                updateButtonText(dropdown);
                filterLogs();
            });
        });

        // Handle checkbox changes
        dropdown.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                if (checkbox.id.endsWith('All')) {
                    checkboxes.forEach(cb => {
                        cb.checked = !checkbox.checked;
                    });
                } else {
                    allCheckbox.checked = Array.from(checkboxes).every(cb => !cb.checked);
                }
                updateButtonText(dropdown);
                filterLogs();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                content.style.display = 'none';
            }
        });

        // Filter functionality
        filter.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            dropdown.querySelectorAll('.dropdown-item[data-filter-value]').forEach(item => {
                const itemValue = item.getAttribute('data-filter-value');
                item.style.display = itemValue.includes(value) ? '' : 'none';
            });
        });

        // Initialize button text
        updateButtonText(dropdown);
    });
`;
