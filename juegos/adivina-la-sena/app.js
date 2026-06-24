"use strict";

const URL_BANCO_LSP = "https://gabriel-lsp.github.io/banco-digital-accesible/lsp/datos/diccionario_lsp.json";
const URL_IMAGENES_LSP = "https://gabriel-lsp.github.io/banco-digital-accesible/lsp/";

const NIVELES = {
  basico: {
    nombre: "Básico",
    clave: "BAS",
    meta: 5,
    categorias: ["familia", "alimentos", "colores", "numeros", "números", "contexto escolar", "saludos", "animales", "cuerpo humano"],
    palabras: ["agua", "comer", "casa", "mamá", "mama", "papá", "papa", "niño", "niña", "profesor", "colegio", "escuela", "rojo", "azul", "amarillo", "verde"]
  },
  intermedio: {
    nombre: "Intermedio",
    clave: "INT",
    meta: 8,
    categorias: ["profesiones", "instituciones y lugares", "países y ciudades", "paises y ciudades", "dias de la semana", "meses", "verbos", "emociones", "primeros auxilios"]
  },
  avanzado: {
    nombre: "Avanzado",
    clave: "AVA",
    meta: 10,
    categorias: ["adjetivos", "pronombres", "preposiciones", "conectores", "valores", "tecnologia", "tecnología", "secuencias", "himno nacional", "padre nuestro", "ave maria", "ave maría"]
  }
};

const datosFallback = [
  { id: "demo-1", categoria: "familia", palabra: "mamá", descripcion: "Seña de uso frecuente en contexto familiar.", archivo_imagen: "imagenes/familia/mama.png" },
  { id: "demo-2", categoria: "familia", palabra: "papá", descripcion: "Seña de uso frecuente en contexto familiar.", archivo_imagen: "imagenes/familia/papa.png" },
  { id: "demo-3", categoria: "alimentos", palabra: "agua", descripcion: "Seña de uso cotidiano.", archivo_imagen: "imagenes/alimentos/agua.png" },
  { id: "demo-4", categoria: "colores", palabra: "azul", descripcion: "Seña de uso común en actividades escolares.", archivo_imagen: "imagenes/colores/azul.png" },
  { id: "demo-5", categoria: "contexto escolar", palabra: "colegio", descripcion: "Seña vinculada al contexto educativo.", archivo_imagen: "imagenes/contexto-escolar/colegio.png" }
];

const elementos = {
  nombre: document.querySelector("#nombre-participante"),
  nivel: document.querySelector("#nivel-juego"),
  iniciar: document.querySelector("#iniciar-juego"),
  imagen: document.querySelector("#imagen-sena"),
  categoria: document.querySelector("#categoria-sena"),
  pista: document.querySelector("#pista-sena"),
  alternativas: document.querySelector("#alternativas"),
  mensaje: document.querySelector("#mensaje"),
  racha: document.querySelector("#racha"),
  meta: document.querySelector("#meta"),
  preguntas: document.querySelector("#preguntas"),
  siguiente: document.querySelector("#siguiente"),
  reiniciar: document.querySelector("#reiniciar"),
  reconocimiento: document.querySelector("#reconocimiento"),
  nombreConstancia: document.querySelector("#nombre-constancia"),
  nivelConstancia: document.querySelector("#nivel-constancia"),
  fechaConstancia: document.querySelector("#fecha-constancia"),
  descargarReconocimiento: document.querySelector("#descargar-reconocimiento"),
  imprimirReconocimiento: document.querySelector("#imprimir-reconocimiento")
};

const estado = {
  banco: [],
  bancoNivel: [],
  nivel: "basico",
  preguntaActual: null,
  respuestaBloqueada: false,
  racha: 0,
  intentos: 0,
  logrado: false,
  codigoConstancia: ""
};

