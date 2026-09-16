# Plan: app de registro de horas de trabajo

**Versión:** 1.3 · 16 sep 2026 (pagos con pasarela peruana: tarjetas + Yape/Plin)
**Autor:** Adolfo Brito
**Herramienta de desarrollo:** Claude Code

---

## 1. Objetivo

Crear una app web instalable en el celular (PWA) para:

- Registrar horas trabajadas y horas extra.
- Cargar horarios con **foto**, **texto** o **a mano**, usando IA para leerlos.
- Ver todo en un **dashboard detallado**.
- Sincronizar turnos con **Google Calendar**.
- **Plan de pago de administración** para agregar y gestionar a más personas.

---

## 2. Decisiones

### Confirmadas ✅
1. **Modelo freemium:**
   - **Plan Personal (gratis):** una persona registra y ve **solo sus propias horas**. Incluye foto, texto, dashboard y Google Calendar.
   - **Plan Administración (pago):** permite crear un equipo y **agregar a más personas** para ver y gestionar sus horas.
2. **Cada persona tiene su propia cuenta.** Los miembros invitados entran con su login y usan la app **gratis**. Solo paga quien administra.

### Por confirmar (con la opción propuesta entre paréntesis)
3. **Cómo se cobra la administración:** (propuesto: suscripción mensual con precio base que incluye hasta 5 personas y un extra por cada persona adicional). Alternativa: precio fijo por tramos (hasta 5, hasta 15, hasta 30).
4. **Prueba gratis del plan admin:** (propuesto: 14 días, sin tarjeta).
5. **Pasarela de pago:** pasarela peruana (Culqi primera opción) con tarjetas + Yape/Plin. Ver §4.6.
6. **¿Cada persona conecta su propio Google Calendar?** (Propuesto: sí, y es opcional.)
7. **Cuándo cuenta una hora como extra:** por día (más de 8 h), por semana (más de 48 h) o ambas. (Propuesto: configurable, con 8 h diarias y 48 h semanales por defecto.)
8. **Recargos:** 25% las primeras 2 h extra y 35% las siguientes, más feriados y horario nocturno. Todo configurable, porque depende del contrato. *(Confirmar con RR. HH. o con la normativa vigente. Esto no es asesoría legal.)*
9. **Moneda y tarifa por hora:** S/ por defecto, con una tarifa propia para cada persona.

---

## 3. Stack tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend | **Next.js (App Router) + TypeScript** | Estándar actual y Claude Code lo maneja muy bien |
| Estilos y UI | **Tailwind CSS + shadcn/ui** | Diseño limpio y rápido, pensado para móvil |
| Gráficos | **Recharts** | Gráficos del dashboard |
| Base de datos y auth | **Supabase** (Postgres + Auth + Storage) | Login con Google, seguridad por fila (RLS) y plan gratuito |
| IA (foto y texto) | **API de Claude (Anthropic)** con visión | Convierte fotos y textos en turnos (JSON) |
| Calendario | **Google Calendar API** (OAuth) | Crear, editar y borrar eventos |
| Fechas | **date-fns + date-fns-tz** | Zona horaria `America/Lima` y turnos que pasan de medianoche |
| Validación | **Zod** | Valida lo que devuelve la IA antes de guardarlo |
| PWA | Manifest + service worker (Serwist) | Instalable con ícono en el celular |
| Hosting | **Vercel** | Deploy automático desde GitHub |
| Código | **GitHub** | Control de versiones |

---

## 4. Funcionalidades

### 4.1 Cuentas y equipos
- Login con Google (cada persona con su cuenta).
- **Todos empiezan en el Plan Personal gratis.**
- Botón **"Administrar un equipo"** → prueba gratis o pago → crear el equipo (ejemplo: "Hotel X – Recepción").
- Invitar por enlace o email, con rol **admin** o **miembro**. Si se llega al límite de personas del plan, se pide ampliar.
- El miembro invitado crea su cuenta gratis y acepta la invitación.
- **Privacidad del miembro:** el admin ve solo los turnos que el miembro registra **en ese equipo**, no sus datos personales ni otros equipos.
- Si alguien sale del equipo, **conserva su historial personal**.
- Si el pago del admin vence: el equipo pasa a **solo lectura** (7 días de gracia) y los miembros siguen usando su plan personal sin perder datos.

### 4.6 Pagos y suscripciones
- Página **Planes** (Personal gratis / Administración) y página **Facturación** (plan actual, personas usadas, cambiar o cancelar).
- Pagos con suscripción mensual y **webhooks** que actualizan el estado del plan en la base de datos.
- **Pasarela (decisión v1.3): pasarela peruana, Culqi como primera opción** (alternativas: Izipay, Niubiz, Mercado Pago). Stripe no acepta comercios peruanos.
  - **Tarjetas de crédito y débito:** suscripción mensual con **cobro automático** (API de suscripciones de la pasarela).
  - **Yape / Plin:** no permiten cobros automáticos, así que son **pago por periodo** (1, 3, 6 o 12 meses). La app avisa unos días antes de que venza y el admin paga de nuevo con QR o código.
  - Confirmar con la pasarela elegida que acepta **Plin** además de Yape, sus comisiones y los requisitos (normalmente RUC).
  - Emitir boleta o factura electrónica (integración con SUNAT, a futuro).
