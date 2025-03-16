# Diseño de la Base de Datos para la App de Hábitos

Este documento describe el diseño de la base de datos basada en IndexedDB para la aplicación de hábitos, considerando distintos patrones de recurrencia y funcionalidades futuras como vistas de calendario, reportes, y notificaciones.

---

## Tabla: Hábitos

Contiene la información principal de cada hábito definido por el usuario.

- **id:** Identificador único del hábito.
- **nombre:** Título del hábito (ej.: "Leer", "Correr", "Sacar la basura").
- **descripcion:** Detalle del hábito y sus metas específicas.
- **tipo:** Indica si es un hábito "bueno" o "malo".
- **categoriaId:** Referencia a la categoría asociada (si aplica).
- **frecuencia:** Tipo de recurrencia general (ej.: "diario", "semanal", "mensual", "ocasional").
- **diasSemana:** (Opcional) Lista de días de la semana en los que se debe ejecutar el hábito (ej.: `["lunes", "martes", "miércoles", "jueves", "viernes"]` para correr de lunes a viernes, o `["martes", "jueves"]` para sacar la basura).
- **objetivo:** Valor numérico que define la meta en cada ejecución (ej.: 30 para 30 minutos o 1 para “1 vez”).
- **unidadObjetivo:** Unidad de la meta (ej.: "minutos", "veces").
- **horarioInicio:** (Opcional) Hora de inicio sugerida para realizar el hábito.
- **horarioFin:** (Opcional) Hora límite o final del período para la realización del hábito.
- **fechaCreacion:** Fecha de creación del hábito (formato Date o ISO string).
- **fechaActualizacion:** Fecha de la última modificación.
- **activo:** Indicador booleano para saber si el hábito está en seguimiento.

---

## Tabla: Registros (Logs)

Registra la ejecución o intento de ejecución de un hábito en fechas específicas.

- **id:** Identificador único del registro.
- **habitId:** Referencia al hábito asociado.
- **fecha:** Fecha en la que se registra la ejecución (formato Date o ISO string).
- **estado:** Estado del registro (ej.: "completado", "parcial", "no completado").
- **cantidadRealizada:** (Opcional) Cantidad alcanzada en la sesión (ej.: 30 si se leyeron 30 minutos).
- **comentario:** (Opcional) Nota adicional sobre la ejecución del hábito ese día.

---

## Tabla: Categorías

Organiza los hábitos en categorías, permitiendo agrupar y analizar por áreas (ej.: "Salud", "Productividad").

- **id:** Identificador único de la categoría.
- **nombre:** Nombre de la categoría.
- **descripcion:** Detalle de la categoría.
- **satisfaccion:** Campo numérico (por ejemplo, escala del 1 al 10) que indique el nivel de satisfacción o relevancia asignado por el usuario.

---

## Tabla: Estadísticas / Rachas (Opcional)

Almacena estadísticas derivadas de los registros para facilitar reportes y análisis.

- **habitId:** Referencia al hábito.
- **rachaActual:** Número de días consecutivos en que se cumplió el hábito.
- **rachaMaxima:** Máxima racha histórica alcanzada.
- **porcentajeCumplimiento:** Porcentaje de cumplimiento en un período definido.

---

## Tabla: Recordatorios (Opcional)

Permite configurar notificaciones o recordatorios para los hábitos.

- **id:** Identificador único del recordatorio.
- **habitId:** Referencia al hábito asociado.
- **horaRecordatorio:** Hora para enviar el recordatorio (formato Date o string).
- **activo:** Estado del recordatorio (booleano).
- **mensaje:** Mensaje personalizado para el recordatorio.

---

## Consideraciones Adicionales

- **Flexibilidad en la Recurrencia:**  
  Los campos `frecuencia` y `diasSemana` permiten modelar hábitos diarios, semanales o personalizados según las necesidades del usuario.

- **Objetivos Específicos:**  
  Con `objetivo` y `unidadObjetivo` se pueden definir metas cuantificables (ej.: leer 30 minutos diarios o correr cierta cantidad de kilómetros).

- **Horarios Definidos:**  
  `horarioInicio` y `horarioFin` facilitan la gestión de ventanas temporales para la ejecución de hábitos.

- **Escalabilidad:**  
  La estructura está pensada para futuras expansiones, como la visualización en calendario, notificaciones push, reportes avanzados y análisis de tendencias.

---

Este diseño proporciona una base robusta y flexible para gestionar tanto buenos como malos hábitos, adaptándose a distintos escenarios de uso y necesidades futuras.