function normalizarTexto(texto) {
  return String(texto || "")
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatearTexto(texto) {
  return String(texto || "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letra) => letra.toLocaleUpperCase("es"));
}

function obtenerUrlImagen(item) {
  const archivo = String(item.archivo_imagen || "").trim();

  if (!archivo) {
    return "";
  }

  return archivo.startsWith("http") ? archivo : URL_IMAGENES_LSP + archivo.replace(/^\.\//, "");
}

function mezclar(lista) {
  return [...lista].sort(() => Math.random() - 0.5);
}

function limpiarDuplicadosPorPalabra(lista) {
  const vistos = new Set();

  return lista.filter((item) => {
    const clave = normalizarTexto(item.palabra);

    if (!clave || vistos.has(clave)) {
      return false;
    }

    vistos.add(clave);
    return true;
  });
}

function perteneceANivel(item, nivel) {
  const categoria = normalizarTexto(item.categoria);
  const palabra = normalizarTexto(item.palabra);
  const descripcion = normalizarTexto(item.descripcion);
  const configuracion = NIVELES[nivel];
  const categorias = (configuracion.categorias || []).map(normalizarTexto);
  const palabras = (configuracion.palabras || []).map(normalizarTexto);

  if (palabras.includes(palabra)) {
    return true;
  }

  if (categorias.some((categoriaNivel) => categoria.includes(categoriaNivel))) {
    return true;
  }

  if (nivel === "basico") {
    return descripcion.length <= 115 && !categoria.includes("adjetivos");
  }

  if (nivel === "intermedio") {
    return descripcion.length > 115 && descripcion.length <= 210;
  }

  return descripcion.length > 210 || categoria.includes("adjetivos");
}

function prepararBancoNivel() {
  const candidatos = estado.banco.filter((item) => perteneceANivel(item, estado.nivel));
  const base = candidatos.length >= 5 ? candidatos : estado.banco;
  estado.bancoNivel = limpiarDuplicadosPorPalabra(base).filter((item) => item.archivo_imagen && item.palabra);
}

function actualizarIndicadores() {
  const configuracion = NIVELES[estado.nivel];
  elementos.racha.textContent = String(estado.racha);
  elementos.meta.textContent = String(configuracion.meta);
  elementos.preguntas.textContent = String(estado.intentos);
}

function obtenerDistractores(correcta) {
  const categoriaCorrecta = normalizarTexto(correcta.categoria);
  const palabraCorrecta = normalizarTexto(correcta.palabra);

  const mismaCategoria = estado.bancoNivel.filter((item) =>
    normalizarTexto(item.categoria) === categoriaCorrecta &&
    normalizarTexto(item.palabra) !== palabraCorrecta
  );

  const mismoNivel = estado.bancoNivel.filter((item) => normalizarTexto(item.palabra) !== palabraCorrecta);
  const todos = estado.banco.filter((item) => item.palabra && normalizarTexto(item.palabra) !== palabraCorrecta);
  const mezclados = limpiarDuplicadosPorPalabra([...mezclar(mismaCategoria), ...mezclar(mismoNivel), ...mezclar(todos)]);

  return mezclados.slice(0, 4);
}

function crearPregunta() {
  if (estado.bancoNivel.length < 5) {
    elementos.mensaje.textContent = "No hay suficientes señas disponibles para formar las cinco alternativas.";
    elementos.mensaje.className = "mensaje incorrecto";
    return;
  }

  estado.respuestaBloqueada = false;
  elementos.siguiente.disabled = true;
  elementos.reconocimiento.hidden = true;
  elementos.mensaje.textContent = "Elige la palabra que corresponde a la seña mostrada.";
  elementos.mensaje.className = "mensaje";

  const correcta = mezclar(estado.bancoNivel)[0];
  const alternativas = mezclar([correcta, ...obtenerDistractores(correcta)]).slice(0, 5);

  estado.preguntaActual = correcta;
  elementos.imagen.hidden = false;
  elementos.imagen.src = obtenerUrlImagen(correcta);
  elementos.imagen.alt = "Seña en Lengua de Señas Peruana. Seleccione la palabra correcta entre las alternativas.";
  elementos.categoria.textContent = formatearTexto(correcta.categoria || "Lengua de Señas Peruana");
  elementos.pista.textContent = `Nivel ${NIVELES[estado.nivel].nombre}. Observe la seña y seleccione una alternativa.`;
  elementos.alternativas.innerHTML = "";

  alternativas.forEach((item) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "alternativa";
    boton.textContent = formatearTexto(item.palabra);
    boton.dataset.respuesta = normalizarTexto(item.palabra);
    boton.addEventListener("click", () => evaluarRespuesta(boton));
    elementos.alternativas.appendChild(boton);
  });
}

function evaluarRespuesta(boton) {
  if (estado.respuestaBloqueada || !estado.preguntaActual) {
    return;
  }

  estado.respuestaBloqueada = true;
  estado.intentos += 1;

  const respuesta = boton.dataset.respuesta;
  const correcta = normalizarTexto(estado.preguntaActual.palabra);
  const botones = [...elementos.alternativas.querySelectorAll(".alternativa")];

  botones.forEach((opcion) => {
    opcion.disabled = true;

    if (opcion.dataset.respuesta === correcta) {
      opcion.classList.add("correcta");
    }
  });

  if (respuesta === correcta) {
    estado.racha += 1;
    boton.classList.add("correcta");
    elementos.mensaje.textContent = `Correcto. Mantienes una racha de ${estado.racha} respuesta${estado.racha === 1 ? "" : "s"} correcta${estado.racha === 1 ? "" : "s"}.`;
    elementos.mensaje.className = "mensaje correcto";

    if (estado.racha >= NIVELES[estado.nivel].meta) {
      estado.logrado = true;
      elementos.siguiente.disabled = true;
      mostrarReconocimiento();
    } else {
      elementos.siguiente.disabled = false;
    }
  } else {
    estado.racha = 0;
    boton.classList.add("incorrecta");
    elementos.mensaje.textContent = `Respuesta incorrecta. La opción correcta era "${formatearTexto(estado.preguntaActual.palabra)}". La racha vuelve a cero.`;
    elementos.mensaje.className = "mensaje incorrecto";
    elementos.siguiente.disabled = false;
  }

  actualizarIndicadores();
}

function obtenerNombreParticipante() {
  const nombre = elementos.nombre.value.trim();
  return nombre || "Participante";
}

function obtenerIniciales(nombre) {
  const partes = normalizarTexto(nombre).split(" ").filter(Boolean).slice(0, 3);
  const iniciales = partes.map((parte) => parte.charAt(0).toUpperCase()).join("");
  return iniciales || "P";
}

function generarCodigoConstancia(nombre, nivel) {
  const fecha = new Date();
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const hora = String(fecha.getHours()).padStart(2, "0");
  const minuto = String(fecha.getMinutes()).padStart(2, "0");
  const segundo = String(fecha.getSeconds()).padStart(2, "0");
  const aleatorio = Math.random().toString(36).slice(2, 6).toUpperCase();
  const claveNivel = NIVELES[nivel].clave;
  const iniciales = obtenerIniciales(nombre);

  return `JIA-LSP-${claveNivel}-${anio}${mes}${dia}-${hora}${minuto}${segundo}-${iniciales}${aleatorio}`;
}

function asegurarCodigoEnConstancia() {
  let codigo = document.querySelector("#codigo-constancia");

  if (!codigo) {
    codigo = document.createElement("p");
    codigo.id = "codigo-constancia";
    codigo.style.marginTop = "12px";
    codigo.style.color = "#0f766e";
    codigo.style.fontWeight = "900";
    codigo.style.letterSpacing = ".06em";
    elementos.fechaConstancia.closest("p").insertAdjacentElement("afterend", codigo);
  }

  return codigo;
}

function mostrarReconocimiento() {
  const configuracion = NIVELES[estado.nivel];
  const nombre = obtenerNombreParticipante();
  const fecha = new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "long", year: "numeric" }).format(new Date());

  estado.codigoConstancia = generarCodigoConstancia(nombre, estado.nivel);
  elementos.nombreConstancia.textContent = nombre;
  elementos.nivelConstancia.textContent = `nivel ${configuracion.nombre.toLocaleLowerCase("es")}`;
  elementos.fechaConstancia.textContent = fecha;
  asegurarCodigoEnConstancia().textContent = `Código: ${estado.codigoConstancia}`;
  elementos.reconocimiento.hidden = false;
  elementos.mensaje.textContent = `Logro alcanzado: completaste el nivel ${configuracion.nombre}. Se generó la constancia simbólica con código ${estado.codigoConstancia}.`;
  elementos.mensaje.className = "mensaje correcto";
  elementos.reconocimiento.scrollIntoView({ behavior: "smooth", block: "start" });
}

