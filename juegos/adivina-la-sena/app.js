(async function(){
  const estado = document.getElementById("estado-carga");
  const iframe = document.getElementById("juego");
  const fuenteOriginal = "https://raw.githubusercontent.com/gabriel-lsp/juegos-interactivos-accesibles/03ec7056d98805e84ff063d5b5df240c2b16ba6b/juegos/adivina-la-sena.html";
  const contacto = "https://gabriel-lsp.github.io/accesos-complementarios/contacto.html";
  const estilosCabecera = ".enlaces-cabecera{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:12px}.franja-info{display:none!important}@media(max-width:640px){.enlaces-cabecera{justify-content:flex-start}}";

  function ajustarAltura(){
    try{
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const alto = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight, window.innerHeight);
      iframe.style.height = alto + "px";
    }catch(error){
      iframe.style.height = "100vh";
    }
  }

  function prepararHtml(html){
    return html
      .replace('<a href="../index.html" class="enlace-cabecera">Volver</a>', '<div class="enlaces-cabecera"><a href="../../index.html" class="enlace-cabecera">Volver a JIA</a><a href="' + contacto + '" class="enlace-cabecera">Contacto Institucional</a></div>')
      .replace(/<div class="franja-info"><span class="chip">5 alternativas<\/span><span class="chip">Niveles progresivos<\/span><span class="chip">Reconocimiento simbólico<\/span><\/div>/, "")
      .replace("</style>", estilosCabecera + "</style>");
  }

  try{
    const respuesta = await fetch(fuenteOriginal, { cache:"no-store" });

    if(!respuesta.ok){
      throw new Error("No se pudo cargar la versión original del juego.");
    }

    const html = prepararHtml(await respuesta.text());
    iframe.removeAttribute("hidden");
    estado.style.display = "none";
    iframe.srcdoc = html;

    iframe.addEventListener("load", function(){
      ajustarAltura();
      setTimeout(ajustarAltura, 500);
      setTimeout(ajustarAltura, 1500);
    });

    window.addEventListener("resize", ajustarAltura);
  }catch(error){
    console.error(error);
    estado.innerHTML = 'No se pudo cargar el juego. <a class="enlace-carga" href="../../index.html">Volver a JIA</a>';
  }
})();