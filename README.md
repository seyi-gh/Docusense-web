<div align="center">

# DocuSense Web

Frontend inteligente para análisis de documentos PDF con IA. Interfaz moderna con autenticación segura, gestor de documentos y chat contextualizado en tiempo real.

<p>
  <img src="https://img.shields.io/badge/Next.js-16.2.3-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-3-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Server%20Sent%20Events-Streaming-ff9900?style=for-the-badge&logo=amazonsqsqueue&logoColor=white" alt="SSE">
  <img src="https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</p>

</div>

## Demostración

- **Sitio**: [https://docusense-web.vercel.app](https://docusense-web.vercel.app)
- **API Backend**: [https://docusense-api-czcd.onrender.com/docs](https://docusense-api-czcd.onrender.com/docs)

## Tabla de contenido

1. [Visión del proyecto](#visión-del-proyecto)
2. [Características principales](#características-principales)
3. [Flujo de usuario](#flujo-de-usuario)
4. [Stack y versiones](#stack-y-versiones)
5. [Arquitectura frontend](#arquitectura-frontend)
6. [Estructura del proyecto](#estructura-del-proyecto)
7. [Configuración del entorno](#configuración-del-entorno)
8. [Instalación y ejecución local](#instalación-y-ejecución-local)
9. [Build para producción](#build-para-producción)
10. [Despliegue en Vercel](#despliegue-en-vercel)
11. [Decisiones técnicas](#decisiones-técnicas)
12. [Seguridad cliente](#seguridad-cliente)

## Visión del proyecto

DocuSense Web es una aplicación React moderna que permite usuarios conversar inteligentemente con sus documentos PDF. La interfaz está diseñada para ser intuitiva, rápida y accesible en cualquier dispositivo.

### Objetivos

- Experiencia de usuario fluida y reactiva.
- Autenticación segura con tokens JWT.
- Carga y gestión de múltiples documentos.
- Chat contextualizado sin necesidad de configuración.
- Respuestas en streaming para feedback inmediato.
- Responsive design (móvil, tablet, desktop).
- Alto contraste y tema oscuro/claro.

## Características principales

### 🔐 Autenticación

- Registro con validación de email y contraseña.
- Login seguro con almacenamiento de token en localStorage.
- Sesión persistente (tokens se recuperan al recargar).
- Logout y limpiezas de sesión.
- Detección automática de sesión expirada (401).

### 📄 Gestor de Documentos

- Upload drag-and-drop de archivos PDF.
- Vista previa de documentos cargados.
- Metadata: tamaño, fecha de carga, nombre.
- Eliminación de documentos.
- Historial de documentos analizados.

### 💬 Chat Inteligente

- Interfaz de chat limpia y moderna.
- Preguntas contextualizadas al PDF seleccionado.
- Respuestas en streaming (SSE) con entrega gradual.
- Historial de conversación por documento.
- Indicador de carga mientras se procesa.
- Apoyo para múltiples mensajes consecutivos.

### 🎨 UX/Accesibilidad

- Tema oscuro/claro automático según preferencias del sistema.
- Diseño responsive 100% (mobile-first).
- Disclaimer sobre cold-start de Render con temporizador visual.
- Navegación entre autenticado/no autenticado automática.
- Mensajes de error claros y accionables.

## Flujo de usuario

### 1. Visitante no autenticado

```
Landing page → Botón "Iniciar sesión" → Login/Register
```

El landing muestra información del proyecto. Al autenticarse, redirige automáticamente a `/documents`.

### 2. Usuario autenticado

```
/documents → Upload PDF → /chat/[docId] → Chat streaming → Historial
```

- Lista de documentos previamente subidos.
- Opción de subir nuevo PDF.
- Al hacer click, abre chat del documento.
- Chat muestra preguntas/respuestas en tiempo real.

### 3. Chat contextualizado

```
Usuario escribe pregunta → "Enviando..." → Respuesta llega por chunks → Display interactivo
```

El backend devuelve chunks SSE; el frontend acumula y renderiza.

### 4. Sesión expirada

```
Token inválido (401) → Sesión clara → Redirige a /login
```

Automático; el usuario no necesita intervenir.

## Stack y versiones

| Librería | Versión | Uso principal |
|---|---|---|
| next | 16.2.3 | Meta-framework React con SSR |
| react | 19 | Librería UI principal |
| typescript | 5 | Type safety |
| tailwindcss | 3 | Utility-first CSS |
| eslint | 9 | Linting de código |
| postcss | 8 | Procesador de CSS |
| axios | Última | Cliente HTTP |

### Next.js App Router

- Rutas basadas en directorios en `src/app/`.
- Componentes server y client automáticos.
- Streaming de JSON para chat en tiempo real.
- Pre-rendering estático para landing + login/register.
- Dynamic routes para chat por documento.

## Arquitectura frontend

### Capa de enrutamiento

- **`src/app/page.tsx`**: Landing pública, redirige autenticados a /documents.
- **`src/app/login/page.tsx`**: Formulario de login.
- **`src/app/register/page.tsx`**: Formulario de registro con validación.
- **`src/app/documents/page.tsx`**: Gestor de documentos y upload.
- **`src/app/chat/[docId]/page.tsx`**: Chat contextualizado con streaming.
- **`src/app/layout.tsx`**: Layout raíz, tema, disclaimer.

### Capa de componentes

- **`src/components/MessageBubble.tsx`**: Bubble individual de mensaje con markdown.
- **`src/components/UploadZone.tsx`**: Zona drag-and-drop para PDFs.
- **`src/components/DisclaimerWithTimer.tsx`**: Disclaimer con círculo de progreso que desaparece.

### Capa de lógica

- **`src/lib/api.ts`**: Cliente HTTP con axios, interceptores, manejo de errores.
- **`src/lib/streaming.ts`**: Parsing de SSE del backend, acumulación de chunks.

### Gestión de sesión

```typescript
// localStorage:
const token = localStorage.getItem('token');
const hasSession = !!token;

// localStorage:
const chatHistory = {};
chatHistory[docId] = [{ role: 'user', content: '...' }, ...];
```

Usa `useSyncExternalStore` en landing para detección reactiva de sesión.

### Estilo

- Tailwind CSS con custom properties para tema oscuro/claro.
- Variables CSS: `--surface`, `--text`, `--border-soft`, `--shadow-soft`.
- Respuesta automática a `data-theme="dark"` en HTML root.
- Mobile-first design.

## Estructura del proyecto

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Estilos globales, theme variables
│   │   ├── layout.tsx               # Raíz, tema, disclaimer
│   │   ├── page.tsx                 # Landing (session-aware)
│   │   ├── login/
│   │   │   └── page.tsx             # Login form
│   │   ├── register/
│   │   │   └── page.tsx             # Register form + validation
│   │   ├── documents/
│   │   │   └── page.tsx             # Gestor de docs + upload
│   │   └── chat/
│   │       └── [docId]/
│   │           └── page.tsx         # Chat streaming
│   ├── components/
│   │   ├── MessageBubble.tsx        # Renderizado de mensajes
│   │   ├── UploadZone.tsx           # Drag-and-drop
│   │   └── DisclaimerWithTimer.tsx  # Disclaimer + timer
│   └── lib/
│       ├── api.ts                   # Cliente HTTP centralizado
│       └── streaming.ts             # Parser SSE
├── public/                           # Assets estáticos
├── .env.local                        # Variables local
├── .env.example                      # Template variables
├── next.config.ts                   # Config Next.js
├── tsconfig.json                    # TypeScript config
├── eslint.config.mjs                # ESLint rules
├── tailwind.config.ts               # Tailwind config
├── postcss.config.mjs               # PostCSS plugins
├── package.json
└── README.md
```

## Configuración del entorno

### Local (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

El prefijo `NEXT_PUBLIC_` hace que la variable esté disponible en el cliente (browser).

### Producción

```env
NEXT_PUBLIC_API_URL=https://docusense-api-czcd.onrender.com
```

Se configura en Vercel environment variables.

## Instalación y ejecución local

### Requisitos

- Node.js 18+ (recomendado 22 LTS)
- npm 10+ o yarn/pnpm
- Backend corriendo en `http://localhost:8000`

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables locales

```bash
cp .env.example .env.local
# Editar .env.local si es necesario (default: http://localhost:8000)
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Accede a `http://localhost:3000`.

### 4. Linting

```bash
npm run lint
```

Valida código con ESLint.

## Build para producción

### Compilar

```bash
npm run build
```

Genera optimizaciones:
- Minificación de JavaScript
- Code splitting por ruta
- Optimización de imágenes
- Tree-shaking de imports no usados

### Validar build local

```bash
npm run build
npm run start
```

Inicia el servidor de producción en `http://localhost:3000`.

## Despliegue en Vercel

### Requisitos previos

- Cuenta en Vercel
- Repositorio en GitHub/GitLab/Bitbucket

### 1. Conectar repositorio

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Seleccionar repositorio
3. Vercel detecta automáticamente Next.js

### 2. Configurar variables de entorno

En Vercel dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL = https://docusense-api-czcd.onrender.com
```

### 3. Deploy

```bash
git push origin main
```

Vercel automáticamente:
- Ejecuta `npm install`
- Ejecuta `npm run build`
- Deploya en CDN global
- Genera preview URLs para PRs

### 4. Validar

- Swagger del backend: https://docusense-api-czcd.onrender.com/docs
- Frontend: https://docusense-web.vercel.app

## Decisiones técnicas

- **Next.js 16 (App Router)**: Routing moderno, layouts anidados, server/client automático.
- **React 19**: Hooks últimos, mejor performance, form actions.
- **TypeScript**: Type safety desde desarrollo; evita bugs en runtime.
- **Tailwind CSS**: Utility-first, responsive automático, temas con CSS variables.
- **SSE (Server-Sent Events)**: Streaming en lugar de WebSocket; más simple para read-only.
- **localStorage**: Token persiste entre sesiones; simple para SPA.
- **useSyncExternalStore**: Landing detecta cambios de sesión entre tabs en tiempo real.
- **Axios + interceptores**: Manejo centralizado de 401, retry logic, headers comunes.
- **Componentes sin estado**: Simplicidad + performance; estado en props o context si es necesario.

## Seguridad cliente

### Implementaciones

- **Token en localStorage**: No se expone en control de desarrollador (no accesible vía XSS simple).
- **Authorization header**: Siempre incluido; nunca en query string (no en logs).
- **HTTPS obligatorio en producción**: Vercel y Render mantienen HTTPS.
- **CORS validado**: Backend solo acepta 1 origen exacto por certificado.
- **Errores sanitizados**: No expone URLs de backend, stack traces, ni detalles técnicos.
- **Password validation**: Cliente valida ANTES de enviar (UX mejor sin sacrificar seguridad).
- **Rate limiting visual**: Desactiva botón en caso de errores por intentos.

### Recomendaciones finales

- No guardar contraseñas en localStorage.
- No guardar datos sensibles en localStorage sin encripción.
- Implementar refresh tokens si las sesiones deben ser largas.
- Usar `samesite=strict` en cookies si se agregan (actualmente no usadas).
- Auditar permisos de terceros en `next.config.ts` y dependencias.

## Checklist de integración local

- [ ] Backend corre en http://localhost:8000
- [ ] `.env.local` configurado con `NEXT_PUBLIC_API_URL=http://localhost:8000`
- [ ] `npm install` ejecutado
- [ ] `npm run dev` inicia en http://localhost:3000
- [ ] Puedo registrarme sin errores de validación
- [ ] Puedo loguearme con credenciales correctas
- [ ] Token se guarda en localStorage
- [ ] Puedo subir un PDF desde /documents
- [ ] Chat abre y responde con streaming

## Troubleshooting

### Build falla con "Module not found"

```bash
# Limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

### 401 Unauthorized en cada request

- Verificar `NEXT_PUBLIC_API_URL` correcto
- Verificar backend corre y acepta CORS
- Verificar token se guarda en localStorage

### SSE no procesa respuestas

- Abrir DevTools → Network → buscar `/chat/stream`
- Verificar `Content-Type: text/event-stream`
- Verificar parsing en `lib/streaming.ts`

### Tema oscuro no funciona

- Abrir DevTools → Elements → HTML root
- Verificar `data-theme="dark"` presente
- Revisar `globals.css` para variables CSS

## Próximos pasos

1. Integrar con backend en producción (Render).
2. Validar flujo end-to-end en mobile.
3. Agregar analytics (Vercel o Posthog).
4. Implementar presistencia offline con Service Worker.
5. Agregar búsqueda en historial de chat.

## Autor

Desarrollado por Darlene