function iniciarJuego() {
  estado.nivel = elementos.nivel.value;
  estado.racha = 0;
  estado.intentos = 0;
  estado.logrado = false;
  estado.codigoConstancia = "";
  prepararBancoNivel();
  actualizarIndicadores();
  crearPregunta();
}

function reiniciarNivel() {
  estado.racha = 0;
  estado.intentos = 0;
  estado.logrado = false;
  estado.codigoConstancia = "";
  actualizarIndicadores();
  elementos.reconocimiento.hidden = true;
  crearPregunta();
}

function dibujarTextoCentrado(ctx, texto, x, y, maxWidth, lineHeight) {
  const palabras = String(texto).split(" ");
  let linea = "";
  let posicionY = y;

  palabras.forEach((palabra, indice) => {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    const ancho = ctx.measureText(prueba).width;

    if (ancho > maxWidth && linea) {
      ctx.fillText(linea, x, posicionY);
      linea = palabra;
      posicionY += lineHeight;
    } else {
      linea = prueba;
    }

    if (indice === palabras.length - 1) {
      ctx.fillText(linea, x, posicionY);
    }
  });

  return posicionY;
}

function descargarReconocimiento() {
  const nombre = obtenerNombreParticipante();
  const nivel = NIVELES[estado.nivel].nombre;
  const fecha = elementos.fechaConstancia.textContent || new Intl.DateTimeFormat("es-PE").format(new Date());
  const codigo = estado.codigoConstancia || generarCodigoConstancia(nombre, estado.nivel);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 1400;
  canvas.height = 990;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f0fdfa";
  ctx.fillRect(48, 48, canvas.width - 96, canvas.height - 96);
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 8;
  ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);
  ctx.strokeStyle = "#d9e2ec";
  ctx.lineWidth = 3;
  ctx.strokeRect(96, 96, canvas.width - 192, canvas.height - 192);

  ctx.textAlign = "center";
  ctx.fillStyle = "#0f766e";
  ctx.font = "bold 34px Arial";
  ctx.fillText("CREBE \"Señor de los Milagros\" - Ucayali", canvas.width / 2, 170);

  ctx.fillStyle = "#072f57";
  ctx.font = "bold 58px Georgia";
  ctx.fillText("Reconocimiento simbólico de logro", canvas.width / 2, 280);

  ctx.fillStyle = "#486581";
  ctx.font = "32px Arial";
  ctx.fillText("Se otorga el presente reconocimiento simbólico a:", canvas.width / 2, 365);

  ctx.fillStyle = "#102a43";
  ctx.font = "bold 54px Georgia";
  dibujarTextoCentrado(ctx, nombre, canvas.width / 2, 465, 980, 58);

  ctx.strokeStyle = "#d9e2ec";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(360, 520);
  ctx.lineTo(1040, 520);
  ctx.stroke();

  ctx.fillStyle = "#486581";
  ctx.font = "31px Arial";
  ctx.fillText(`Por haber alcanzado el nivel ${nivel.toLocaleLowerCase("es")}`, canvas.width / 2, 610);
  ctx.fillText("en el juego educativo \"Adivina la seña\".", canvas.width / 2, 660);
  ctx.fillText(`Fecha: ${fecha}`, canvas.width / 2, 735);

  ctx.fillStyle = "#0f766e";
  ctx.font = "bold 26px Arial";
  ctx.fillText(`Código: ${codigo}`, canvas.width / 2, 790);

  ctx.fillStyle = "#627d98";
  ctx.font = "24px Arial";
  ctx.fillText("Este reconocimiento tiene finalidad educativa y motivacional.", canvas.width / 2, 850);
  ctx.fillText("No constituye certificación oficial.", canvas.width / 2, 885);

  const enlace = document.createElement("a");
  const nombreArchivo = normalizarTexto(nombre).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "participante";
  enlace.download = `constancia-simbolica-adivina-la-sena-${nombreArchivo}.png`;
  enlace.href = canvas.toDataURL("image/png");
  enlace.click();
}

