# Demo Features Integration

This document explains the demo features that have been integrated into the create system.

## New Features Added

### 1. API Task Integration
- **Purpose**: Create tasks in external systems using API integration
- **Location**: Added as a new section at the bottom of the job card form
- **Features**:
  - JSON-RPC API integration
  - Task creation with full customization
  - Real-time response display

### 2. CORS Proxy System
- **Purpose**: Bypass CORS (Cross-Origin Resource Sharing) restrictions
- **Components**:
  - `cors-proxy.js` - Local Node.js CORS proxy server
  - `start-cors-proxy.bat` - Easy launcher for the proxy
  - Multiple proxy service options (local, remote)

### 3. Enhanced Form Handling
- **Auto-save**: Form data is automatically saved to localStorage
- **Validation**: Client-side validation for all API fields
- **Error handling**: Comprehensive error reporting with suggestions
- **CORS testing**: Built-in CORS connectivity testing

## How to Use

### Starting the CORS Proxy (Recommended)
1. Double-click `start-cors-proxy.bat` in the create folder
2. The proxy will start on `http://localhost:8001`
3. Check "Use CORS Proxy" in the API form
4. Select "Local Proxy" from the dropdown

### Creating API Tasks
1. Fill out the regular job card form
2. Scroll down to the "API Task Integration" section
3. Configure your API settings:
   - API URL (default: https://board.maphefosigns.co.za/jsonrpc.php)
   - Username and API token
   - Task details (title, project ID, etc.)
4. Click "Create API Task"

### CORS Troubleshooting
If you encounter CORS errors:
1. **Option 1**: Use the local CORS proxy (recommended)
2. **Option 2**: Use a remote proxy service
3. **Option 3**: Serve the file from a local web server
4. **Option 4**: Use browser extensions to disable CORS

## Files Added/Modified

### New Files
- `cors-proxy.js` - CORS proxy server
- `start-cors-proxy.bat` - Proxy launcher
- `start-server.bat` - Web server launcher

### Modified Files
- `index.html` - Added API integration form
- `app.js` - Added TaskCreator class and API functionality
- `style.css` - Added styles for demo features

## API Configuration

### Default Settings
- **API URL**: `https://board.maphefosigns.co.za/jsonrpc.php`
- **Username**: `jsonrpc`
- **Method**: `createTask`
- **Project ID**: `1`
- **Column ID**: `2`
- **Owner ID**: `1`

### Customizable Options
- Task title and description
- Due date and start date
- Priority levels (Low, Normal, High, Urgent)
- Color coding
- Tags and references
- Category and score

## Technical Details

### TaskCreator Class
- Handles API communication
- Manages CORS proxy routing
- Provides error handling and validation
- Supports multiple proxy services

### Proxy Services Supported
1. **Local Proxy** (recommended)
2. **CORS Anywhere**
3. **AllOrigins**
4. **CORSProxy.io**
5. **CodeTabs**
6. **Custom proxy URL**

## Error Handling

The system provides detailed error messages for:
- Network connectivity issues
- CORS policy violations
- API authentication failures
- Invalid form data
- Proxy service failures

## Security Notes

- API passwords are not saved to localStorage
- HTTPS is used for all external API calls
- Basic authentication is properly encoded
- Proxy services are clearly identified in responses

## Browser Compatibility

Tested with:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Support

For issues with the demo features:
1. Check the browser console for detailed error messages
2. Verify API credentials and endpoints
3. Test CORS connectivity using the built-in test button
4. Try different proxy services if one fails
