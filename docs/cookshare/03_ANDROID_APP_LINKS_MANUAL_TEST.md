# CookShare Android: prueba manual

Esta guía cubre los escenarios que necesitan un teléfono Android y una instalación distribuida por Google Play o AppGallery. La aplicación no lee el clipboard por su cuenta; en Huawei esa parte queda a cargo del SDK oficial de App Linking.

## Enlaces canónicos

Usa siempre estas URLs de CookShare para compartir, QR y pruebas directas:

- [Receta pública en español](https://cookpilot.pro/es/recetas/aderezo-amarillo)
- [Receta pública en inglés](https://cookpilot.pro/en/recipes/aderezo-amarillo)
- [Categoría pública](https://cookpilot.pro/es/categorias/almuerzos)
- [Perfil público](https://cookpilot.pro/es/@christopherpazleon)
- [Día público](https://cookpilot.pro/es/@christopherpazleon/dias/lunes-6-de-julio-de-2026)
- [Relación de confianza Android](https://cookpilot.pro/.well-known/assetlinks.json)
- [Ficha de CookPilot en Google Play](https://play.google.com/store/apps/details?id=com.cookpilot.pe)
- [Ficha de CookPilot en AppGallery](https://appgallery.cloud.huawei.com/ag/n/app/C118044413)

La URL del prefijo App Linking de Huawei se obtiene en AppGallery Connect. Una vez configurado, la forma de prueba es `<prefijo-configurado>?deeplink=<URL-canónica-codificada>`; ese wrapper solo se usa para instalar o reabrir desde AppGallery. La URL que se comparte al usuario sigue siendo `https://cookpilot.pro/...`.

## Verificación de App Links

Con el paquete instalado en el dispositivo:

```powershell
adb shell pm get-app-links com.cookpilot.pe
adb shell pm verify-app-links --re-verify com.cookpilot.pe
adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://cookpilot.pro/es/recetas/aderezo-amarillo" com.cookpilot.pe
adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://cookpilot.pro/es/@christopherpazleon" com.cookpilot.pe
adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "https://cookpilot.pro/es/recetas/aderezo-amarillo?action=cook" com.cookpilot.pe
```

Resultado esperado: la aplicación recibe directamente las rutas de receta, perfil y acción `cook`; no se abre el navegador para los prefijos reclamados. Gallery, marketing, auth, sitemap, robots y `/.well-known` continúan siendo rutas web.

Comprueba también que el endpoint de [assetlinks.json](https://cookpilot.pro/.well-known/assetlinks.json) responda `200`, `application/json`, por HTTPS directo y sin redirecciones. La respuesta debe contener el paquete `com.cookpilot.pe`, la relación `delegate_permission/common.handle_all_urls` y los fingerprints de firma de producción de Google Play y Huawei.

## Cold start, warm start y continuación

1. Fuerza el cierre de la app y abre una receta con el primer comando `adb`.
2. Con la app visible, abre de nuevo la misma URL para probar `onNewIntent`.
3. Repite con una receta Pro usando `action=cook` como usuario anónimo, Free, Pro, propietario y no propietario.
4. En anónimo, completa el login y confirma que la misma receta se vuelve a resolver antes de continuar.
5. En Free, cancela el paywall y confirma que no se entra a CookMode; tras una compra de prueba autorizada en el entorno de prueba, la app debe revalidar el entitlement antes de reanudar.
6. Mata el proceso desde Ajustes o con `adb shell am force-stop com.cookpilot.pe`, vuelve a abrir el enlace y verifica que solo queda una intención pendiente y que se consume una sola vez.

Las recetas Free deben abrir su preview y CookMode; las recetas Pro muestran preview seguro y bloquean pasos/lista hasta que el backend confirme Pro. Un objeto privado, eliminado o inexistente debe terminar igual que un 404 público.

## Google Play Install Referrer

El CTA de una página de objeto genera esta forma de URL de Play (el valor real va codificado por la URL exterior):

```text
https://play.google.com/store/apps/details?id=com.cookpilot.pe&referrer=v%3D1%26url%3Dhttps%253A%252F%252Fcookpilot.pro%252Fes%252Frecetas%252Faderezo-amarillo
```

Prueba desde un track interno o cerrado:

1. Abre la URL de Play desde el CTA de la receta.
2. Instala la aplicación desde el track autorizado.
3. Abre la app y espera a que termine el splash.
4. Confirma que la receta canónica queda pendiente y se resuelve con el actor autenticado actual.
5. Reabre la app y confirma que el mismo referrer no se procesa dos veces.

Resultado esperado: el referrer se lee una vez, se valida `v=1`, se descarta cualquier host o parámetro extraño y la conexión se cierra sin bloquear el arranque. Nunca debe aparecer un token, usuario o entitlement en el referrer.

## Huawei App Linking

1. En AppGallery Connect configura el prefijo `*.drcn.agconnect.link`, las URLs confiables y la firma de producción del flavor Huawei.
2. Genera desde el CTA el wrapper con `deeplink` apuntando a la receta canónica.
3. Prueba el wrapper sin la app instalada y completa la instalación desde AppGallery.
4. Repite con la app instalada y con la app en segundo plano.

Resultado esperado: cold y warm start entregan el mismo `deeplink` a Dart, que lo valida como URL HTTPS de `cookpilot.pro`. La lectura diferida del clipboard, si el SDK la requiere, ocurre únicamente dentro de AGConnect App Linking.

## Compartir, WhatsApp, Copy y QR

- En una página de objeto web, `Open in CookPilot` abre el diálogo de tiendas con el referrer Google o wrapper Huawei correspondiente.
- `Share`, `Copy link`, WhatsApp y QR siempre contienen la URL canónica de CookShare, sin filtros, fragmentos ni dominios externos.
- En el preview nativo de una intención CookShare, `Compartir enlace`/`Share link` usa la hoja de compartir del sistema y envía la misma URL canónica.
- Escanea el QR con la app instalada y sin instalar; el primer caso debe resolver App Links y el segundo debe abrir la página web.

## Resultados que deben quedar registrados

Registra para cada track y flavor: dispositivo/Android, cold o warm start, actor (anónimo/Free/Pro/owner/non-owner), URL usada, destino final, si hubo login/paywall, y si la intención terminó en `consumed`. No ejecutes checkout ni introduzcas una tarjeta real durante estas pruebas.
