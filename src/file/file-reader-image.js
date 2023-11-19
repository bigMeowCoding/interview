const fileInput = document.getElementById("fileInput");
const imageWrapper = document.getElementById("image");

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.addEventListener("load", (loadEvent) => {
    console.log("load", loadEvent);
    const content = loadEvent.target.result;
    const img = new Image();
    img.src = content;
    imageWrapper.appendChild(img);
  });
  reader.addEventListener("error", (e) => {
    console.error("error", e);
  });
  reader.readAsDataURL(file);
});