- El código de pagos va en un módulo aparte (`billing`) para poder cambiar de pasarela sin rehacer la app.
- Los límites se aplican **en el servidor** (RLS y funciones), no solo ocultando botones.

### 4.2 Registro de turnos
- **Manual:** fecha, entrada, salida, descanso (min), tipo (normal / feriado / libre) y nota.
- **Por texto:** por ejemplo, *"lun y mar 12pm a 10pm, miérc 2 a 10, viernes libre"*.
- **Por foto:** foto o captura del horario semanal.
- **Pantalla de confirmación obligatoria:** la IA propone y el usuario revisa y corrige antes de guardar.
- **Horario del equipo (admin):** sube una foto con los horarios de varias personas y la IA asigna cada fila a un miembro, con confirmación.
- Duplicar una semana y editar o borrar turnos.

### 4.3 Cálculo de horas
- Horas netas por turno (salida − entrada − descanso), incluidos los turnos que pasan de medianoche.
- Horas normales y extra según las reglas del equipo o de la persona.
- Extras divididas por tramo de recargo (25% / 35%), feriados y nocturnas.
- Pago estimado = horas × tarifa + recargos.
- La lógica va en un **módulo aparte con tests**, porque es lo más delicado.

### 4.4 Dashboard
- **Tarjetas:** horas de la semana, extras de la semana, horas del mes y pago estimado.
- **Gráfico de barras** por día (normales y extras apiladas).
- **Tendencia** de las últimas 8–12 semanas.
- **Calendario** mensual o semanal con los turnos.
- **Filtros:** semana, mes o rango de fechas.
- **Vista admin:** tabla del equipo (persona, horas, extras, pago) y detalle por persona.
- **Exportar** a Excel/CSV y PDF.

### 4.5 Google Calendar
- Conexión opcional, cada usuario con su propia cuenta.
- La app crea un calendario aparte llamado **"Turnos de trabajo"** para no mezclar con eventos personales.
- Botón **"Sincronizar semana"** que crea, actualiza o borra eventos (se guarda el `gcal_event_id` de cada turno).
- Opcional: **importar** eventos existentes como turnos.
- Recordatorio antes de cada turno, configurable.

---

## 5. Modelo de datos (Supabase / Postgres)

```
profiles          id (=auth.users), nombre, email, avatar_url, tarifa_hora, moneda, zona_horaria
teams             id, nombre, owner_id, created_at
team_members      team_id, user_id, rol ('admin'|'miembro'), created_at
invitations       id, team_id, email, rol, token, expira_en, aceptada_en
overtime_rules    id, team_id NULL, user_id NULL, horas_dia, horas_semana, modo ('dia'|'semana'|'ambos'),
                  tramo1_horas, tramo1_pct, tramo2_pct, feriado_pct, nocturno_pct, nocturno_inicio, nocturno_fin,
                  inicio_semana ('lunes')
shifts            id, user_id, team_id NULL, fecha, hora_inicio, hora_fin, descanso_min,
                  tipo ('normal'|'feriado'|'libre'), origen ('manual'|'texto'|'foto'|'calendar'),
                  nota, gcal_event_id NULL, created_by, created_at, updated_at
schedule_imports  id, user_id, team_id NULL, imagen_path NULL, texto NULL, resultado_json, estado, created_at
google_connections user_id, refresh_token (cifrado), calendar_id, conectado_en
holidays          fecha, nombre, pais ('PE')
subscriptions     id, owner_id, team_id, plan ('admin'), estado ('trial'|'activa'|'vencida'|'cancelada'),
                  personas_incluidas, personas_extra, proveedor, proveedor_sub_id, periodo_fin, trial_fin
billing_events    id, proveedor, tipo, payload_json, procesado_en   (registro de webhooks)
```

**Reglas de plan:**
- Crear un equipo exige una `subscription` en estado `trial` o `activa`.
- Número de `team_members` ≤ `personas_incluidas + personas_extra` (se valida en la base de datos).
- Suscripción `vencida` → el equipo queda en solo lectura. Los `shifts` personales nunca se bloquean.

**Seguridad (RLS):**
- Cada miembro lee y escribe **solo sus propios** `shifts`.
- Un admin lee y escribe los `shifts` de su `team_id`.
- Las fotos van en un bucket **privado**, con opción de borrarlas después de procesarlas.
- Los tokens de Google se guardan cifrados y **solo el servidor** los usa.

