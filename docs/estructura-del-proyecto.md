# Estructura del proyecto

Este documento propone una organización básica para el repositorio Juegos Interactivos Accesibles.

La estructura puede modificarse según el crecimiento del proyecto, pero se recomienda mantener una separación clara entre archivos principales, datos, imágenes, estilos, programación y documentación.

Estructura sugerida:

```text
juegos-interactivos-accesibles/
│
├── index.html
├── estilos.css
├── app.js
├── README.md
├── LICENSE
│
├── datos/
│   └── juegos.json
│
├── imagenes/
│   └── recursos-visuales/
│
├── audios/
│   └── efectos-o-instrucciones/
│
├── materiales/
│   └── fichas-descargables/
│
└── docs/
    ├── alcance-pedagogico.md
    ├── fuentes-y-creditos.md
    ├── uso-permitido.md
    ├── respaldo-institucional.md
    ├── estructura-del-proyecto.md
    └── bitacora-de-cambios.md
```

Descripción de carpetas y archivos:

`index.html` contiene la estructura principal de la página o plataforma.

`estilos.css` define la apariencia visual, la organización de tarjetas, colores, tamaños, espaciados y diseño responsivo.

`app.js` contiene la lógica de interacción, búsqueda, filtros, carga de datos, validaciones y funcionamiento de los juegos.

`datos/` almacena archivos en formato JSON u otros formatos livianos para organizar preguntas, categorías, niveles, instrucciones o contenidos de cada juego.

`imagenes/` contiene recursos visuales propios, autorizados o de licencia compatible. Debe evitarse mezclar imágenes sin fuente clara.

`audios/` puede almacenar instrucciones grabadas, efectos sonoros o apoyos auditivos, siempre que tengan autorización de uso.

`materiales/` puede contener fichas imprimibles, guías breves o recursos descargables para docentes y familias.

`docs/` reúne documentos de respaldo, créditos, uso permitido, alcance pedagógico, estructura y bitácora de cambios.

Para mantener el repositorio ordenado, se recomienda usar nombres de archivo en minúsculas, sin tildes, sin espacios y con guiones medios. Por ejemplo: `memoria-visual.html`, `juego-colores.js`, `tarjetas-numeros.json`.

También se recomienda que cada juego tenga una descripción mínima de objetivo, público sugerido, instrucciones, apoyos requeridos y criterios de accesibilidad.