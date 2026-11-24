# Hicore Ride: Übergabe (aktueller Stand)

Stand: 24.11.2026. Letzte veröffentlichte Version: **0.17.1 Beta** (Fahrgefühl auf Wegen: Pfützen, Matsch, unruhige Linie).
Diese Datei ist bewusst kurz und enthält nur, was ein neuer Thread zum Weiterarbeiten braucht.
Alles Ältere (Entscheidungsgeschichte, frühere Versionen, Hardware-Details, Asset-Herkunft) steht in **`docs/ARCHIV.md`**. Nur bei Bedarf gezielt darin suchen (`grep`), nicht ganz lesen.

**Arbeitsweise seit 24.11.:** Ein Thread pro Schritt bzw. Version. Am Ende jeder Version diese Datei aktualisieren: Stand, Versionsnotizen (nur die letzten 3, ältere nach `docs/ARCHIV.md` verschieben), nächster Schritt. Ziel: höchstens ca. 200 Zeilen.

---

## 1. Worum es geht

- Zwift-ähnliches Indoor-Radspiel im Browser. Three.js r187 mit WebGPU (Rückfall WebGL 2), eine große HTML-Datei plus Datenpakete, Bluetooth über Web Bluetooth.
- Hauptwelt **Zittauer Gebirge**: echtes OSM-Straßennetz (ca. 180 km), echte Höhen, Kreuzungen, Kreisel, Verkehr, Bahn, Wahrzeichen, Wetter. Weitere Welten: Sonneninsel, Elbsandstein, Hügelland, Alpenpass.
- Zielgruppe: Hicore selbst und Freunde (Multiplayer über Supabase Realtime). Später eventuell öffentlich, Abo-Idee nicht entschieden.
- Bleibt im Browser (Entscheidung 19.11.). Keine Markenlogos, keine Google-/Esri-Bilder, kein Nachbau fremder Spiele.
- Hauptgerät: **iPad Air M1**, Bluetooth nur in der App **Bluefy**. Watt/Kadenz über Stages-Powermeter, Puls über Wahoo TICKR X. Elite Drivo hat kein FTMS, Widerstandssteuerung ungelöst.

## 2. Links

- Spiel: https://hicore77.github.io/hicore-ride/webgpu-spiel/
- Vorschau-Bilder: https://hicore77.github.io/hicore-ride/vorschau/
- Repo: https://github.com/hicore77/hicore-ride (öffentlich, Branch `main`)
- Supabase (Multiplayer): `https://snpmmskruuzqrvvsdztz.supabase.co`, nur der publishable Key steht im Code.
- Notion: „Hicore – KI-Wissensbackup & Kontextarchiv“, Seite 04 = Hicore Ride. Ergebnisse dort nachtragen.

## 3. Hicores Regeln (immer gültig)

**Kommunikation**
- Anrede „Hicore“, Deutsch, du, kurz, direkt, Ergebnisse zuerst. Schwächen offen ansprechen.
- Bilder nicht in den Thread, sondern auf die **Vorschau-Seite** (`vorschau/`, nummeriert, neuester Abschnitt oben).
- Links immer komplett klein (`hicore-ride`).
- Er testet abends am iPad, schreibt oft per Sprache (Tippfehler wie „Polyheaven“, „Fixfield“ = Higgsfield).

**Geld und Freigaben**
- Nie automatisch nachkaufen. Vor jeder kostenpflichtigen Generierung Kosten und Restguthaben nennen, Hicore entscheidet (Stand 24.11.: Higgsfield ca. 0,5 Credits, aiqora ca. 137).
- Senden, Buchen, Kaufen, Löschen nur mit Zustimmung. Keine Secrets ins Repo (Gemini-Schlüssel bleibt im Browser, Mapillary-Token in der Higgsfield-Sandbox).

**Arbeitsweise**
- Selbstständig abarbeiten, nach jeder Änderung testen, dann veröffentlichen.
- Neue Version = Versionsnummer im Menü, Commit, Vorschaubilder. Schema 0.x.y (kleine Schritte 0.12.1, größere 0.13.0).
- Riskante Grafikumstellungen **umschaltbar** bauen, alt bleibt erhalten.
- Modell: Hicore bleibt bei Opus.

