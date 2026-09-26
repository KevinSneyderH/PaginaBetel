# Pagina Betel

Sitio web construido con React, TypeScript, Vite y Tailwind CSS.

## Desarrollo local

Requiere [Bun](https://bun.sh/). Desde la carpeta del proyecto:

```powershell
bun install
bun run dev
```

Vite mostrara la direccion local en la terminal, normalmente `http://localhost:5173`.

## GitHub Pages

El sitio se publica automaticamente al enviar cambios a la rama `main`. El workflow se encuentra en `.github/workflows/deploy.yml` y construye el sitio con la ruta correcta para un repositorio de GitHub Pages.

Despues del primer `push`, abre el repositorio en GitHub y ve a **Settings > Pages**. En **Build and deployment**, selecciona **GitHub Actions** como fuente. La direccion publicada aparecera en la pestana **Actions**, al terminar el workflow.

Tambien puedes iniciarlo manualmente desde **Actions > Deploy to GitHub Pages > Run workflow**.

Para comprobar la compilacion antes de publicar:

```powershell
bun run build
```
