# Hicore Ride: Übergabe (aktueller Stand)

Stand: 24.11.2026. Letzte veröffentlichte Version: **0.15.0 Beta** (alle Wege befahrbar, Radwahl Rennrad/Gravel/MTB).
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
| 0.13.0 | Leistung (siehe unten), Auto-Scheiben ohne Schnee, Rücklichter auf den echten Lampen, OSM-Dreieckskreuzungen aufgelöst, Laub bei Schnee gedämpft |
| 0.14.0 | Wege sichtbar (siehe unten): ca. 1.900 km Feld-, Wald-, Wiesen-, Fuß- und Radwege aus OSM, alle Nebenwege mit Poly-Haven-Texturen je Untergrund |
| **0.15.0** | **Wegenetz befahrbar + Radwahl** (siehe unten): Straßen, Nebenstraßen und Wege ein Netz, Abbiegen überall, Rollwiderstand je Rad/Untergrund, Wurzelstellen, Wegbrücken |

**Wegenetz und Radwahl (0.15.0)**
- `gnData()` (Straßennetz) bleibt unverändert für Optik, Verkehr, Gelände. Fahren/Abbiegen läuft über **`gnRG()`**: gleiche Knoten-/Kantennummern wie gnData, dazu Nebenstraßen (side2.bin, `kind 's'`, c=20+Klasse) und Wege (ways.bin, `kind 'w'`). Straßenkanten werden an Wege-Anbindungen nur im RG geteilt (erstes Stück behält die Nummer, `R.split[k]`, `R.pieceOf`), nie Kreisel, Schleifen, Doppelfahrbahnen. `R.loop` = Hauptrunde in RG-Kanten.
- Aufbau `rgBuildWays` (ca. 0,7 s, Cloud): Anbindung, wo ein Weg die Fahrbahn kreuzt oder darauf liegt (nicht unter Straßen > 3 m über DEM), Wege untereinander über gemeinsame Endpunkte, T-Einmündungen (0,6 m) und Schnittpunkte, Knoten < 0,9 m zusammengelegt. Stand: 30.700 Kanten, 27.000 Knoten, 2.670 km Wege/Nebenstraßen, 98 % mit der Runde verbunden. Aus: `window.NO_WAYNET`.
- Weg-Punkte (`RGE.P`) erst bei Bedarf: Höhe `terrainH+0.08` wie das Wege-Netz, an Straßen 10 m übergeblendet, Brücken gerade zwischen den Enden.
- Radwahl: Menü Welt → Fahrrad, `BIKE` ('road'|'gravel'|'mtb', localStorage `hicoreRide.bike`), `BIKES[...]` (CdA 0,32/0,34/0,37). **0.16.0 hängt hier Modell und Sitzhaltung ein.** `gAdj()`: Rennrad = Straßen + asphaltierte/gepflasterte Nebenstraßen + asphaltierte Wirtschafts-/Radwege (`adjS`), Gravel/MTB alles (`adjW`). `window.GADJ='R'` = reines Straßennetz (Tests, Startrunde in `zgApplyStart`).
- Rollwiderstand `BIKE_CRR[sf][rad]` und `gEdgeCrr(E)` (schmale Pfade: Gravel ×1,5, MTB ×0,95), Wurzelstellen `ROOT_CRR` (0,09/0,075/0,028) auf Pfaden/Reitwegen im Wald alle 70–220 m (`R.roots`, `gRootAt`, sichtbar `gtRootMesh`). Wird in der Physik pro Bild über `gEdgeAt(S.dist)` gesetzt (`meP.crr/cda`). Beim Wechsel auf einen Weg kurzer Hinweis mit Wegart und Untergrund.
- Abbiegen: `gPath` mit Binärheap, Nebenstraßen ×1,25 und Wege ×1,6 teurer (Rückweg zur Runde bevorzugt Straßen). Hinweise zeigen bei Wegen „Waldweg · Schotter“ usw. (`gWayName`). Kein Autoverkehr, solange man auf einem Weg/einer Nebenstraße fährt, Autos fahren nie auf Wege. Auf schmalen Wegen fährt man mittig.
- Brücken auf Wegen und Nebenstraßen: `buildWayBridges()` (Holz/Beton, Geländer, je 1-km-Feld ein Netz), Nebenstraßen-Brücken nicht mehr auf dem Gelände.
- Tests: `tnet.js` (Aufbau, Zeit, Verbundenheit), `twjun.js` (NS Knoten, BIKE: Abbiegen an Wege-Kreuzungen, Sprung, Lücke, Kehrtwende, Höhe), `tride.js` (im Spiel abbiegen + Bilder).
- Grenzen: Wege-Wege-Kreuzungen auf verschiedenen Ebenen ohne Brücken-Flag werden verbunden; Rückweg zur Runde nimmt den kürzesten Weg; Startpunkt auf der großen Karte nur auf Straßen; Höhen auf Wegen aus 25-m-DEM (steile Pfade bis ca. 30 %).

