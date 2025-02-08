// import WithFirebase from "./examples/firebase/WithFirebase";
import WithPocketbase from "./examples/pocketbase/WithPocketbase";
// import WithSupabase from "./examples/supabase/WithSupabase";

function App() {
  return (
    <>
      <WithPocketbase />
      {/* <WithSupabase /> */}
      {/* <WithAppwrite /> */}
      {/* <WithFirebase /> */}
    </>
  );
}

export default App;
