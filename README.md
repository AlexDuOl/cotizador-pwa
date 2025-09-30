Guía para correr y probar tu PWA de cotizador
Pasos
Preparar los archivos

Asegúrate de que todos los archivos (index.html, styles.css, app.js, manifest.json, sw.js) estén en una misma carpeta, por ejemplo, cotizador-pwa.
Abrir un servidor local

La mayoría de los navegadores no permiten cargar correctamente archivos con file:// cuando usas service workers o manifest, por eso es necesario usar un servidor local.
Para hacerlo fácilmente, si tienes Python instalado, abre una terminal o consola en la carpeta de tu proyecto y ejecuta el siguiente comando:

Para Python 3:
python -m http.server 8000

Para Python 2:
python -m SimpleHTTPServer 8000

Acceder en el navegador

Abre tu navegador (por ejemplo, Chrome).
Navega a la dirección:
http://localhost:8000

Probar la PWA

Ingresa valores en los campos y verifica que el cálculo se haga correctamente.

Para agregarla a la pantalla de inicio en tu móvil:
    Abre la página en Chrome.
    Toca en los tres puntos (menú).
    Selecciona "Agregar a pantalla de inicio".

Como depurar o verificar
    Usa las herramientas de desarrollo del navegador (F12 o clic derecho > Inspeccionar).
    En Chrome, en la pestaña Aplicación podrás ver si el manifiesto se carga correctamente y si el service worker está activo.