**Wege (0.14.0)**
- Daten: `quelle/zg2/ways.bin` (452 KB, gebaut in der Higgsfield-Sandbox `~/w14` mit `zg2/ways.py` aus Overpass `zg2/ways_query.txt`, bbox wie Straßen). OSM `highway=track|path|footway|cycleway|bridleway`, ohne Gehsteige/Überwege, ohne private Wege < 80 m (Hofzufahrten), ohne Stücke < 4 m. 12.518 Wege: track 1.154 km, path 491, footway 235, cycleway 18.
- Format: `'WAY1'`, Anzahl, je Weg Klasse (10 track, 11 path, 12 footway, 13 cycleway, 14 bridleway), Breite×10, Untergrund `sf`, `tracktype | smoothness<<4`, Flags (8 Brücke, 16 Tunnel, 32 Untergrund geschätzt, 64 privat), OSM-Id, Punkte als int16-Deltas in 0,5 m. Im Spiel `waysData()` → `window.WAYS` (alle Wege mit Untergrund), `WAY_SURF[sf]` = Name + Rollwiderstand `crr` (Schätzwerte) für späteren Lauf-/MTB-Modus.
- Untergrund `sf`: 0 Asphalt, 1 Pflaster, 2 Verbundpflaster, 3 Beton, 4 wassergebunden, 5 Feinschotter, 6 Schotter, 7 Erde, 8 Gras, 9 Sand, 10 Fels, 11 Holz, 12 unbefestigt, 13 befestigt. Ohne OSM-Angabe geschätzt aus `tracktype` (grade1 befestigt … grade5 Gras), Pfade = Erde.
- Darstellung: Nebenstraßen (side2.bin) und Wege teilen ein Material mit Texturatlas `quelle/texways/ways_atlas.jpg` (3×3 Poly-Haven-CC0: asphalt_02, cobblestone_floor_08, concrete_pavers_02, concrete_pavement, grass_path_2, forest_ground_04, grass_ground, forest_leaves_02, rocky_trail). Erde im Wald (`gnLC`=1) wird Waldboden. Feldwege (grade3+ bzw. Erde) mit Grasnarbe in der Mitte, unbefestigte Ränder ausgefranst, nass dunkler, Schnee wie Gelände (`snowKind` 't'). Shader-Zweig `fx.ways` in `gpuFx`.
- Pro 500-m-Kachel ein Netz für Straßen/Feldwege (bis Sichtweite) und eines für schmale Pfade (nur bis 650 m, LITE 450, MINI 300). Klassen 8/9 aus side2.bin werden durch ways.bin ersetzt.
- `waysNear()` hält Waldbäume 2,2 m und Einzelbäume 1,6 m von Wegen fern.
- Alter Stand (graue Bänder, keine Feldwege): `?oldways=1`. Brücken auf Wegen werden noch weggelassen (Gelände passt dort nicht). Befahrbar ist noch nichts.

**Leistung (0.13.0), gemessen mit `tests/tperf.js` (Cloud, Software-Rendering, nur Zählwerte belastbar)**
- Vorher: 41 MB Erstladen (27 MB Modelle, die der Start abwartet), media.js 6,4 MB Base64, ca. 750 Zeichenaufrufe mit 3 Bots (jeder Fahrer ca. 130 Einzelteile), ca. 330 ohne Bots; 256–270 MB Texturen; jedes Auto wurde bei jedem Auftauchen neu gebaut (bis 66 ms Hänger, Kennzeichen-Texturen nie freigegeben); Shader nur für das beim Start Sichtbare vorkompiliert.
- Umgesetzt (alles abschaltbar):
  - Fahrer `data/rider.glb` und Rahmen `data/frame.glb` als Binärdateien statt Base64 (media.js 0,8 MB). Alter Weg: `EMBED_GLB=1 python3 build_gpu.py`.
  - Autos: 21 Pool-Autos werden im Ladebildschirm einmal gebaut und wiederverwendet (`TRAFFIC.prebuild`, `make` → `make0`). Aus: `window.NO_CARCACHE`.
  - `warmShaders()`: im Ladebildschirm je Material/Objektart ein Stellvertreter für alles bis 1,5 km plus Effekte und Pool-Autos, dann `compileAsync`. Aus: `?warm=0`. Ohne Radius stiegen die Texturen auf ~400 MB, deshalb `WARM_R`.
  - `RLOD`: Bots/Mitspieler blenden ab 20 m Kleinteile < 2 cm, ab 45 m < 10 cm über `layers` aus. Aus: `?rlod=0`.
  - `DRES`: dynamische Auflösung (bis 70 % der Stufe) vor der 30-FPS-Begrenzung, Menü „Auflösung automatisch“. FPS-Anzeige zeigt dann z. B. „45 FPS · 80 %“.
  - `TEXCAP`: am iPad/Handy Auto- und Zugtexturen 1536 → 1024. `?texcap=0` aus, `?texcap=1024` erzwingt am Rechner.
