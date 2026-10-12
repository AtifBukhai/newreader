// Test file to verify the application can initialize without errors

import { kitaboService } from './services/kitabo';

console.log('=== Kitabo Application Test ===');

// Test 1: Service initialization
console.log('Test 1: Service initialization');
try {
  const state = kitaboService.getState();
  console.log('✓ Service initialized');
  console.log('  - Demo mode:', state ? 'Yes' : 'No (Supabase)');
  console.log('  - Users:', kitaboService.getUsers().length);
  console.log('  - Partners:', kitaboService.getPartners().length);
  console.log('  - Books:', kitaboService.getBooks().length);
} catch (error) {
  console.error('✗ Service initialization failed:', error);
}

// Test 2: Authentication
console.log('\nTest 2: Authentication');
(async () => {
  try {
    const result = await kitaboService.signIn('admin@kitabo.io', 'test');
    if (result.success) {
      console.log('✓ Login successful');
      console.log('  - User:', result.data?.name);
      console.log('  - Role:', result.data?.role);
      console.log('  - Status:', result.data?.status);
    } else {
      console.error('✗ Login failed:', result.error);
    }
  } catch (error) {
    console.error('✗ Authentication error:', error);
  }

  // Test 3: Get current user
  console.log('\nTest 3: Get current user');
  try {
    const user = await kitaboService.getCurrentUser();
    if (user) {
      console.log('✓ Current user retrieved');
      console.log('  - User:', user.name);
      console.log('  - Role:', user.role);
    } else {
      console.log('⚠ No current user (not logged in)');
    }
  } catch (error) {
    console.error('✗ Get current user error:', error);
  }

  // Test 4: Get all data
  console.log('\nTest 4: Get all data');
  try {
    const data = {
      users: kitaboService.getUsers(),
      partners: kitaboService.getPartners(),
      partnerEmails: kitaboService.getPartnerEmails(),
      rolePermissions: kitaboService.getRolePermissions(),
      classrooms: kitaboService.getClassrooms(),
      books: kitaboService.getBooks(),
      orders: kitaboService.getOrders(),
      codes: kitaboService.getCodes(),
      batches: kitaboService.getBatches(),
      entitlements: kitaboService.getEntitlements(),
      devices: kitaboService.getDevices(),
      progress: kitaboService.getProgress(),
      bookmarks: kitaboService.getBookmarks(),
      highlights: kitaboService.getHighlights(),
      auditLogs: kitaboService.getAuditLogs(),
      exports: kitaboService.getExports(),
    };
    
    console.log('✓ All data retrieved successfully');
    Object.entries(data).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value.length} items`);
    });
  } catch (error) {
    console.error('✗ Get data error:', error);
  }

  console.log('\n=== Test Complete ===');
})();