---

## 6. Flujo de lectura con IA

```
Usuario sube foto / escribe texto
        ↓
API route (servidor) → Claude API con prompt + esquema JSON
        ↓
Respuesta: [{ persona?, fecha, inicio, fin, descanso_min, tipo }]
        ↓
Validación con Zod (+ resolver "lunes" → fecha real de la semana elegida)
        ↓
Pantalla "Revisa tus turnos" (editable)
        ↓
Guardar en shifts → recalcular → (opcional) sincronizar Calendar
```

- La clave de la API de Claude **solo va en el servidor**, nunca en el navegador.
- Se guarda cada importación en `schedule_imports` para revisar errores y mejorar el prompt.

---

## 7. Pantallas

1. Login
2. Onboarding: nombre, tarifa, reglas de extras y "¿trabajas solo o con un equipo?"
3. **Dashboard** (inicio)
4. **Agregar horario** (pestañas Foto / Texto / Manual) → Confirmar
5. Turnos (lista y calendario)
6. **Equipo** (plan pago): miembros, invitar, roles y vista admin
7. Reportes y exportación
8. **Planes y facturación**
9. Ajustes: perfil, reglas, Google Calendar, tema claro/oscuro

---

## 8. Fases de desarrollo con Claude Code

Recomendación: **una fase por sesión**. Empieza cada una en *plan mode*, revisa el plan, deja que Claude Code lo ejecute y prueba antes de pasar a la siguiente. Al final de cada fase, commit a GitHub.

### Fase 0 · Preparación (1 día)
- Crear cuentas: GitHub, Supabase, Vercel, Google Cloud Console y Anthropic Console (API key).
- Instalar Node.js LTS y Claude Code.
- Crear el repo y copiar este plan como `PLAN.md`.
- Pedirle a Claude Code: *"Lee PLAN.md, crea un CLAUDE.md con las convenciones del proyecto e inicializa Next.js + TypeScript + Tailwind + shadcn/ui."*

> Las fases 1, 2, 4 y 5 construyen el **Plan Personal gratis**, que se puede lanzar solo. Las fases 3 y 3B agregan la **administración de pago**.

### Fase 1 · Base y registro manual (MVP)
- Supabase: tablas `profiles`, `shifts` y `overtime_rules`, más RLS.
- Login con Google.
- Crear, editar y borrar turnos a mano.
- **Módulo de cálculo con tests** (medianoche, descansos, extras diarias y semanales, recargos).
- Dashboard básico: tarjetas y gráfico semanal.
- ✅ *Listo cuando:* registras tu semana real y los totales cuadran con un cálculo a mano.

### Fase 2 · IA: foto y texto
- API route con la API de Claude y esquema JSON.
- Pantallas Foto / Texto y "Revisa tus turnos".
- Tabla `schedule_imports` y bucket privado.
- ✅ *Listo cuando:* 5 fotos reales de horarios se leen bien o solo necesitan correcciones menores.

### Fase 3 · Equipos y personas
- Tablas `teams`, `team_members` e `invitations`, con RLS por rol.
- Crear equipo, invitar por enlace o email, aceptar y quitar miembros.
- Vista admin: tabla del equipo y detalle por persona.
- Importar la foto del horario de todo el equipo y asignar filas a miembros.
- ✅ *Listo cuando:* con 2 cuentas de prueba, el miembro solo ve lo suyo y el admin ve todo.
- En esta fase el acceso admin se activa a mano (flag en la base de datos), sin cobrar todavía.

### Fase 3B · Pagos y límites del plan
- Crear cuenta en la pasarela (Culqi u otra peruana) y los planes (admin y persona extra).
- Dos flujos: **tarjeta = suscripción automática** · **Yape/Plin = pago por periodo + recordatorio de vencimiento**.
- Tablas `subscriptions` y `billing_events`, checkout, webhooks y página de facturación.
- Prueba gratis, límite de personas, ampliar plan, cancelar y modo solo lectura al vencer.
- ✅ *Listo cuando:* en **modo de prueba** de la pasarela se completa el ciclo pagar → invitar → vencer → solo lectura → renovar.

### Fase 4 · Google Calendar
- OAuth con Google (scope de calendario) y refresh token guardado cifrado.
- Crear el calendario "Turnos de trabajo".
- Sincronizar la semana (crear, actualizar, borrar) y, opcionalmente, importar eventos.
- ✅ *Listo cuando:* editar un turno en la app actualiza el evento en Calendar.

### Fase 5 · Dashboard completo y reportes
- Tendencias, calendario mensual, filtros y pago estimado.
- Exportar a Excel/CSV y PDF.
- Feriados de Perú.

