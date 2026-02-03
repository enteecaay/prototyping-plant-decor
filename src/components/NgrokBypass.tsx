'use client';

import { useEffect } from 'react';

export default function NgrokBypass() {
  useEffect(() => {
    // Check if we have the bypass flag in sessionStorage
    const hasBypassed = sessionStorage.getItem('ngrok-bypassed');
    
    if (!hasBypassed) {
      // Create a hidden iframe with the ngrok-skip-browser-warning header
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      
      // Create a blob with the header info
      const blob = new Blob(
        [
          `<!DOCTYPE html>
          <html>
          <head>
            <title>Bypassing...</title>
          </head>
          <body>
            <script>
              // Set ngrok bypass flag
              sessionStorage.setItem('ngrok-bypassed', 'true');
              // Redirect to main page
              window.location.href = '${typeof window !== 'undefined' ? window.location.origin : '/'}';
            </script>
          </body>
          </html>`,
        ],
        { type: 'text/html' }
      );
      
      iframe.src = URL.createObjectURL(blob);
      iframe.onload = () => {
        // Give it a moment then remove
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      };
      
      // Try redirect approach instead
      if (typeof window !== 'undefined' && window.location.href.includes('ngrok')) {
        sessionStorage.setItem('ngrok-bypassed', 'true');
        // Add header via fetch and reload
        fetch(window.location.href, {
          method: 'GET',
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        }).then(() => {
          window.location.reload();
        });
      }
    }
  }, []);

  return null;
}
