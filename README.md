# MECM Log Parser

A Visual Studio Code extension that provides enhanced viewing and analysis capabilities for Microsoft Endpoint Configuration Manager (MECM) log files. This extension transforms MECM logs into an interactive, filterable view directly within VS Code.

## Features

- **Interactive Log Viewer**: View MECM logs in a structured, table-based format with the following features:
  - Full-text search with regex support
  - Multi-column filtering by Source, Component, and Type
  - Time range context filtering
  - Clear indication of applied filters
  
- **Advanced Filtering**:
  - Dropdown menus for Source, Component, and Type filters
  - Filter search within dropdowns
  - Ability to select multiple filter values
  - Quick filter clearing options
  
- **Search Capabilities**:
  - Real-time search with regex support
  - Visual feedback for invalid regex patterns
  - One-click search clearing
  
- **Performance Optimized**:
  - Progressive loading for large log files
  - Background processing for search and filters
  - Smooth scrolling with large datasets

## Requirements

- Visual Studio Code version 1.96.0 or higher

## Usage

1. Open any MECM log file or folder in VS Code
1. Right-click on the file or folder and select `Parse MECM Log`/`Open MECM Logs in Folder`
   - *Note: You can also right-click in an empty space in the file explorer and select `Open MECM Logs in Folder`.*
1. Use the extension's custom viewer to:
   - Search through logs using the search bar
   - Filter logs using the dropdown menus
   - Clear filters using the "Clear All Filters" button
   - Use time context filtering by clicking on timestamps

## Known Issues

No known issues at this time. Please report any problems on the GitHub repository.