async function cargarBanco() {
  elementos.mensaje.textContent = "Cargando banco de señas desde BDA...";

  try {
    const respuesta = await fetch(URL_BANCO_LSP, { cache: "no-store" });

    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new TypeError("El banco de señas debe contener una lista.");
    }

    estado.banco = limpiarDuplicadosPorPalabra(datos).filter((item) => item.archivo_imagen && item.palabra);
    elementos.mensaje.textContent = "Banco de señas preparado desde BDA. Seleccione un nivel e inicie el juego.";
    elementos.mensaje.className = "mensaje";
  } catch (error) {
    console.warn("No fue posible cargar el banco completo desde BDA. Se usará una muestra básica.", error);
    estado.banco = limpiarDuplicadosPorPalabra(datosFallback);
    elementos.mensaje.textContent = "No fue posible cargar el banco completo desde BDA. Se usará una muestra básica para probar el juego.";
    elementos.mensaje.className = "mensaje incorrecto";
  }

  prepararBancoNivel();
  actualizarIndicadores();
}

elementos.iniciar.addEventListener("click", iniciarJuego);
elementos.nivel.addEventListener("change", () => {
  estado.nivel = elementos.nivel.value;
  estado.racha = 0;
  estado.intentos = 0;
  estado.logrado = false;
  estado.codigoConstancia = "";
  prepararBancoNivel();
  actualizarIndicadores();
  elementos.reconocimiento.hidden = true;
  elementos.alternativas.innerHTML = "";
  elementos.imagen.hidden = true;
  elementos.categoria.textContent = "Banco de señas";
  elementos.pista.textContent = "Presione “Iniciar juego” para cargar la primera pregunta.";
  elementos.mensaje.textContent = "Nivel actualizado. Presione “Iniciar juego” para comenzar.";
  elementos.mensaje.className = "mensaje";
});
elementos.siguiente.addEventListener("click", crearPregunta);
elementos.reiniciar.addEventListener("click", reiniciarNivel);
elementos.descargarReconocimiento.addEventListener("click", descargarReconocimiento);
elementos.imprimirReconocimiento.addEventListener("click", () => window.print());

cargarBanco();
