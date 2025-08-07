# Quick Start Guide - Demo Features

## What's New?

Your job card system now includes powerful API integration features from the demo folder! 🚀

## Getting Started

### 1. Open the Job Card System
- Double-click `starthost.bat` to open the job card system
- OR open `index.html` directly in your browser

### 2. Fill Out Your Job Card
- Complete the regular customer information
- Add job details, financials, and options as usual

### 3. Use API Integration (New!)
- Scroll down to the new **"API Task Integration"** section
- This allows you to create tasks in external project management systems

## Quick Setup for API Features

### Option A: Local CORS Proxy (Recommended)
1. Double-click `start-cors-proxy.bat`
2. Wait for "CORS Proxy Server running" message
3. In the web form, check ✅ "Use CORS Proxy"
4. Select "Local Proxy" from dropdown
5. You're ready to go!

### Option B: Direct Connection
1. Uncheck "Use CORS Proxy"
2. Make sure your API server allows CORS
3. Test connection with "Test CORS" button

## API Configuration

### Default Settings (Ready to Use)
- **API URL**: `https://board.maphefosigns.co.za/jsonrpc.php`
- **Username**: `jsonrpc`
- **Token**: Enter your API token

### Task Settings
- **Project ID**: `1` (change as needed)
- **Column ID**: `2` (change as needed)
- **Owner ID**: `1` (change as needed)

## Common Use Cases

### Creating a Task for a New Job
1. Fill out customer job card
2. Scroll to API section
3. Set task title: "Job for [Customer Name]"
4. Set description with job details
5. Choose priority and due date
6. Click "Create API Task"

### Troubleshooting

#### CORS Errors?
- Try the local proxy (start-cors-proxy.bat)
- Or use "Start Local Server" button for instructions

#### API Errors?
- Check your API token
- Verify API URL is correct
- Test with "Test CORS" button

#### Form Not Saving?
- Check browser console for errors
- Try refreshing the page
- Ensure JavaScript is enabled

## Features at a Glance

✅ **Firebase Integration** - Original job card saving  
✅ **API Task Creation** - Create tasks in external systems  
✅ **CORS Proxy** - Bypass browser restrictions  
✅ **Auto-save** - Form data saved automatically  
✅ **Error Handling** - Clear error messages and suggestions  
✅ **Multiple Proxy Options** - Fallback proxy services  
✅ **Validation** - Form validation before submission  

## Need Help?

1. Check the detailed `README_DEMO_FEATURES.md`
2. Look for error messages in the response area
3. Use browser Developer Tools (F12) for technical details
4. Try the "Test CORS" button to check connectivity

---

**Pro Tip**: Start the CORS proxy first, then use the job card system for the smoothest experience!
