import WithPocketbase from "./examples/pocketbase/WithPocketbase";
// import WithSupabase from "./examples/supabase/WithSupabase";
// import WithAppwrite from "./examples/appwrite/WithAppwrite";
// import WithDirectus from "./examples/directus/WithDirectus";
// import WithFirebase from "./examples/firebase/WithFirebase";

import 'excalidraw-with-storage/index.css'

function App() {
  return (
    <div style={{height: '100dvh'}}>
      <WithPocketbase />
      {/* <WithSupabase /> */}
      {/* <WithAppwrite /> */}
      {/* <WithFirebase /> */}
      {/* <WithDirectus /> */}
    </>
  );
}

export default App;