**Straßennetz** (für jede neue Straße, Kreuzung, jeden Kreisel)
- Straßen enden genau im Kreuzungspunkt, Entscheidung erst dort, kein Sprung beim Umschalten.
- Kreisel = eigene Ringstraße, gegen den Uhrzeigersinn, nie abkürzen.
- Fahrlinie immer rechts auf der Fahrbahn. Kreuzungen genau eine Höhe, keine Höhensprünge.
- Danach `tturn`, `tjump` (`RBP=32`), `tjun` und eine Draufsicht.
- Sackgassen sichtbar, aber ohne Abbiegehinweis (außer Lausche, Hochwald). Seit 0.15.0 sind Wege befahrbar (je nach Rad).
- Pflicht-Straßentests laufen mit `window.GADJ='R'` auf dem reinen Straßennetz (in den Tests gesetzt). Für Wege: `twjun.js`.

**Optik, Ton, Verkehr**
- Straßenrand feines Gras, innerorts Pflaster/Splitt. Dachüberstände ca. 25 cm. Bäume nur, wo sie real stehen.
- Jedes reale Haus nur einmal. Higgsfield-3D nur für markante Bauten, sonst Hausbaukasten. Kein Türkis bei Umgebindehäusern.
- Kein Ketten-/Freilaufgeräusch. Geräusche nur mit sichtbarem Anlass.
- Verkehr außerorts 80–100, innerorts 40–50 km/h, keine Unfälle, Überholer warten oder brechen ab.
- Segment-Bestzeiten nur mit echtem Trainer, nie im Demo-Modus.

## 4. Architektur, Build, Tests, Veröffentlichen

**Code** (alles im Repo):
- `quelle/gpu/src.html`: der gesamte Spielcode (ca. 6.900 sehr lange Zeilen). Nur gezielt mit `grep -n` suchen, nie ganz lesen.
- `quelle/build_gpu.py` baut `quelle/gpu/index.html`, `gpu/data/`, `gpu/props/`.
- `quelle/gpu/three187gpu.js`: three-Bundle (aus `entry_gpu.js`, esbuild).
- Weltdaten Zittau unter `quelle/zg2/` (y in der Welt = Höhe über NN minus 300 m), Texturen `texjpg/` und `texjpg_ph/`, Modelle `props/`, Geräusche `sfx/`.
- Veröffentlichtes Spiel: `webgpu-spiel/`. Vorschau: `vorschau/`. Root-`index.html` ist das alte r128-Spiel (eingefroren).

**Wichtige Stellen in `src.html`**
- `gpuFx()`: baut aus Material-Markierungen TSL-Knoten (Gelände, Straße nass, Wind, Überblendung, Schnee).
- `snowKind()` / `SNOW`-Uniforms: Schnee je Materialart (siehe Abschnitt 5).
- **Wichtig (gelernt in 0.12.0):** Normale TSL-Uniforms (`GU`) werden auf unbewegten Meshes (Gelände, Häuser, Straßen) nach dem ersten Kompilieren nicht mehr aktualisiert. Werte, die sich zur Laufzeit ändern, mit `GUR()` anlegen (renderGroup) und nach Änderung `GURtouch()` aufrufen. `WET` und `SNOW` laufen schon so. `WIND.t` auf dem Gelände vermutlich noch betroffen.
- In `gpuFx` liefert `normalWorld` im colorNode keine brauchbaren Werte, dort `normalWorldGeometry` nehmen.
- `ATMO` (Tageszeit, Wetter, Regen, Flocken, Blitze), `RWX` (echtes Wetter über Open-Meteo), Menüs `#tod`, `#wx`, `#snow`, `#snowRd`.

