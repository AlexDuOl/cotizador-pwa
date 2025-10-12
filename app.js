// ====================================================================
// CONFIGURACIÓN DE RUTAS Y CONSTANTES GLOBALES
// ====================================================================

// **IMPORTANTE: AJUSTAR SEGÚN EL ENTORNO**
//const REPO_PATH = ''; 
const REPO_PATH = '/cotizador-pwa'; 

// Constantes de tiempo de trabajo y fiscales
const DIAS_TRABAJADOS_ANUAL = 300;
const HORAS_TRABAJO_DIARIO = 3;
const MINUTOS_POR_HORA = 60;
const IVA = 0.16;

// Costos fijos de operación
const costosFijos = [
    { concepto: "Luz", costo: 2000, frecuencia: "mensual" },
    { concepto: "Sueldo Propio", costo: 2500, frecuencia: "semanal" },
    { concepto: "Renta", costo: 4000, frecuencia: "mensual" },
    { concepto: "Tubo Láser", costo: 10000, frecuencia: "anual" },
    { concepto: "Mantenimiento Anual", costo: 4000, frecuencia: "anual" },
    { concepto: "Recuperación de la Inversión", costo: 150000, frecuencia: "anual" },
    { concepto: "Renta de Celular / Comunicación", costo: 1000, frecuencia: "mensual" },
    { concepto: "Sueldo Empleado", costo: 2000, frecuencia: "semanal" },
    { concepto: "Publicidad / Marketing", costo: 500, frecuencia: "mensual" }
];

// Costo por centímetro cuadrado para cada material
const costosMaterialesPorCm2 = {
    // MDF
    "MDF3mm": 0.017, 
    "MDF6mm": 0.042, 
    
    // Acrílicos
    "AcrilicoCristal": 0.047,
    "AcrilicoNegro": 0.052, 
    "AcrilicoBlanco": 0.052, 
    "AcrilicoDorado": 0.065,
    "AcrilicoPlata": 0.065,
    "AcrilicoRosaGold": 0.065,
    
    // Otros
    "Papel": 0.010,
    
    // Servicios y otros que usan el campo 'Cantidad'
    "Grabado": 0.50,       
};


// Variable global para almacenar los detalles de la cotización
window.cotizacionData = null;


// ====================================================================
// CÁLCULO DEL COSTO OPERACIONAL POR MINUTO
// ====================================================================

function calcularCostosOperacionales(listaCostos) {
    let costoTotalAnual = 0;
    
    listaCostos.forEach(item => {
        let costoAnual;
        
        switch (item.frecuencia) {
            case 'semanal':
                costoAnual = item.costo * 52;
                break;
            case 'mensual':
                costoAnual = item.costo * 12;
                break;
            case 'anual':
            default:
                costoAnual = item.costo;
                break;
        }
        
        costoTotalAnual += costoAnual; 
    });
    
    const costoTotalDiario = costoTotalAnual / DIAS_TRABAJADOS_ANUAL;
    const costoTotalPorHora = costoTotalDiario / HORAS_TRABAJO_DIARIO;
    const costoTotalPorMinuto = costoTotalPorHora / MINUTOS_POR_HORA;

    return { totalPorMinuto: costoTotalPorMinuto };
}

const resultadosOperacionales = calcularCostosOperacionales(costosFijos);
const COSTO_OPERACIONAL_POR_MINUTO = resultadosOperacionales.totalPorMinuto; 


// ====================================================================
// LÓGICA DEL FORMULARIO Y CÁLCULO
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Solo necesitamos el listener del formulario
    const form = document.getElementById('calculadora-form');
    form.addEventListener('submit', calcularTotal);
});

