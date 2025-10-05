// Test script to verify sidebar settings
console.log('Testing sidebar settings...');

// This script can be run in the browser console to test sidebar settings
const testSidebarSettings = () => {
  // Check if the sidebar elements exist
  const sider = document.querySelector('.ant-layout-sider');
  const menu = document.querySelector('.ant-layout-sider .ant-menu');
  const menuItems = document.querySelectorAll('.ant-layout-sider .ant-menu-item');
  
  console.log('Sidebar elements found:', {
    sider: !!sider,
    menu: !!menu,
    menuItems: menuItems.length
  });
  
  // Check for custom styles
  const customStyles = document.querySelector('style[data-custom-sidebar]') || 
                      Array.from(document.querySelectorAll('style')).find(style => 
                        style.innerHTML.includes('ant-layout-sider'));
  
  console.log('Custom styles found:', !!customStyles);
  if (customStyles) {
    console.log('Custom styles content:', customStyles.innerHTML);
  }
  
  // Check computed styles
  if (sider) {
    const siderStyles = window.getComputedStyle(sider);
    console.log('Sider computed styles:', {
      backgroundColor: siderStyles.backgroundColor,
      color: siderStyles.color
    });
  }
  
  if (menuItems.length > 0) {
    const firstMenuItem = menuItems[0];
    const itemStyles = window.getComputedStyle(firstMenuItem);
    console.log('First menu item computed styles:', {
      backgroundColor: itemStyles.backgroundColor,
      color: itemStyles.color
    });
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testSidebarSettings = testSidebarSettings;
}