**Bauen und testen**
```bash
cd quelle && python3 build_gpu.py
cd tests
node terr2.js        # Seitenfehler, muss "none" ausgeben (liefert quelle/gpu über serve.js aus, kein eigener Server nötig)
node tturn.js; RBP=32 node tjump.js; node tjun.js   # nach Straßenänderungen (brauchen Server auf 127.0.0.1:8765)
CFG='[["name","wx","snow","snowRd","tod"]]' PL='["Jonsdorf"]' OUT=… node tsnow.js   # Schnee-Renderbilder
OUT=… MODES=rut,forest,gravel,path,top PL=Jonsdorf SN=keine node tways.js   # Wege-Kontrollbilder (0.14.0)
```
- Alle Cloud-Tests laufen mit `?gl=1` (WebGL 2, Software-Rendering, 10–25 min je Lauf, im Hintergrund starten). Echtes WebGPU nur auf Hicores iPad.
- Im Cloud-Container ließ sich am 24.11. kein eigener `python3 -m http.server` starten (vom Auto-Modus abgelehnt). Deshalb `tests/serve.js`: Playwright liefert die Dateien über `page.route` direkt aus. Umgestellt sind terr2, tturn, tjump, tjun sowie die neuen tperf, tcar, ttree, tkreuz; ältere Tests lassen sich genauso umstellen.
- Blockiert aus der Cloud: github.io, Open-Meteo, Poly Haven, Overpass. Weg dorthin: Higgsfield-Sandbox (`sandbox_exec`).

**Veröffentlichen**
```bash
cp quelle/gpu/index.html webgpu-spiel/
rm -rf webgpu-spiel/data webgpu-spiel/props && cp -r quelle/gpu/data quelle/gpu/props webgpu-spiel/
# Version in src.html ("Version 0.x.y Beta"), Bilder nach vorschau/ + Eintrag oben in vorschau/index.html
# commit + push auf main; Pages aktualisiert sich nach 1–2 Minuten
```

## 5. Aktueller Stand

**Letzte Versionen**

| Version | Inhalt |
|---|---|
| 0.16.2 / 0.16.3 | Hotfix: eigene Wahl wurde kurz vor der Kreuzung von der Vorwahl überschrieben (Kreuzung nach dem Umschalten jetzt als erledigt markiert, Test `tkalb.js`). Übernächste Kreuzung unter 150 m klein darunter („Danach in … m“), schon wählbar, folgt der gewählten Richtung (`gMakePend`, `NET.pend2v`, `NET.pre`, vorab berechnete Strecke `NET.hyp`; aus: `window.NO_JUN2`; Test `tjun2.js`, `TURN1=1 BIKE=gravel`) |
| 0.17.0 | Kartenrand aufgefüllt + Kacheln + OSM-Natur + Wanderer (siehe unten) |
| **0.17.1** | **Fahrgefühl auf Wegen: unruhige Linie, Pfützen mit Regendauer, Ausweichen/Spritzen, Matsch, Rutscher** (siehe unten) |

