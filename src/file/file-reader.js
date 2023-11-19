const fileInput = document.getElementById("fileInput");
const fileContent = document.getElementById("fileContent");

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener("load", (loadEvent) => {
      console.log('load',loadEvent)
    const content = loadEvent.target.result;
    fileContent.textContent = content;
  });
  reader.addEventListener("error", (e) => {
    console.error("error", e);
  });
  reader.readAsText(file);
});
