const colorPicker = document.getElementById('bgPicker');
const savedColor = localStorage.getItem('userBgColor');

if (savedColor) {
  document.body.style.backgroundColor = savedColor;
  if (colorPicker) colorPicker.value = savedColor;
}

if (colorPicker) {
  colorPicker.addEventListener('input', (event) => {
    const color = event.target.value;
    document.body.style.backgroundColor = color;
    localStorage.setItem('userBgColor', color);
  });
}