**Umgebung und Kacheln (0.17.0)**
- Daten ohne Higgsfield, direkt aus der Cloud (S3 offen): Overture 2026-11-18 (Gebäude, base/land, land_use, infrastructure; `werkzeuge/overture_holen.py PREFIX ziel.parquet spalten`), Copernicus GLO-30, ESA WorldCover 2021. Rohdaten nicht im Repo (ca. 140 MB), Skripte schon.
- `werkzeuge/rand_auffuellen.py COP.tif WC.tif OVDIR`: DEM jetzt x −10393…10607, z −14506…8019 (841×902, 25 m; alt innen unverändert, außen Copernicus mit Naht-Ausgleich über 600 m), `lc10.png` x0 −10400 z0 −14500 2100×2250 (`window.ZGLCO`), Wald- und Ortsraster in `zgres.json` bis zum Rand (OSM über Overture). Bricht ab, wenn schon erweitert.
- `werkzeuge/kacheln.py OVDIR` → `quelle/kacheln/k_I_J.bin` (2 km, 139 Dateien, 1,9 MB) + `index.json` + `zg2/lmb.b64` (Wahrzeichen-Grundrisse). Inhalt: Gebäude (alt 27.433 + 26.201 neu am Rand, Typ 5 = in Industriefläche → Hallen/Blech in `htPick`), OSM-Bäume (alt + Rand: tree, tree_row, scrub, orchard, hedge), Felsen (8 Byte: x,z, Typ 0 Wand an `natural=cliff` mit Höhe aus DEM-Gefälle, 1 Einzelfels, 2 Geröll, 3 Block in Felsfläche), Zäune/Mauern (0 Industrie 2 m Maschendraht, 1 Holz, 2 Mauer, 3 Stützmauer). `build_gpu.py` kopiert nach `data/kacheln` und schreibt nur Index + `ZGLMB` in zittau.js (ZGBLD/ZGTREES entfallen, zittau.js 4,5 MB).
- Spiel: `KC` (Laden per fetch, max. 4 gleichzeitig, Radius Fernsicht+1,5 km, frei ab +4 km), `kcTick` im Hauptloop, `kcReady(i,j)` (500-m-Kachel samt Nachbarn geladen) sperrt Häuser/Wald/Fernsicht bis die Daten da sind, `kcWait` beim Start (2,6 km um Start und Startpunkt, max. 15 s). `bldDecode`, `gtBldIndex`/`gtOsmTrees` liefern die geladenen Maps. Felsen und Zäune entstehen mit der Waldkachel (`gtRockList/gtRockMesh/gtRockHash`, `gtFenceMesh`; keine Bäume in Felsen, nichts auf Straßen/Wegen, nicht im Oybin-Modell/Schanze/Kelchsteine). Aus: `window.NO_KC`.
- Wanderer (`HIKE`, `hikeStep`): alle 14–40 s, max. 3 (LITE 2, MINI 1), erscheinen 150–380 m voraus auf Wegen ≥ 60 m, gehen weiter auf anschließende Wege, treten bei vorbeifahrendem Fahrer an den Rand und schauen, verschwinden ab 520 m; Figuren aus dem Pool (wanderer_w/_m, spaziergaengerin). Aus: `window.NO_HIKE`.
- Tests: `tkc.js` (PTS-Liste Bilder, Kachelzahlen), `thike.js` (braucht Verknüpfung `quelle/gpu/figuren` → `webgpu-spiel/figuren`, steht in .gitignore).

**Fahrgefühl auf Wegen (0.17.1)**
- Alles in `src.html` bei `WF` / `wayFeelStep(dt)` (vor `placeRider(me)`) und `wayFeelFx(dt)` (danach), nur der eigene Fahrer. Untergrund aus `gEdgeAt(S.dist)`: Rauheit `WF_ROUGH[sf]`, Matschanteil `WF_MUD[sf]` (Wald ×, Nässe `WET.w` und Pfützenstand `WET.p`).
- Linie/Stöße: Schlängeln ±7–10 cm (MTB 6 cm) nach Strecke, Gierwinkel folgt, Stöße alle 0,8 m per Hash (Höhe ≤ 1,3 cm, Nicken, Rollen), MTB Stöße halb so stark. In `placeRider` für `me` angewendet. Aus: `window.NO_WAYFEEL`.
- Pfützen: `WET.p` (GUR) wächst nur bei Regen (`WET.tw>0.5`), voll nach ca. 18 min (Gewitter ca. 8), trocknet in ca. 45 min. Straßen: Rauschschwelle im Straßen-Shader nach `WET.p`. Wege: 6-m-Zellen, Hash `wfHash` in JS und Shader identisch (float32), Wahrscheinlichkeit unbefestigt 0,42/befestigt 0,12, Radius 0,5–1,2 m, jede Pfütze hat eigenen Startpegel. `wayPudHit` prüft 14 m voraus, Fahrer weicht seitlich aus (`WF.pOff`, nur wenn Platz bis 0,35 m vom Rand), sonst Spritzer. Test-Override `window.PUD_SET=0..1`. Aus: `window.NO_PUDDLE`.
- Matsch: erdige Wege (Layer Erde/Gras/Waldboden) dunkler und glänzend nach Regen; Matschbrocken als Billboards (`WF.fx`, Farbe je Teilchen), MTB ×2; seltener Hinterrad-Rutscher (2,9–5,7°, Drehung um das Vorderrad, Lenker gegen, Mindestabstand 8 s, im Test ca. 1 pro 50 s bei vollem Matsch). Aus: `window.NO_MUD`.
- Test `tests/twet.js` (Waldweg bei Jonsdorf, Regen, `PUD=1`): ohne `OUT` Logiktest über 600 m, mit `OUT=ordner` drei Bilder.
- Ältere Notizen 0.16.1 (Vorauswahl `gNatural`, Kurvenneigung, Wiegetritt, Rollwiderstandstabelle, Einmündungen) stehen in `docs/ARCHIV.md`.

