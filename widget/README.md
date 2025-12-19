# Schym Chat Widget

Embeddable AI chat widget for schym.de and other websites.

## Quick Start

### Option 1: Direct Embed (Simplest)

Add this to any HTML page:

```html
<!-- Container -->
<div id="schym-chat"></div>

<!-- Widget Script -->
<script src="https://chat.schym.de/widget/schym-chat-widget.js"></script>
<script>
  SchymChat.init({
    container: '#schym-chat',
    apiUrl: 'https://chat.schym.de',
    theme: 'light' // or 'dark'
  });
</script>
```

### Option 2: Floating Chat Button

```html
<div id="schym-chat" class="schym-chat-floating"></div>
<link rel="stylesheet" href="https://chat.schym.de/widget/schym-chat-widget.css">
<script src="https://chat.schym.de/widget/schym-chat-widget.js"></script>
<script>
  SchymChat.init({
    container: '#schym-chat',
    apiUrl: 'https://chat.schym.de',
    theme: 'dark'
  });
</script>
```

### Option 3: Copy Files to Your Project

Copy these files to your project:
- `schym-chat-widget.js`
- `schym-chat-widget.css` (optional)

## Configuration Options

```javascript
SchymChat.init({
  // Required
  container: '#schym-chat',      // CSS selector for container
  
  // Optional
  apiUrl: 'https://chat.schym.de', // Chat API URL
  theme: 'light',                  // 'light' or 'dark'
  title: 'Chat mit KI',            // Header title
  placeholder: 'Stelle eine Frage...', // Input placeholder
  welcomeMessage: 'Hallo!',        // Initial message (null to disable)
  
  // Custom styles (CSS strings)
  styles: {
    container: 'max-width: 350px;',
    header: 'background: #your-brand-color;',
    messages: '',
    inputArea: '',
    input: '',
    sendButton: 'background: #your-brand-color;'
  }
});
```

## Styling Examples

### Match Your Brand Colors

```javascript
SchymChat.init({
  container: '#schym-chat',
  theme: 'light',
  styles: {
    header: 'background: #2c3e50; color: white;',
    sendButton: 'background: #2c3e50;'
  }
});
```

### Full-Width Chat

```javascript
SchymChat.init({
  container: '#schym-chat',
  styles: {
    container: 'max-width: 100%; height: 600px;'
  }
});
```

### Custom Rounded Corners

```javascript
SchymChat.init({
  container: '#schym-chat',
  styles: {
    container: 'border-radius: 24px;'
  }
});
```

## Integration with Static Web App (schym.de)

### Method A: Add to a Page

In your Astro/React/Vue component:

```astro
---
// In your .astro file
---
<div id="chat-widget"></div>

<script>
  import '/path/to/schym-chat-widget.js';
  
  SchymChat.init({
    container: '#chat-widget',
    apiUrl: 'https://chat.schym.de'
  });
</script>
```

### Method B: As a Reusable Component

Create a component:

```jsx
// ChatWidget.jsx
import { useEffect, useRef } from 'react';

export default function ChatWidget({ theme = 'light' }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (typeof SchymChat !== 'undefined' && containerRef.current) {
      SchymChat.init({
        container: containerRef.current,
        apiUrl: 'https://chat.schym.de',
        theme
      });
    }
  }, []);
  
  return <div ref={containerRef} />;
}
```

## CORS Note

The chat API (chat.schym.de) needs to allow requests from your domain. 
This is already configured for schym.de.

For other domains, update the Container App CORS settings:

```bash
az containerapp update \
  --name "ca-api-t77qazmlhhtaa" \
  --resource-group "rg-schym-website-foundry-search" \
  --set-env-vars "ALLOWED_ORIGINS=https://schym.de,https://www.schym.de,https://your-domain.com"
```

## Files

- `schym-chat-widget.js` - Main widget (required)
- `schym-chat-widget.css` - Additional styles (optional)
- `demo.html` - Demo page

## License

MIT
