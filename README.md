# Parla (beta)

Microapp gratuita para aprender idiomas jugando: inglés, francés, italiano y alemán para hispanohablantes. Sin anuncios y sin pagos mientras dure la beta.

## Qué incluye

- **Ruta de niveles:** 5 unidades por idioma con 3 paradas cada una (Palabras → Frases → Desafío). Al completar el desafío de una unidad ganas un sello de esa ciudad en tu pasaporte. La quinta unidad es un bonus con expresiones coloquiales.
- **Ejercicios:** elegir la traducción, «¿cómo se dice?», escuchar y elegir, escribir lo que oyes, ordenar fichas para formar frases, unir parejas y pronunciar en voz alta (en Chrome y Edge).
- **Audio:** cada palabra y frase se puede escuchar a velocidad normal o a 0,5×.
- **Progreso:** XP, niveles, racha diaria y sellos para comprar protectores de racha.
- **Cuentas:** crear cuenta, iniciar sesión, cerrar sesión y modo invitado.
- **Medición de uso:** con GoatCounter, anónima, sin cookies y solo si la persona lo acepta (ver abajo).
- **Legal:** aviso legal, privacidad, cookies, términos de uso y accesibilidad (`*.html` en la raíz), aceptación de términos al registrarse y botones para descargar o eliminar los datos desde el perfil.
- **Dirección pública:** https://plata8jp-blip.github.io/parla/

## Probarla en tu ordenador

Abre una terminal en esta carpeta y ejecuta:

```bash
ruby -run -e httpd . -p 8000
```

Después abre http://localhost:8000.

## Medir cuánta gente la usa

El código `parla` ya está configurado en `js/analytics.js`. Al entrar, cada persona ve un aviso con «Aceptar» y «Rechazar»: solo se cuenta a quien acepta, y puede cambiarlo en «Preferencias de privacidad», al pie de la página. En el panel (`https://parla.goatcounter.com`) verás:
   - Visitantes únicos por día, semana y mes, y desde qué país y dispositivo entran.
   - Eventos: `registro`, `invitado`, `inicio-sesion`, `idioma/xx`, `leccion-completada/…`, `leccion-abandonada/…`, `unidad-completada/…` y `racha/N-dias`.

No se envían nombres, correos ni respuestas.

## Si cambias algo, revisa los textos legales

Si añades publicidad, pagos, cuentas en un servidor o cualquier servicio externo nuevo (fuentes, vídeos, formularios), actualiza `privacidad.html`, `cookies.html` y `terminos.html` antes de publicarlo. GitHub Pages no permite alojar webs que sean principalmente un negocio online: si Parla pasa a tener pagos, habrá que cambiar de alojamiento.

## Limitación de la beta

Las cuentas se guardan en el navegador de cada persona: si alguien cambia de móvil u ordenador, empieza de cero. Si la beta funciona, el siguiente paso es un backend real (Supabase o Firebase) sustituyendo el objeto `Backend` de `js/store.js`.

## Monetización futura

AdSense, Parla Plus y los pagos están guardados en la carpeta `../monetizacion-futura/`, junto con la estrategia de negocio, listos para recuperarlos cuando quieras.