**Offen / unsicher**
- 0.13.0 am iPad prüfen: Ladezeit-Meldung, Ruckler beim ersten Auto/Zug/Regen, FPS-Anzeige mit Prozent (Details 0.13.0 in docs/ARCHIV.md).
- 0.16.0 am iPad prüfen: Optik Gravel/MTB, Sitzhaltung, ob Farben direkt nach dem Radwechsel stimmen; Lenkerbreite/Flare/Hoods-Winkel ggf. in `GRAVEL_BAR` nachjustieren.
- 0.14.0 am iPad prüfen: Wege-Optik (Helligkeit, Grasnarbe, Waldboden), FPS mit den zusätzlichen Wegen.
- 0.17.1 am iPad prüfen: Stärke des Wackelns (Gravel/MTB), Pfützen-Optik und Ausweichen, Matschbrocken sichtbar genug, Rutscher nicht zu oft; FPS mit dem neuen Wege-Shader. Pfützen starten bei Spielbeginn leer, auch wenn es schon lange regnet (echtes Wetter: Regen der letzten Stunden noch nicht ausgewertet).
- 0.17.0 am iPad prüfen: Ladezeit beim Start (Kacheln), Nachladen ohne Ruckler, Felswände (Jonsdorf/Oybin-Umgebung), Ränder Ost (Neiße) und Süd (Tschechien), Wanderer.
- 0.16.1 am iPad prüfen: Vorauswahl in Orten (Spitzkunnersdorf), ob dezente Abzweig-Hinweise reichen, Ruckler beim automatischen Neuberechnen, Optik der Einmündungen.
- Idee (Hicore 24.11.): Abbiegen über die Schaltgriffe der elektronischen Schaltung (links/rechts) wählen.
- 0.15.0 am iPad prüfen: Fahrgefühl Gravel/MTB, Ladezeit (+0,7 s), Wurzeln/Brücken.
- Schnee-Reste aus 0.12.0: Dach-Schneekanten, Schneegeräusche (Details in docs/ARCHIV.md).
- Poly-Haven-Texturen als Standard? Hicore soll am iPad vergleichen.
- FIT- und Fahrtbild-Download in Bluefy kaputt. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

1. Hicores Rückmeldung zu 0.13.0 und 0.14.0 (iPad).
1a. **C: Einzelbäume außerhalb Wald aus Luftbild DOP20 (Test Jonsdorf)**, dann 0.18.0 Treppen (Punkt 6).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
4. Leistung Teil 2 nur bei Bedarf: Modelle nach Bedarf laden, Wald-Instanzen bündeln (Rad-Verschmelzen ist seit 0.16.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. **Treppen (Hicore 24.11., nach 0.16.0):** OSM `highway=steps` (mit `step_count`) über die Sandbox nachladen (Kosten vorher nennen) und ins Netz. Rennrad nie, Gravel trägt hoch und runter, MTB fährt runter, trägt hoch. Absteigen, bei 2–3 Stufen anheben, sonst schultern (Cyclocross), Schritttempo, oben/unten wieder aufsteigen. **Animation wie im echten Cyclocross** (vorher echte Bewegungsabläufe recherchieren): 2–3 Stufen = Rad an Oberrohr und Lenker greifen, kurz anheben, drübertragen; längere Treppen = absteigen im Lauf, Rad schultern (Oberrohr auf der Schulter, Arm um das Steuerrohr/Lenker), hochlaufen, wieder aufspringen.
7. Accounts (Supabase Auth mit Google), Easter Eggs, später Abo.
