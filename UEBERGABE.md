# Hicore Ride: Übergabe (aktueller Stand)

Stand: 24.11.2026. Letzte veröffentlichte Version: **0.18.1 Beta** (Rennrad biegt nur noch in befestigte Straßen ab).
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
| 0.17.3 | Hotfix: Nahgras/Acker nicht mehr auf Wegen, Äcker nach Schlag, Wackeln schwächer in zufälligen Phasen (siehe unten) |
| 0.18.0 | Treppen aus OSM (tragen, schultern, MTB runterfahren), FIT-Export mit echten Koordinaten (siehe unten) |
| **0.18.1** | **Rennrad: Abbiegehinweise nur noch in befestigte Straßen** (siehe unten) |

**Kacheln/Rand (0.17.0):** Details (Datenquellen, `rand_auffuellen.py`, `kacheln.py`, `KC`/`kcTick`/`kcReady`, Felsen, Zäune, Wanderer `HIKE`, Tests `tkc`/`thike`) jetzt in `docs/ARCHIV.md`.

**Fahrgefühl auf Wegen (0.17.1):** Details (`WF`, `wayFeelStep`, Pfützen `WET.p`, Matsch, Test `twet`) jetzt in `docs/ARCHIV.md`.

**Echte Bäume aus Luftbild (0.17.2):** Details (Quellen, Kette `werkzeuge/chm_ausschnitt|dop_holen|dop_baeume|dop_einfuegen`, `gnDopW`, `NO_DOPT`, Test `tdop`) jetzt in `docs/ARCHIV.md`. Nächste Ausschnitte: gleiche Kette mit anderer bbox.

**Hotfix 0.17.3**
- Ursache Büschel auf Feldweg (Hicore, Feldweg Kälbersträucher → Hainewalde): Nahgras `gfCell` prüfte nur Straßen (`gnNear`), nicht Wege. Ackerpflanzen (LC 3, Faktor 1,8–2,3, grün) standen dadurch auf jedem Feldweg durch Äcker; Fehler bestand seit Wege existieren, nicht durch DOP-Bäume (Ort liegt außerhalb Jonsdorf). Jetzt: nichts innerhalb Wegbreite+0,3 m (`waysNear`), keine Ackerpflanzen bis 4 m neben Wegen. Aus: `window.NO_GFWAY`.
- Acker je Schlag wie `lcCol` (Hash x/140, z/110): umgepflügt (≥0,75) kahl, Stoppel kurz strohfarben, Wintersaat kurz grün, jeweils ausgedünnt. Nahgras in Feldnähe ca. halbiert (Test: 23.763 → 11.467 Instanzen im 40-m-Umkreis), sollte die 30 FPS dort verbessern (am iPad prüfen).
- Wackeln (`wayFeelStep`): Grundamplitude ca. −30 %, schnelle Anteile kleiner; Phasen `WF.ph` zufällig (ruhig 1–3 s, normal 2–4 s, ruppig 3–4 s), ab und zu Einzelhuckel (`WF.hkS`). Alte Gleichmäßigkeit: `window.WF_PHASE=0`.
- Test `tests/tgf.js` (`PL`, `PL2` = Feldweg zwischen zwei Orten, `OLD=1`, `ROOT=…/webgpu-spiel` für alte Version, `OUT` Bild).

**Treppen (0.18.0)**
- Daten: `quelle/zg2/steps.bin` (11 KB, 483 Treppen, 7 km, 193 mit `step_count`), gebaut in der Higgsfield-Sandbox mit `zg2/steps.py` aus Overpass `way["highway"="steps"]` (bbox wie Straßen; overpass-api.de braucht einen User-Agent, sonst 406). Format wie ways.bin, Klasse 15, Byte 6 = Stufenzahl, Flags 1/2 incline bekannt/hoch, 4 Handlauf, 128 Schieberampe. `build_gpu.py` → `window.ZGSTEPS`, im Spiel `stairsData()`.
- Höhe (`stairInit`): Stücke auf der Fahrbahn abgeschnitten (`T.s0/s1`), Richtung aus `incline`, sonst Gelände; Höhe = Stufenzahl × 16,5 cm, aber höchstens 40 cm Abweichung vom Gelände (dann flachere Stufen). Endet die Treppe an einer Straße, liegt das Ende genau auf Fahrbahnhöhe. Wege an Treppenenden werden auf 7 m angeglichen (`stairBlend` in `wayLiftY`, Optik und Fahrlinie). Fahrlinie gerade (`stairY`), Stufenoberkante `stairTop`.
- Netz: in `rgBuildWays` als Weg Klasse 15 (`E.st`, `E.stS0/S1`, `E.nv`), Knotenhöhen aus der Treppe, `rgPts` linear, `gRoute` rundet Treppen nicht ab. Rennrad nie (`adjS`), Routing ×6 teurer, `gRank` 9, Name „Treppe · N Stufen“. 3D-Stufen je 500-m-Kachel am Pfad-Netz (`stairsMesh`, Blöcke, Erdstufen mit Holzkante, Handlauf), Bäume halten Abstand (`stairsIdx` → `WAYS_H`).
- Ablauf (`STAIR`, `stairSpans`, `stairStep` in der Hauptschleife nach `curveVmax`): Modus `stairMode`: MTB bergab `ride` (stehend, Kurbel waagrecht, Stöße), bis 3 Stufen `lift` (links neben dem Rad, linke Hand Lenker, rechte Oberrohr, Rad über die Stufen gehoben), sonst `shoulder` (Oberrohr auf der rechten Schulter, rechter Arm um das Steuerrohr an den Lenker, linker Arm schwingt). Zonen 2,2–3,2 m vor/nach den Stufen (Ab-/Aufsteigen, rechtes Bein hinten über den Sattel), davor Bremsen auf 1,7–2,8 m/s, zur Treppe hin in die Wegmitte (`STAIR.lc`). Tempo nach Leistung (bergauf 0,5–1,25 m/s, bergab 0,7–1,3, kurz 1,0–1,4), ohne Treten bleibt man stehen. Trainer bekommt 0 %. Füße treffen die Stufenmitten (`stairCarry`), Figur waagrecht. Pose: `carryBody`, `carryRig` in `poseGLB` (opt.carry), Greifhände über `R._ghF`. Aus: `window.NO_STAIRS`.
- Test `tests/tstair.js` (`BIKE`, `PL`, `NV=min,max`, `UP=1|-1`; ohne `OUT` Logik: Tempo, Zeit, Fußfehler; mit `OUT`, `PTS=-1.6,mid,end`, `SIDE=1|-1|0` Bilder). Ergebnis: 500 Treppenstücke im Netz, keine für das Rennrad; 9 Stufen hoch in 11 s, Füße im Schnitt 5 cm über der Stufe, nie darunter.