- Noch nicht gemacht: Modelle (27 MB) erst nach Bedarf laden statt vor dem Start; Wald-Instanzgruppen (~320 Aufrufe) zusammenfassen; Fahrer-Rad (130 Teile) zu wenigen Meshes verschmelzen. KTX2, Draco, Kacheldaten, Worker bewusst weggelassen.

**Straßennetz (0.13.0):** In `gnData()` werden OSM-Dreiecke an Einmündungen (Basis < 20 m, Äste < 80 m) aufgelöst: der namenlose bzw. längere Ast fällt weg, Kreisel (ZG_RB0) ausgenommen, Kantenindizes werden neu durchnummeriert (6 Stellen, u. a. Windgasse/S 136 Waltersdorf; tjun-Meldungen 48 → 40, keine neuen). Aus: `window.NO_TRIFIX`.

**Autos (0.13.0):** Schnee-Art `c` (`snowCar`): dunkle Stellen der Modelltextur (Scheiben, Reifen, Grill) bleiben frei. `TRAFFIC.lampFit()` findet rote Texturstellen hinten und lässt genau diese Dreiecke leuchten, dazu Lichthöfe (Sprites); Scheinwerfer seitlich wie die Rücklichter, mit Lichthof. Alter Weg: `window.OLD_CARLIGHTS`.

**Laub (0.13.0):** Das grelle Gelbgrün kam vom Gegenlicht-Leuchten der Blätter (`D.glow`): jetzt schwächer, enger um die Sonne und bei Schnee zusätzlich gedämpft; Schnee auf Laub dünner und Laubfarbe bei Schnee entsättigt. Alter Stand mit `?oldleaf=1`. Kontrollbild: `tests/ttree.js`.

**Offen / unsicher**
- 0.13.0 am iPad prüfen: Ladezeit-Meldung („Geladen in … Vorbereitung …“), ob Ruckler beim ersten Auto/Zug/Regen weg sind, FPS-Anzeige mit Prozent.
- 0.14.0 am iPad prüfen: Wege-Optik (Helligkeit, Grasnarbe, Waldboden), FPS mit den zusätzlichen Wegen.
- 0.15.0 am iPad prüfen: Abbiegehinweise auf Wegen (zu viele in Orten/Wald?), Fahrgefühl Gravel/MTB, Ladezeit (+0,7 s), Wurzeln/Brücken.
- Schnee-Reste aus 0.12.0: Dach-Schneekanten, Schneegeräusche (Details in docs/ARCHIV.md).
- Poly-Haven-Texturen als Standard? Hicore soll am iPad vergleichen.
- FIT- und Fahrtbild-Download in Bluefy kaputt. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

1. Hicores Rückmeldung zu 0.13.0 und 0.14.0 (iPad).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
4. Leistung Teil 2 nur bei Bedarf: Modelle nach Bedarf laden, Wald-Instanzen bündeln, Fahrer-Rad verschmelzen.
5. **0.16.0: Gravelbike- und MTB-Modell mit eigener Sitzhaltung** (Gravel: dickere Reifen, aufrechter, Lenker breiter mit Flare; MTB: gerader Lenker) an `BIKE`/`BIKES` hängen. Danach Laufmodus (RSC/FTMS) auf demselben Netz.
6. **Treppen (Hicore 24.11., nach 0.16.0):** OSM `highway=steps` (mit `step_count`) über die Sandbox nachladen (Kosten vorher nennen) und ins Netz. Rennrad nie, Gravel trägt hoch und runter, MTB fährt runter, trägt hoch. Absteigen, bei 2–3 Stufen anheben, sonst schultern (Cyclocross), Schritttempo, oben/unten wieder aufsteigen.
7. Accounts (Supabase Auth mit Google), Easter Eggs, später Abo.