### Fase 6 · PWA, pulido y lanzamiento
- Manifest, ícono, pantalla de inicio e instalación en el celular.
- Modo oscuro, estados vacíos, errores y cargas.
- Deploy en Vercel con dominio opcional.
- Pruebas en celular real (Android/iPhone).
- Pasar Supabase a **Pro** antes de tener usuarios reales, porque el plan gratis se pausa tras unos 7 días sin actividad.

### Fase 7 · Publicación en Google Play y App Store
> Solo después de validar la PWA con usuarios reales.

**7.1 Empaquetado**
- Integrar **Capacitor** en el proyecto: una sola base de código para la web, Android y iOS.
- Funciones nativas, para que Apple no la considere "solo una web": **notificaciones push** (recordatorio antes del turno), **cámara nativa** para la foto del horario y, opcionalmente, un widget con el próximo turno.
- Login: agregar **"Entrar con Apple"** en iOS junto a "Entrar con Google".
- Íconos, splash screen y deep links para las invitaciones de equipo.

**7.2 Google Play (primero)**
- Cuenta de desarrollador: **US$25, pago único**.
- Con cuenta personal: **prueba cerrada con al menos 12 personas durante 14 días seguidos** antes de publicar (usar a los primeros usuarios de la PWA).
- Ficha de la tienda, formulario de seguridad de datos y clasificación de contenido.

**7.3 App Store (después)**
- Apple Developer Program: **US$99 al año**.
- Compilar con **Mac + Xcode**, o con un servicio en la nube (Codemagic, por ejemplo).
- TestFlight para las pruebas, luego ficha de la tienda, "etiquetas de privacidad" y revisión.

**7.4 Requisitos comunes**
- Política de privacidad pública y **borrar cuenta desde la app**.
- Declaración de datos recogidos (horas, fotos, Google Calendar).

**7.5 Cobros dentro de las apps**
- Si el plan de administración se compra **dentro** de la app, se usa el sistema de Apple/Google, con una comisión del **15%** (programa para pequeños desarrolladores, menos de US$1M al año) o del 30%.
- Opción recomendada al inicio: **cobrar solo en la web**. En la app el admin inicia sesión con su plan ya activo, sin botones ni enlaces a pagos externos (las reglas cambian según el país; revisarlas al publicar).
- Si más adelante se ofrece la compra dentro de la app: usar **RevenueCat** para unificar web, Google y Apple en la tabla `subscriptions`.

- ✅ *Listo cuando:* la app está publicada en ambas tiendas, las notificaciones funcionan y una suscripción activa en la web se reconoce en la app.

---

## 9. Costos y puntos de atención

| Tema | Detalle |
|---|---|
| Supabase | Gratis para desarrollar (máx. 2 proyectos activos; se pausa tras unos 7 días sin actividad y se reactiva sin perder datos). **Pro (desde US$25/mes) al lanzar**: no se pausa y tiene backups |
| Vercel | Hobby gratis es para uso no comercial: **al cobrar, pasar a Vercel Pro** |
| Tiendas de apps (Fase 7) | Google Play US$25 una vez · Apple US$99/año · comisión 15–30% si se cobra dentro de la app |
| Pasarela de pago | Comisión por transacción. Confirmar disponibilidad para Perú y cómo recibes el dinero |
| Formalización | Al vender suscripciones conviene tener RUC y emitir comprobantes. Consultar con un contador |
| API de Claude | Pago por uso; leer un horario cuesta centavos. Poner límite mensual en la consola |
| **Verificación de Google** | En modo "prueba" solo funcionan los usuarios de prueba que agregues (máx. 100). Para abrirla al público, Google exige verificar la app porque el calendario es un permiso sensible (política de privacidad, dominio, revisión) |
| Datos personales | Guardas horas y pagos de otras personas: política de privacidad clara y opción de borrar cuenta (Ley 29733 de Protección de Datos Personales en Perú) |
| Precisión de la IA | Siempre con pantalla de confirmación; nunca guardar sin revisión |

---

## 10. Cómo trabajar con Claude Code (guía rápida)

1. Abre la terminal en la carpeta del proyecto y ejecuta `claude`.
2. Primero: *"Lee PLAN.md y CLAUDE.md. Vamos con la Fase X. Hazme un plan antes de escribir código."*
3. Revisa el plan, pide cambios y luego aprueba.
4. Prueba en `npm run dev` y reporta errores copiando el mensaje exacto.
5. Cuando funcione: *"Haz commit de esta fase."*
6. Guarda las claves en `.env.local`, **nunca** en el código ni en GitHub.
7. Desde la Fase 1, toda la lógica sensible (IA, Calendar, pagos) va en **rutas del servidor**, para que la app funcione igual en la web y dentro de Capacitor (Fase 7).

---

## 11. Próximo paso

Las decisiones 3 a 9 de la §2 no bloquean el inicio, porque tienen valores por defecto configurables. Se puede arrancar la **Fase 0** ya.
