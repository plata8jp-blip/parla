# Parla (beta)

Microapp gratuita para aprender idiomas jugando: inglés, francés, italiano y alemán para hispanohablantes. Sin anuncios y sin pagos mientras dure la beta.

## Qué incluye

- **Ruta de niveles:** 5 unidades por idioma con 3 paradas cada una (Palabras → Frases → Desafío). Al completar el desafío de una unidad ganas un sello de esa ciudad en tu pasaporte. La quinta unidad es un bonus con expresiones coloquiales.
- **Ejercicios:** elegir la traducción, «¿cómo se dice?», escuchar y elegir, escribir lo que oyes, ordenar fichas para formar frases, unir parejas y pronunciar en voz alta (en Chrome y Edge).
- **Audio:** cada palabra y frase se puede escuchar a velocidad normal o a 0,5×.
- **Progreso:** XP, niveles, racha diaria y sellos para comprar protectores de racha.
- **Cuentas:** crear cuenta, iniciar sesión, cerrar sesión y modo invitado.
- **Medición de uso:** con GoatCounter, anónima y sin cookies (ver abajo).
- **Dirección pública:** https://plata8jp-blip.github.io/parla/

## Probarla en tu ordenador

Abre una terminal en esta carpeta y ejecuta:

```bash
ruby -run -e httpd . -p 8000
```

Después abre http://localhost:8000.

## Medir cuánta gente la usa

1. Crea una cuenta gratuita en https://www.goatcounter.com y elige un código (por ejemplo, `parla`).
2. Escribe ese código en `js/analytics.js`, en `goatcounter: ""`.
3. Publica la app. En tu panel (`https://TU-CODIGO.goatcounter.com`) verás:
   - Visitantes únicos por día, semana y mes, y desde qué país y dispositivo entran.
   - Eventos: `registro`, `invitado`, `inicio-sesion`, `idioma/xx`, `leccion-completada/…`, `leccion-abandonada/…`, `unidad-completada/…` y `racha/N-dias`.

No se envían nombres, correos ni respuestas. GoatCounter no usa cookies, así que no hace falta banner de cookies.

## Limitación de la beta

Las cuentas se guardan en el navegador de cada persona: si alguien cambia de móvil u ordenador, empieza de cero. Si la beta funciona, el siguiente paso es un backend real (Supabase o Firebase) sustituyendo el objeto `Backend` de `js/store.js`.

## Monetización futura

AdSense, Parla Plus y los pagos están guardados en la carpeta `../monetizacion-futura/`, junto con la estrategia de negocio, listos para recuperarlos cuando quieras.
