# 💕 Love Wrapped — Relationship Dashboard

Una Single Page Application ultra estética que transforma el historial de WhatsApp en un tablero interactivo y emotivo.

## 🚀 Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📦 Build para producción

```bash
npm run build
```

La carpeta `dist/` contiene la app lista para desplegar.

## ☁️ Desplegar en Netlify

### Opción 1 — Drag & Drop (más simple)
1. Ejecuta `npm run build`
2. Ve a [app.netlify.com](https://app.netlify.com)
3. Arrastra la carpeta `dist/` al panel de Netlify
4. ¡Listo! Tu sitio estará en línea al instante

### Opción 2 — GitHub + CI/CD automático
1. Sube el repositorio a GitHub
2. En Netlify → "New site from Git" → selecciona el repo
3. Configura:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy! Cada push a `main` actualizará el sitio automáticamente

## 📁 Estructura del proyecto

```
src/
├── utils/
│   └── whatsappParser.js     # Parser regex + motor de analytics
├── components/
│   ├── DropZone.jsx           # Pantalla inicial de carga de archivo
│   ├── Navbar.jsx             # Barra de navegación sticky
│   ├── HeroSection.jsx        # Portada con confeti y contador de días
│   ├── CoupleStats.jsx        # Comparación de mensajes y tiempo de respuesta
│   ├── ActivityCharts.jsx     # Heatmap horario, días de semana, línea temporal
│   ├── VocabularySection.jsx  # Emojis, palabras de amor, nube de palabras
│   ├── MemoriesSection.jsx    # Récord, mes más activo, mensaje aleatorio
│   ├── LoveWrapped.jsx        # Modo Stories de pantalla completa (9 slides)
│   └── ui.jsx                 # Componentes reutilizables (StatCard, CountUp, etc.)
├── App.jsx                    # Orquestador principal
├── main.jsx                   # Entry point
└── index.css                  # Estilos globales + Tailwind
```

## 🔒 Privacidad

- **100% Client-Side** — El archivo `.txt` nunca sale de tu navegador
- Procesamiento en memoria con `FileReader API`
- Sin backend, sin analytics, sin cookies

## 🎨 Tema Blossom

Paleta cálida con tonos vino, rosa empolvado, durazno y crema. Diseñado con Glassmorphism y Neumorfismo sutil.

## ⌨️ Atajos en Love Wrapped

| Tecla | Acción |
|-------|--------|
| `→` | Siguiente slide |
| `←` | Slide anterior |
| `Espacio` | Pausar/Reanudar |
| `Esc` | Cerrar |

## 💾 Exportar chat de WhatsApp

1. Abre el chat en WhatsApp
2. Toca ⋮ (Android) o ... (iOS) → **Más opciones**
3. **Exportar chat** → **Sin archivos**
4. Guarda el `.txt` y súbelo a Love Wrapped
