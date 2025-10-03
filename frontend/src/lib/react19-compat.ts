import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

// Configure Ant Design for React 19 compatibility
// This is a fallback method for when the compatibility package doesn't work
export function configureAntdForReact19() {
  try {
    unstableSetRender((node, container) => {
      // Create or reuse root for the container
      if (!(container as any)._reactRoot) {
        (container as any)._reactRoot = createRoot(container);
      }
      
      const root = (container as any)._reactRoot;
      root.render(node);
      
      // Return cleanup function
      return async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
        root.unmount();
        delete (container as any)._reactRoot;
      };
    });
    
    console.log('✅ Ant Design React 19 compatibility configured successfully');
  } catch (error) {
    console.warn('⚠️ Failed to configure Ant Design React 19 compatibility:', error);
  }
}