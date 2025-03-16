:root {
    /* Paleta de colores */
    --color-fondo: #F7F7F7;
    --color-primario: #30F0EC;
    --color-secundario: #3079F0;
    --color-texto: #424242;
    --color-acento: #30F0AB;

    /* Sombras y degradados */
    --sombra-suave: 0px 2px 4px rgba(0, 0, 0, 0.1);
    --degradado-header: linear-gradient(90deg, #30F0EC, #30B6F0);
}
Resumen de Estilos para la App de Hábitos
Paleta de Colores y Variables Globales
Fondo General: Un tono neutro claro (blanco o gris muy suave) para aportar amplitud y limpieza.
Color Primario: Un azul profundo (ej. #3F51B5) que se usa para fondos de componentes principales (como el sidebar y botones) y para dar sensación de confianza.
Color Secundario: Un verde menta/teal (ej. #26A69A) para elementos interactivos, hover y acentos.
Color de Texto: Gris oscuro (ej. #424242) para asegurar buena legibilidad.
Acentos Adicionales: Se pueden utilizar toques en rojo, amarillo y verde en indicadores (por ejemplo, para el nivel de satisfacción).
Tipografía y Espaciado
Fuente: Sans-serif moderna (como Roboto, Montserrat o Lato), para mantener la interfaz limpia y profesional.
Jerarquía: Títulos moderados (ni muy grandes ni exagerados) para evitar saturar la interfaz; subtítulos y textos con suficiente interlineado y márgenes para asegurar legibilidad.
Espaciado: Uso generoso de padding y márgenes para "respirar" los elementos, tanto en componentes individuales (cards, modales) como en layouts generales.
Componentes y Layouts
Sidebar
Diseño: Un panel lateral fijo (con opción de colapsarse) que se desliza desde la izquierda.
Estructura: Incluye un header con título y mensaje, seguido de una lista de navegación con íconos (usando Font Awesome) y separadores para distinguir secciones.
Estilo Visual: Fondo en color primario, botones de acción con animaciones sutiles (hover, escalado) y sombras suaves para darle profundidad.
Header
Diseño: Barra superior compacta, con un degradado sutil de azul, ícono de menú (también con Font Awesome) y título en tamaño moderado.
Comportamiento: Interfaz limpia sin títulos excesivamente grandes; el menú se activa con un botón interactivo.
Formularios (ej. CategoryForm)
Estilo de Tarjeta: Diseño tipo "card" con fondo blanco, bordes redondeados y sombras suaves.
Inputs: Campos con padding generoso, bordes suaves que se resaltan en foco (cambiando al color primario) y transiciones que ofrecen feedback visual.
Botón de Acción: Botón de envío estilizado con fondo primario, que al pasar el cursor cambia a un tono secundario para indicar interactividad.
Listados (ej. CategoryList)
Diseño de Grid: Se usa un layout en grid para mostrar varias tarjetas (cards) de forma responsiva; en pantallas grandes se muestran varias columnas y en móviles una columna.
Contenido de las Cards: Cada card muestra la información de la categoría (nombre, descripción) y un indicador de satisfacción.
Indicador de Satisfacción: Color dinámico según valor:
Bajo (1-3): Rojo,
Medio (4-7): Amarillo,
Alto (8-10): Verde.
Acciones en la Card: Botones para editar y borrar, con íconos y animaciones de hover para mejorar la interactividad.
Modales (para Edición/Borrado)
Estilo: Ventanas emergentes centradas con fondo semitransparente de overlay; se usan fondos blancos, bordes redondeados y sombras para resaltar.
Estructura: Títulos claros, formularios organizados con etiquetas y inputs alineados; botones de acción diferenciados (uno para confirmar y otro para cancelar).
Comportamiento y Experiencia de Usuario
Interactividad: Efectos de hover y transiciones suaves en botones e inputs para proporcionar retroalimentación inmediata sin ser intrusivos.
Responsividad: Los layouts se adaptan a diferentes tamaños de pantalla, usando grids y media queries para mantener la usabilidad tanto en móviles como en escritorio.
Consistencia: Todos los componentes siguen una línea estética unificada, utilizando la paleta de colores y los estilos definidos en variables globales para garantizar coherencia en la experiencia del usuario.