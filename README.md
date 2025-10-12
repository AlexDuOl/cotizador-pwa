-----

# 🛠️ Calculadora de Precios Láser (PWA)

Esta es una Aplicación Web Progresiva (PWA) diseñada para cotizar servicios de corte láser, calculando automáticamente los costos de material, operación de máquina y aplicando un margen de utilidad variable con redondeo superior.

-----

## 🚀 Funcionamiento del Calculador

El objetivo principal de esta aplicación es determinar el precio final de una pieza, asegurando que se cubran los costos operativos y se aplique la ganancia deseada, incluyendo el IVA.

### 1\. Variables de Entrada

Los datos que el usuario ingresa son clave:

  * **Material / Servicio:** Define el costo base por $\text{cm}^2$.
  * **Ancho y Alto ($\text{cm}$):** Determinan el área de corte.
  * **Tiempo de Corte ($\text{min}$):** Define el costo de máquina.
  * **Tipo de Venta:** Define el porcentaje de utilidad y el descuento aplicado al costo del material.

### 2\. Cadena de Cálculos (Lógica de Precios)

Todos los cálculos se realizan en el archivo `js/app.js` siguiendo el siguiente flujo:

1.  **Costo Operacional por Minuto:** Se calcula anualmente con base en los costos fijos (luz, sueldos, renta, mantenimiento, etc.) y se divide por los minutos productivos anuales.
2.  **Costo Base Material:**
    $$\text{Costo Material} = (\text{Área} \times \text{Costo}\text{cm}^2) \times \text{FactorDescuentoVenta}$$
    *(Nota: El Factor Descuento es 1.0 para Público, 0.80 para Medio Mayoreo, 0.50 para Mayoreo).*
3.  **Costo de Máquina:**
    $$\text{Costo Máquina} = \text{Tiempo Corte} \times \text{Costo Operacional por Minuto}$$
4.  **Costo por Pieza (Costo Total):**
    $$\text{Costo Pieza} = \text{Costo Material} + \text{Costo Máquina}$$
5.  **Margen de Utilidad:**
    $$\text{Margen Utilidad} = \text{Costo Pieza} \times \text{Factor Utilidad}$$
    *(Nota: El Factor Utilidad es 100% para Público, 80% para Medio Mayoreo, 50% para Mayoreo).*
6.  **Precio Final (con IVA y Redondeo):**
    $$\text{Precio Sin IVA} = \text{Costo Pieza} + \text{Margen Utilidad}$$
    $$\text{Total Estimado} = \text{Math.ceil}(\text{Precio Sin IVA} \times 1.16)$$
    *(La función $\text{Math.ceil()}$ asegura que el total siempre se redondee al entero superior, evitando precios con centavos).*

-----

## 🔧 Configuración de Rutas (Local vs. GitHub Pages)

Dado que este proyecto es una PWA y se despliega en una subcarpeta en GitHub Pages (ej: `tuusuario.github.io/tu-repo/`), debes ajustar las rutas de los archivos (`manifest.json`, `Logo1.jpg`, `sw.js`, etc.) utilizando la constante `REPO_PATH`.

### 1\. Constante `REPO_PATH`

En el archivo **`js/app.js`**, la constante `REPO_PATH` controla la ruta base.

| Entorno | Valor de `REPO_PATH` | Explicación |
| :--- | :--- | :--- |
| **Local** (`localhost:8080`) | `const REPO_PATH = '';` | Los archivos se sirven desde la raíz. |
| **Producción** (GitHub Pages) | `const REPO_PATH = '/tu-nombre-de-repositorio';` | Los archivos se sirven desde el directorio del repositorio. **DEBES** reemplazar el valor con el nombre exacto de tu repositorio. |

### 2\. Rutas del Service Worker

En el archivo **`js/sw-register.js`** (o en el bloque de registro de tu `index.html`), también debes ajustar la ruta del Service Worker:

  * **Local:** `navigator.serviceWorker.register('sw.js')`
  * **Producción:** `navigator.serviceWorker.register('/tu-repo/sw.js')`

-----

## 📦 Estructura del Proyecto

```
.
├── index.html
├── manifest.json
├── sw.js                 # Service Worker: Maneja el caché y offline
├── css/
│   └── style.css
└── js/
    ├── app.js            # Lógica principal, cálculos y PDF/WhatsApp
    └── sw-register.js    # Script para registrar el Service Worker
└── images/
    └── Logo1.jpg         # Imagen del logo
```

-----

## ⚙️ Desarrollo y Troubleshooting

### Limpieza de Caché (¡Fundamental\!)

Durante el desarrollo, el **Service Worker** a menudo sirve archivos desactualizados, causando errores (`304 Not Modified`, `Uncaught TypeError`). Para forzar la actualización:

1.  Abre **Herramientas de Desarrollo** (F12).
2.  Ve a la pestaña **Application** (Aplicación).
3.  En **Service Workers**, marca **"Update on reload"** y haz clic en **"Unregister"**.
4.  En **Storage** (o Clear Storage), marca todas las opciones y haz clic en **"Clear site data"**.
5.  Recarga el navegador con **Ctrl + Shift + R**.

### Dependencias

El proyecto requiere la inclusión de las siguientes librerías externas para la generación de PDF (vía CDN en `index.html`):

  * `jspdf.umd.min.js`
  * `jspdf.plugin.autotable.min.js`