function calcularTotal(e) {
    e.preventDefault(); 

    // Referencias a los elementos
    const material = document.getElementById('material').value;
    const tipoVenta = document.getElementById('tipo-venta').value;
    const cantidad = parseFloat(document.getElementById('cantidad').value);
    const ancho = parseInt(document.getElementById('ancho').value);
    const alto = parseInt(document.getElementById('alto').value);
    const tiempoCorte = parseInt(document.getElementById('tiempo-corte').value);

    // Variables de cálculo 
    let costoBase = 0; 
    let factorDescuentoMaterial = 1.0;
    let factorUtilidad = 1.0;
    let costoMaquina = 0;
    
    // --- Lógica de Descuento (Factor de Venta) ---
    switch (tipoVenta) {
        case 'publico': 
            factorDescuentoMaterial = 1.0; 
            factorUtilidad = 1.0; // 100% de utilidad
            break;
        case 'medio-mayoreo': 
            factorDescuentoMaterial = 0.80; 
            factorUtilidad = 0.80; // 80% de utilidad
            break;
        case 'mayoreo': 
            factorDescuentoMaterial = 0.50; 
            factorUtilidad = 0.50; // 50% de utilidad
            break;
    }

    // --- CÁLCULO 1: COSTO UNITARIO MATERIAL X CM² ---
    const costoCm2 = costosMaterialesPorCm2[material] || 0;
    const areaCorte = ancho * alto;

    if (costoCm2 > 0) {
        // Fórmula: Área * Costo por cm² * Factor de Descuento (del tipo de venta)
        costoBase = (areaCorte * costoCm2) * factorDescuentoMaterial;
    } else {
        // Uso directo del campo 'Cantidad' (para servicios como Grabado, Renta, etc.)
        costoBase = cantidad;
    }

    // --- CÁLCULO 2: COSTO DE MÁQUINA ---
    // Fórmula: Tiempo de Corte x Costo Operacional por Minuto
    costoMaquina = tiempoCorte * COSTO_OPERACIONAL_POR_MINUTO;

    // --- CÁLCULO 3: COSTO POR PIEZA (Costo Total sin Ganancia/IVA) ---
    const costoPorPieza = costoBase + costoMaquina;

    // --- CÁLCULO 4: MARGEN DE UTILIDAD (Ganancia) ---
    // Fórmula: Costo por Pieza x Factor de Utilidad
    const margenUtilidad = costoPorPieza * factorUtilidad;

    // --- CÁLCULO 5: PRECIO FINAL (P. Venta con IVA) ---
    const precioSinIva = costoPorPieza + margenUtilidad;
    const costoFinalSinRedondear = precioSinIva * (1 + IVA);
    
    // Aplicar redondeo al entero superior (Math.ceil)
    const costoFinal = Math.ceil(costoFinalSinRedondear);

    // =========================================================
    // NUEVO CÁLCULO: ANTICIPO (50% del costoFinal redondeado)
    // =========================================================
    const anticipo = costoFinal * 0.50;
    
    // 4. Mostrar Resultado y activar botones
    const totalFinalFormateado = costoFinal.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0
    });

    document.getElementById('resultado-total').innerHTML = `El Total Estimado (c/IVA) es: <strong>${totalFinalFormateado}</strong>`;
    document.getElementById('resultado-total').style.display = 'block';

    document.getElementById('btn-descargar-pdf').style.display = 'block';
    document.getElementById('btn-whatsapp').style.display = 'block';

    // 5. Consola y almacenamiento final
    console.log("--- Resumen de Precios ---");
    console.log(`Costo por Pieza (sin Ganancia): $${costoPorPieza.toFixed(2)}`);
    console.log(`Margen de Utilidad: $${margenUtilidad.toFixed(2)}`);
    console.log(`Precio SIN IVA (Subtotal): $${precioSinIva.toFixed(2)}`);
    console.log(`Precio FINAL (CON IVA, Redondeado): $${costoFinal.toFixed(2)}`); 
     console.log(`Anticipo (50% del Total): $${anticipo.toFixed(2)}`);
    console.log("--------------------------");

    // Almacenar datos para el PDF/WhatsApp
    window.cotizacionData = {
        total: costoFinal,
        formateado: totalFinalFormateado,
        material: document.querySelector('#material option:checked').textContent,
        tipoVenta: document.querySelector('#tipo-venta option:checked').textContent,
        cantidad: cantidad,
        ancho: ancho,
        alto: alto,
        tiempoCorte: tiempoCorte,
        
        costoBaseCalculado: costoBase.toFixed(2), 
        costoOperacional: costoMaquina.toFixed(2), 
        costoPorPieza: costoPorPieza.toFixed(2),
        margenUtilidad: margenUtilidad.toFixed(2),
        precioSinIva: precioSinIva.toFixed(2),
        // IVA ajustado para reflejar la diferencia por redondeo
        ivaAplicado: (costoFinal - precioSinIva).toFixed(2),

        // NUEVO: Guardar el anticipo formateado
        anticipo: anticipo,
        anticipoFormateado: anticipo.toLocaleString('es-MX', {
            style: 'currency',
            currency: 'MXN',
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0
        }),
    };
}


