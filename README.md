# Excalidraw with Custom Storage Examples

### Installation:

1. Create a new react app.
2. Install the package using `npm i excalidraw-with-storage`.

### Integration

1. Import the component and the storage provider interface

```typescript
import { ExcalidrawApp, StorageProvider } from "excalidraw-with-storage";
```

2. Create your own class that implements `StorageProvider`. You can find sample implementations in the `src/examples` folder.

3. Set up the `excalidraw-room` library.

   - Clone the excalidraw-room repository.
     - `git clone https://github.com/excalidraw/excalidraw-room.git`
   - Install the packages
     - `yarn`
   - Run a dev server. The websocket server will be running at `http://localhost:3002`
     - `yarn start:dev`

4. Use the ExcalidrawApp component in your application.

```tsx
<ExcalidrawApp
    storageProvider={storageProvider}
    excalidraw={{ aiEnabled: false }}
    collabServerUrl="http://localhost:3002"
/>
```
