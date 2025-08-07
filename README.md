# Task Creator - API Task Management Tool

A web-based application for creating tasks through JSON-RPC API calls with a beautiful, responsive interface.

## 🚨 CORS Issues & Solutions

### The Problem
When opening `index.html` directly in a browser (file:// protocol), you'll encounter CORS errors when trying to make API calls to external servers. This is a browser security feature.

### Solutions (choose one):

#### Option 1: Use CORS Proxy ✅ Easiest
1. Check the "Use CORS Proxy" checkbox in the form
2. This routes your request through a CORS proxy service
3. **Note**: Only use this for testing, not for production with sensitive data

#### Option 2: Run Local Web Server ✅ Recommended
1. **Using the provided batch file:**
   - Double-click `start-server.bat`
   - Open http://localhost:8000 in your browser

2. **Manual setup with Python:**
   ```bash
   cd "c:\Users\Designer\Desktop\create job"
   python -m http.server 8000
   ```

3. **Manual setup with Node.js:**
   ```bash
   npx http-server "c:\Users\Designer\Desktop\create job" -p 8000
   ```

#### Option 3: Browser Extensions
Install a CORS-disabling extension (not recommended for regular browsing)

#### Option 4: Configure Your API Server
Add these headers to your API server:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🎯 Features

- **Complete Task Creation Form** with all API parameters
- **CORS Workarounds** built-in
- **Form Validation** ensures required fields
- **Local Storage** remembers your settings (except passwords)
- **Error Handling** with detailed error messages
- **Loading States** with visual feedback
- **Responsive Design** works on mobile and desktop
- **Test CORS** button to check connectivity

## 📝 Usage

1. **Setup**: Choose a CORS solution (see above)
2. **Configure**: Enter your API URL, username, and token
3. **Fill Form**: Complete the task details
4. **Test**: Use "Test CORS" button to verify connectivity
5. **Create**: Click "Create Task" to submit

## 🔧 Configuration

### API Settings
- **API URL**: Your Kanboard JSON-RPC endpoint
- **Username**: Usually "jsonrpc" for API access
- **Token**: Your API token (not your password)

### Task Parameters
- **Title**: Task name (required)
- **Project ID**: Target project ID (required)
- **Column ID**: Board column ID (required)
- **Owner ID**: Assigned user ID (required)
- **Color**: Task color (green, red, blue, etc.)
- **Priority**: None, Low, Normal, High, Urgent
- **Due Date**: Optional deadline
- **Description**: Task details
- **Tags**: Comma-separated tags
- **Reference**: External reference ID

## 🐛 Troubleshooting

### "Failed to fetch" Error
- **Cause**: CORS policy blocking request
- **Solution**: Use local server or CORS proxy

### "HTTP 401 Unauthorized"
- **Cause**: Invalid credentials
- **Solution**: Check API username and token

### "HTTP 404 Not Found"
- **Cause**: Wrong API URL
- **Solution**: Verify the endpoint URL

### Network Errors
- **Cause**: API server down or unreachable
- **Solution**: Check server status and network connection

## 🔐 Security Notes

- API tokens are not saved to local storage
- Use CORS proxy only for testing
- For production, properly configure CORS on your server
- Don't share your API tokens publicly

## 📁 Files

- `index.html` - Main application interface
- `styles.css` - Styling and responsive design
- `script.js` - Application logic and API handling
- `start-server.bat` - Easy server startup script
- `README.md` - This documentation

## 🚀 API Reference

This tool uses Kanboard's JSON-RPC API. The `createTask` method expects:

```json
{
    "jsonrpc": "2.0",
    "method": "createTask",
    "id": 1,
    "params": {
        "title": "Task title",
        "project_id": 1,
        "color_id": "green",
        "column_id": 2,
        "owner_id": 1,
        // ... additional parameters
    }
}
```

## 📞 Support

If you encounter issues:
1. Check browser console for detailed error messages
2. Use the "Test CORS" button to verify connectivity
3. Try the local server solution
4. Verify your API credentials and URL

---

**Happy task creating! 🎉**
