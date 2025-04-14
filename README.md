# POD Order Processing Tool

A web-based application for processing print job CSV data files, filtering job entries, and calculating print volume statistics.

## Overview

The POD (Print On Demand) Order Processing Tool is designed to help analyze and visualize print job data. The application imports semicolon-delimited CSV files containing detailed print job information and transforms this data into a more digestible format, focusing on essential information like dates, descriptions, copies, sheet counts, and media types.

## Features

- **CSV File Processing**: Import semicolon-delimited CSV files containing print job data
- **Data Transformation**: Convert complex input format to a simplified output format
- **Smart Filtering**: 
  - Only show entries where the description starts with "innerwork_"
  - Exclude entries with description "Service Job"
- **Media Type Filtering**: Filter results by specific media types with a dynamic dropdown
- **Statistics Summary**: 
  - Display total number of records
  - Calculate and display total sheet count
- **Responsive Design**: Built with Bootstrap 5 for a clean, mobile-friendly interface

## How to Use

1. **Getting Started**:
   - Open the application in a web browser
   - The interface will display a file upload area and initially empty data table

2. **Upload and Process Data**:
   - Click "Choose File" to select your CSV data file
   - The application will automatically process the file upon selection
   - Only entries starting with "innerwork_" will be displayed

3. **View and Filter Results**:
   - Use the "Filter by Media Type" dropdown to focus on specific media types
   - See totals update dynamically when filters are applied
   - The table shows Date, Description, Copies, Sheets, and Media for each job

4. **Get External Report**:
   - Click the "Get Report" button to open the external accounting report in a new tab

5. **Clear Data**:
   - Use the "Clear All" button to reset the application for a new import

## Technical Details

### Input Format

The application expects semicolon-delimited CSV files with a specific structure, including these key fields:

- `startdate`: The date of the print job
- `jobname`: The job description (must start with "innerwork_" to be included)
- `noffinishedsets`: Number of copies
- Various media-related fields including:
  - `nofsimplex1` through `nofsimplex16`: Simplex print counts
  - `nofduplex1` through `nofduplex16`: Duplex print counts
  - `medianame1` through `medianame16`: Media type names
  - `nofprinteda3bw`, `nofprinteda3c`, `nofprinteda4bw`, `nofprinteda4c`: Print counts by paper size

### Output Format

The application transforms the data into a simplified format with these columns:

- **Date**: The date of the print job
- **Description**: The job name (always starting with "innerwork_")
- **Copies**: Number of copies produced
- **Sheets**: Total sheet count for the job
- **Media**: The media type used

## Browser Compatibility

The application is compatible with modern browsers:

- Chrome (latest version)
- Firefox (latest version)
- Edge (latest version)
- Safari (latest version)

## Dependencies

- Bootstrap 5.3.2
- PapaParse 5.4.1 (for CSV parsing)
- Bootstrap Icons 1.11.0
- Font Awesome 6.4.0 (for icons)

## Installation

1. Download the project files:
   - index.html
   - script.js

2. Host the files on any web server or open index.html directly in a browser

No server-side processing is required as all data processing happens in the browser.

## Customization

- To change the external report URL, modify the href attribute of the "Get Report" button in index.html
- To add additional filtering criteria, extend the transformData function in script.js

## Support

For questions or support, please contact your system administrator.

---

*This application is designed for internal use for processing print job data.*