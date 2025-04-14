// Global variables to store the parsed data
let processedData = [];
let filteredData = [];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const csvFileInput = document.getElementById('csvFile');
    const statusElement = document.getElementById('status');
    const previewBody = document.getElementById('previewBody');
    const clearBtn = document.getElementById('clearBtn');
    const mediaFilter = document.getElementById('mediaFilter');
    const totalRecordsElement = document.getElementById('totalRecords');
    const totalSheetsElement = document.getElementById('totalSheets');
    
    // Add event listeners
    csvFileInput.addEventListener('change', handleFileUpload);
    clearBtn.addEventListener('click', clearAll);
    mediaFilter.addEventListener('change', applyMediaFilter);
    
    // Function to handle file upload
    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if it's a CSV file
        if (!file.name.toLowerCase().endsWith('.csv')) {
            showStatus('Error: Please upload a CSV file.', 'danger');
            return;
        }
        
        // Show loading status
        showStatus('Processing file...', 'info');
        
        // Read the file
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvContent = e.target.result;
            processCSVData(csvContent);
        };
        reader.onerror = function() {
            showStatus('Error reading the file.', 'danger');
        };
        reader.readAsText(file);
    }

    // Function to process CSV data
    function processCSVData(csvContent) {
        // Parse CSV using PapaParse (semicolon-delimited)
        Papa.parse(csvContent, {
            delimiter: ';',
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                if (results.errors.length > 0) {
                    showStatus('Error parsing CSV: ' + results.errors[0].message, 'danger');
                    return;
                }
                
                try {
                    // Log the parsed data for debugging
                    console.log("Parsed data:", results.data);
                    
                    // Transform the data to the output format
                    processedData = transformData(results.data);
                    
                    // Log the transformed data for debugging
                    console.log("Transformed data:", processedData);
                    
                    // Update the media filter dropdown
                    updateMediaFilterOptions();
                    
                    // Initialize filtered data
                    filteredData = [...processedData];
                    
                    // Display the data in the table
                    displayData(filteredData);
                    
                    // Show success message
                    showStatus(`Successfully processed ${processedData.length} records.`, 'success');
                    
                    // Enable buttons
                    clearBtn.disabled = false;
                } catch (error) {
                    console.error("Processing error:", error);
                    showStatus('Error processing data: ' + error.message, 'danger');
                }
            },
            error: function(error) {
                showStatus('Error parsing CSV: ' + error.message, 'danger');
            }
        });
    }

    // Function to transform the data from input format to output format
    function transformData(inputData) {
        // Create array to hold transformed data
        const transformedData = [];
        
        // Process each row of the input data
        inputData.forEach((row, index) => {
            // Skip rows without essential data
            if (!row.startdate || !row.jobname) return;
            
            // Skip rows where Description is "Service Job"
            if (row.jobname.trim().toLowerCase() === "service job") {
                console.log("Skipping 'Service Job' entry:", row);
                return;
            }
            
            // Skip rows where Description doesn't start with "innerwork_"
            if (!row.jobname.trim().startsWith("innerwork_")) {
                console.log("Skipping non-innerwork entry:", row);
                return;
            }
            
            // Initialize a new record for the transformed data
            const newRecord = {
                Date: row.startdate || '', 
                Description: row.jobname || '',
                Copies: row.noffinishedsets || '1',
                Sheets: '0',
                Media: ''
            };
            
            // Extract sheets data - look for the first valid media entry
            for (let i = 1; i <= 16; i++) {
                const simplexKey = `nofsimplex${i}`;
                const duplexKey = `nofduplex${i}`;
                const mediaNameKey = `medianame${i}`;
                
                // If we have sheets data and media name
                if ((row[simplexKey] || row[duplexKey]) && row[mediaNameKey]) {
                    // Calculate total sheets (simplex + duplex)
                    const simplexCount = parseInt(row[simplexKey] || '0', 10);
                    const duplexCount = parseInt(row[duplexKey] || '0', 10);
                    newRecord.Sheets = (simplexCount + duplexCount).toString();
                    
                    // Set media name
                    newRecord.Media = row[mediaNameKey];
                    break; // Use the first valid media entry
                }
            }
            
            // If no media found in specific fields, try to extract from A3/A4 counts
            if (!newRecord.Sheets || newRecord.Sheets === '0') {
                const a3Count = parseInt(row.nofprinteda3bw || '0', 10) + parseInt(row.nofprinteda3c || '0', 10);
                const a4Count = parseInt(row.nofprinteda4bw || '0', 10) + parseInt(row.nofprinteda4c || '0', 10);
                
                if (a3Count > 0 || a4Count > 0) {
                    newRecord.Sheets = (a3Count + a4Count).toString();
                }
            }
            
            // Add to transformed data
            transformedData.push(newRecord);
        });
        
        return transformedData;
    }

    // Function to display data in the table
    function displayData(data) {
        // Clear the table
        previewBody.innerHTML = '';
        
        // If no data, show "No data" message
        if (data.length === 0) {
            previewBody.innerHTML = '<tr><td colspan="6" class="text-center">No data available</td></tr>';
            // Update totals with zeros when no data
            updateTotals(data);
            return;
        }
        
        // Add rows to the table
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // Line number column
            const lineNoCell = document.createElement('td');
            lineNoCell.textContent = index + 1;
            tr.appendChild(lineNoCell);
            
            // Data columns
            ['Date', 'Description', 'Copies', 'Sheets', 'Media'].forEach(field => {
                const td = document.createElement('td');
                td.textContent = row[field] || '';
                tr.appendChild(td);
            });
            
            // Add the row to the table
            previewBody.appendChild(tr);
        });
        
        // Update the totals
        updateTotals(data);
    }
    
    // Function to update totals
    function updateTotals(data) {
        // Calculate total records
        const totalRecords = data.length;
        
        // Calculate total sheets
        const totalSheets = data.reduce((sum, row) => {
            return sum + parseInt(row.Sheets || '0', 10);
        }, 0);
        
        // Update the UI
        totalRecordsElement.textContent = totalRecords.toLocaleString();
        totalSheetsElement.textContent = totalSheets.toLocaleString();
    }

    // Function to show status messages
    function showStatus(message, type = 'info') {
        statusElement.textContent = message;
        statusElement.className = `alert alert-${type} mt-md-4`;
        statusElement.style.display = 'block';
        
        // Hide the status after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }

    // Function to clear all data
    function clearAll() {
        // Clear the table
        previewBody.innerHTML = '<tr><td colspan="6" class="text-center">No data loaded</td></tr>';
        
        // Clear the data
        processedData = [];
        filteredData = [];
        
        // Clear the file input
        csvFileInput.value = '';
        
        // Reset the media filter
        mediaFilter.innerHTML = '<option value="">All Media Types</option>';
        mediaFilter.disabled = true;
        
        // Reset totals
        totalRecordsElement.textContent = '0';
        totalSheetsElement.textContent = '0';
        
        // Disable buttons
        clearBtn.disabled = true;
        
        // Show status
        showStatus('All data cleared.', 'info');
    }
    
    // Function to update media filter options
    function updateMediaFilterOptions() {
        // Get all unique media types
        const mediaTypes = new Set();
        processedData.forEach(row => {
            if (row.Media && row.Media.trim() !== '') {
                mediaTypes.add(row.Media);
            }
        });
        
        // Sort media types alphabetically
        const sortedMediaTypes = Array.from(mediaTypes).sort();
        
        // Clear existing options, keeping the "All" option
        mediaFilter.innerHTML = '<option value="">All Media Types</option>';
        
        // Add options for each media type
        sortedMediaTypes.forEach(mediaType => {
            const option = document.createElement('option');
            option.value = mediaType;
            option.textContent = mediaType;
            mediaFilter.appendChild(option);
        });
        
        // Enable the filter if we have media types
        mediaFilter.disabled = sortedMediaTypes.length === 0;
    }
    
    // Function to apply media filter
    function applyMediaFilter() {
        const selectedMedia = mediaFilter.value;
        
        // If no filter selected, show all data
        if (!selectedMedia) {
            filteredData = [...processedData];
        } else {
            // Filter data by selected media type
            filteredData = processedData.filter(row => row.Media === selectedMedia);
        }
        
        // Display filtered data
        displayData(filteredData);
        
        // Show status
        if (selectedMedia) {
            showStatus(`Showing ${filteredData.length} rows with media type: ${selectedMedia}`, 'info');
        } else {
            showStatus(`Showing all ${filteredData.length} rows`, 'info');
        }
    }
});