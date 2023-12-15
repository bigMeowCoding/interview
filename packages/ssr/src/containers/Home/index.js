import Navbar from "../../components/navbar";

import React from "react";

const Home = () => {
  return (
    <>
      <Navbar />
      <h2>home</h2>
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
