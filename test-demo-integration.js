// Test script for demo features integration
// Run this in the browser console to test the TaskCreator functionality

console.log('Testing Demo Features Integration...');

// Test 1: Check if TaskCreator class is defined
if (typeof TaskCreator !== 'undefined') {
    console.log('✅ TaskCreator class is defined');
} else {
    console.log('❌ TaskCreator class is not defined');
}

// Test 2: Check if EnhancedTaskCreator class is defined
if (typeof EnhancedTaskCreator !== 'undefined') {
    console.log('✅ EnhancedTaskCreator class is defined');
} else {
    console.log('❌ EnhancedTaskCreator class is not defined');
}

// Test 3: Check if API form exists
const apiForm = document.getElementById('apiTaskForm');
if (apiForm) {
    console.log('✅ API Task form found');
} else {
    console.log('❌ API Task form not found');
}

// Test 4: Check if response output container exists
const responseOutput = document.getElementById('responseOutput');
if (responseOutput) {
    console.log('✅ Response output container found');
} else {
    console.log('❌ Response output container not found');
}

// Test 5: Check if CORS proxy elements exist
const corsProxy = document.getElementById('useCorsProxy');
const corsProxyUrl = document.getElementById('corsProxyUrl');
if (corsProxy && corsProxyUrl) {
    console.log('✅ CORS proxy controls found');
} else {
    console.log('❌ CORS proxy controls not found');
}

// Test 6: Check if apiUtils object is defined
if (typeof apiUtils !== 'undefined') {
    console.log('✅ apiUtils object is defined');
} else {
    console.log('❌ apiUtils object is not defined');
}

// Test 7: Test localStorage functionality
try {
    const testData = { test: 'value' };
    apiUtils.saveApiFormData(testData);
    const retrieved = apiUtils.loadApiFormData();
    if (retrieved && retrieved.test === 'value') {
        console.log('✅ localStorage functionality working');
    } else {
        console.log('❌ localStorage functionality not working');
    }
    // Clean up
    localStorage.removeItem('taskCreatorFormData');
} catch (error) {
    console.log('❌ Error testing localStorage:', error.message);
}

console.log('Demo Features Integration Test Complete!');
