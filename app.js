document.getElementById('calcular').addEventListener('click', () => {
  const cantidad = parseFloat(document.getElementById('cantidad').value);
  const precio = parseFloat(document.getElementById('precio').value);
  if (isNaN(cantidad) || isNaN(precio)) {
    alert('Por favor ingresa valores válidos.');
    return;
  }
  const total = cantidad * precio;
  document.getElementById('total').textContent = total.toFixed(2);
});