// ====================================================================
// LÓGICA DE GENERACIÓN Y DESCARGA DE PDF
// ====================================================================

function imgToBase64(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url); 
    xhr.responseType = 'blob';
    xhr.send();
}

function descargarPDF() {
    if (!window.cotizacionData) {
        alert("Primero debes calcular la cotización.");
        return;
    }
    
    const data = window.cotizacionData;
    
    const { jsPDF } = window.jspdf; 
    const doc = new jsPDF();
    const nombreEmpresa = "Tu Empresa de Corte Láser"; 
    
    const logoUrl = `${REPO_PATH}/images/Logo1.jpg`; 

    imgToBase64(logoUrl, function(logoBase64) {
        
        // 1. Logo (20mm x 20mm)
        doc.addImage(logoBase64, 'JPG', 15, 10, 20, 20); 
        
        // 2. Título y Datos Generales
        doc.setFontSize(18);
        doc.text("COTIZACIÓN DE PROYECTO", 105, 25, null, null, "center");
        
        doc.setFontSize(10);
        doc.text(`Empresa: ${nombreEmpresa}`, 15, 45);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 15, 50);
        doc.text(`Validez de la Cotización: 1 SEMANA`, 15, 55); 
        doc.text(`Para realizar cualquier pedido se requiere el pago del 50% de anticipo`, 15, 60); 
        doc.text(`Tiempo de entrega: 5 días hábiles a partir del pago del anticipo`, 15, 65); 
        
        let startY = 70;

        // 3. Detalles de la Cotización (Solo modo Corte Láser/Servicios)
        const tableData = [
            ["Material Cotizado", data.material],
            //["Tipo de Venta", data.tipoVenta],
            ["Dimensiones (cm)", `${data.ancho} x ${data.alto}`],
            ["Área Total (cm²)", data.ancho * data.alto],
            //["Tiempo de Corte (min)", data.tiempoCorte],
            //["Costo Base Material (c/Dscto)", `$${data.costoBaseCalculado}`],
            //["Costo Máquina (Operac.)", `$${data.costoOperacional}`],
            //["Costo TOTAL por Pieza", `$${data.costoPorPieza}`],
            //["Margen de Utilidad (Ganancia)", `$${data.margenUtilidad}`],
        ];

        doc.autoTable({
            startY: startY,
            head: [['Detalle Cotizado', 'Valor']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [74, 144, 226] }, 
        });
        
        const finalY = doc.autoTable.previous.finalY;

        // 4. Mostrar Total
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); 
        doc.text(`SUBTOTAL: $${data.precioSinIva}`, 15, finalY + 10);
        doc.text(`IVA (16%): $${data.ivaAplicado}`, 15, finalY + 15);

         // NUEVO: Mostrar el Anticipo
        doc.setFontSize(14);
        doc.setTextColor(200, 0, 0); // Opcional: usar un color diferente para destacarlo
        doc.text(`ANTICIPO REQUERIDO (50%): ${data.anticipoFormateado}`, 15, finalY + 20); 
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0); 
        doc.text(`TOTAL: ${data.formateado}`, 15, finalY + 30);

        // 5. Descargar el PDF
        doc.save(`Cotizacion_${nombreEmpresa.replace(/\s/g, "")}_${new Date().getTime()}.pdf`);
    });
}


// ====================================================================
// LÓGICA DE COMPARTIR POR WHATSAPP
// ====================================================================

function compartirPorWhatsApp() {
    const data = window.cotizacionData;
    
    let mensaje = `¡Hola! Aquí está tu cotización:\n\n`;
    
    mensaje += `*Producto:* ${data.material}\n`;
    mensaje += `*Dimensiones:* ${data.ancho}cm x ${data.alto}cm\n`;
    //mensaje += `*Tiempo Estimado de Corte:* ${data.tiempoCorte} min\n`;

     // NUEVO: Añadir la línea del anticipo
    mensaje += `\n*ANTICIPO REQUERIDO (50%):* ${data.anticipoFormateado}\n`;
    mensaje += `\n*TOTAL:* ${data.formateado}\n\n`;
    mensaje += `*Importante:* Esta cotización tiene una validez de *1 SEMANA*.\n\n`;
    mensaje += `Recuerda realizar tu pedido con anticipación, no realizamos pedidos urgentes.`;

    const urlEncoded = encodeURIComponent(mensaje);
    
    window.open(`https://api.whatsapp.com/send?text=${urlEncoded}`, '_blank');
}