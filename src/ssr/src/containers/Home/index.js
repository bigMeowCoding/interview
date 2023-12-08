const React = require("react");

const Home = () => {
  return (
    <>
      <h1>home</h1>
      <button
        onClick={() => {
          alert("click");
        }}
      >
        button
      </button>
    </>
  );
};
export default Home;