**FIT-Export (0.18.0):** `geoOf` rechnet im Zittauer Gebirge mit derselben Umrechnung wie die OSM-Daten zurück (lat0/lon0 aus `ZGNET`, 111320 m/°), Höhe = y + 300 m (echte Höhe über NN). Strava zeigt die Fahrt auf den echten Straßen. Echte Orte (`WORLD.real`) wie bisher echt, Fantasiewelten weiter im „Hicore-Archipel“ (Südpazifik). Wetter-Position (`RWX.pos`) nutzt jetzt dieselbe Umrechnung.

**Rennrad nur auf Straßen (0.18.1)**
- `gnRG`: `okS` (Kanten für `adjS`, Rennrad) neu: Hauptstraßen alle; Nebenstraßen nur Asphalt/Pflaster, Zufahrten (c 27) nur im Ort (`gnInner` in der Kantenmitte); Radwege (13) nur mit angegebenem Asphalt/Pflaster/Beton/befestigt; Feld-/Waldwege (10) nur mit angegebenem Asphalt; geschätzte Beläge (`inf`, ways.bin Flag 32) nie; Treppen nie. Rausgefallen: ca. 43 km Betonplatten-Feldwege, 27 km „befestigt“ geschätzt, 66 km Zufahrten außerorts. Alter Stand: `window.OLD_ROADADJ`.
- Test `tests/tadj.js` (km je Kantenart in `adjS`, `OLD=1`; schreibt zusätzlich Treppen mit Anbindung nach `SOUT`). Läuft in ca. 1 min, braucht keinen Fahrtstart.
- Nicht geändert: Hochwald-Schotterstück (0.9.10, Teil einer Hauptstraßenkante), Nebenstraßen ohne Belagsangabe zählen weiter als Asphalt (side2.bin hat kein „geschätzt“-Flag, Generator nicht im Repo).
- Gut erreichbare Treppen (Hicore genannt): Jonsdorf Auf der Heide 9 Stufen, Oybin Kammstraße ca. 10, Friedrich-Engels-Str. (S 133) 6 Felsstufen, Waltersdorf Hauptstraße 25, Kammstraße bei Hölle 3. Hochwald (80) und Lausche (58) sind Sackgassen ohne Hinweis.

**Offen / unsicher**
- 0.13.0 am iPad prüfen: Ladezeit-Meldung, Ruckler beim ersten Auto/Zug/Regen, FPS-Anzeige mit Prozent (Details 0.13.0 in docs/ARCHIV.md).
- 0.16.0 am iPad prüfen: Optik Gravel/MTB, Sitzhaltung, ob Farben direkt nach dem Radwechsel stimmen; Lenkerbreite/Flare/Hoods-Winkel ggf. in `GRAVEL_BAR` nachjustieren.
- 0.14.0 am iPad prüfen: Wege-Optik (Helligkeit, Grasnarbe, Waldboden), FPS mit den zusätzlichen Wegen.
- 0.18.0 am iPad prüfen: Treppen-Animation (Absteigen, Schultern, Drübertragen, MTB runter), Tempo auf Treppen, ob Stufen im Gelände versinken/schweben, FPS. FIT-Datei bei Strava auf den echten Straßen?
- 0.18.1 am iPad prüfen: Rennrad zeigt keine Feld-/Waldwege mehr, fehlt keine echte Straße?
- 0.17.3 am iPad prüfen: Feldwege frei, Äcker-Optik, FPS am Feld, Wackel-Phasen.
- 0.17.1 am iPad prüfen: Stärke des Wackelns (Gravel/MTB), Pfützen-Optik und Ausweichen, Matschbrocken sichtbar genug, Rutscher nicht zu oft; FPS mit dem neuen Wege-Shader. Pfützen starten bei Spielbeginn leer, auch wenn es schon lange regnet (echtes Wetter: Regen der letzten Stunden noch nicht ausgewertet).
- 0.17.2 am iPad prüfen: Bäume in Jonsdorf (Dichte, Größe, Laub/Nadel-Verteilung), Waldränder an den 10-m-Maskenkanten, FPS. Falls gut: weitere Orte (ganzes Gebirge kostet nur Rechenzeit).
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
1a. DOP-Bäume weitere Orte erst nach Hicores Urteil am iPad (0.17.2).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
4. Leistung Teil 2 nur bei Bedarf: Modelle nach Bedarf laden, Wald-Instanzen bündeln (Rad-Verschmelzen ist seit 0.16.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. Treppen: erledigt in 0.18.0. Mögliche Verfeinerung: echte Zwischenpodeste, Treppen-Zählung aus Luftbild, Mitspieler tragen sichtbar.
7. Accounts (Supabase Auth mit Google), Easter Eggs, später Abo.
