# Hicore Ride: Übergabe (aktueller Stand)

Stand: 24.11.2026. Letzte veröffentlichte Version: **0.16.1 Beta** (Abbiegen: Hauptstraße vorgewählt, weniger Hinweise, Wege-Einmündungen angeschlossen).
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
| 0.15.0 | Wegenetz befahrbar + Radwahl (siehe unten): Straßen, Nebenstraßen und Wege ein Netz, Abbiegen überall, Rollwiderstand je Rad/Untergrund, Wurzelstellen, Wegbrücken |
| 0.16.0 | Gravel- und MTB-Modell (siehe unten): eigene Räder mit Geometrie, Lenker, Reifen, Farben, Taschen; Sitzhaltung und Griffe je Rad; statische Radteile verschmolzen (weniger Zeichenaufrufe) |
| **0.16.1** | **Abbiegen: natürliche Weiterfahrt vorgewählt** (siehe unten), Abzweige in Nebenwege dezent und erst kurz vorher, Einmündungen von Wegen/Nebenstraßen optisch bis an die Fahrbahn |

**Abbiegen und Einmündungen (0.16.1)**
- Vorauswahl an Kreuzungen (`gNetStep`): abseits der Hauptrunde ist die **natürliche Weiterfahrt** vorgewählt, `gNatural(D,arr,opts)`: Punktzahl = |Winkel|/30 + 1,5·`gRank` − 3 gleicher Straßenname − 2 gleiche ref (Wege: −3 gleiche OSM-Id), Kehrtwenden nie. `gRank`: Straßen OSM-Klasse 0–4, Nebenstraßen 4,5–6, Wirtschafts-/Radwege 6,5, Pfade 7,5, Fußwege 8. Wer nichts drückt, folgt der Hauptstraße; der Rückweg zur Runde wird an jeder Kreuzung neu berechnet (`gTurn`, ca. 5–70 ms in der Cloud). Auf der Hauptrunde (Ankunft und Plan beide Rundenkanten, `gMainSet`) und am Kreisel bleibt der Plan (Bergwertungen, Kreisellogik). Aus: `window.NO_NATURAL`.
- Hinweisflut: sind alle Alternativen niedrigere Klasse (`p.minor`), erscheint der Hinweis erst ab ca. 70 m, kleiner und halbtransparent („Abzweig in …“, CSS `#junc.jmin`). Kein Toast, wenn man der natürlichen Weiterfahrt folgt. Test `tests/tnat.js` (abbiegen, dann ohne Eingriff fahren; `NONAT=1` zum Vergleich): Rennrad 25 statt 37 volle Hinweise auf 76 km.
- Nebenwege-Textur: zweite, gedrehte Atlas-Abtastung mit anderem Maßstab nach Welt-Rauschen eingemischt, dazu prozedurale Helligkeitsflecken, auf Asphalt/Beton Flickstellen, feine Risse, dunklere Fahrspuren (Shader-Zweig `fx.ways`). Aus: `window.NO_WAYVAR`.
- Wiegetritt am Berg (`animRider`, auch Bots, die jetzt ihre Watt übergeben): ab 12 % (Hysterese 10,5 %) oder bergauf (> 5 %) mit Kadenz < 58, unter 22 km/h; Phasen 4–9 s stehen, 8–20 s sitzen. Aus: `window.NO_CLIMBSTAND`. Bild: `STAND=1 node tbike.js`.
- Kurvenneigung: `curveLean(r,d,rev)` in `placeRider` (alle Fahrer und Bots): Neigung atan(v²·k/g) (max. ca. 23°), Vorderrad `r.wF.rotation.y` ≈ Radstand·k (max. 7°, langsam mehr), Krümmung über ±12 m, weich nachgeführt. Gabel und Lenker drehen noch nicht mit (statisch verschmolzen). Aus: `window.NO_CURVELEAN`. Test `tests/tlean.js`.
- Rollwiderstand `BIKE_CRR` nachgeschärft (Waldboden ×1,3, schmale Pfade ×1,3/1,6/1,2). Richtwerte bei 200 W, flach, 88 kg:

| Untergrund | Rennrad | Gravel | MTB |
|---|---|---|---|
| Asphalt | 0,004 (34 km/h) | 0,006 (33) | 0,008 (31) |
| Schotter | 0,030 | 0,022 (25) | 0,022 (25) |
| Erde/Feldweg | 0,035 | 0,026 (23) | 0,024 (24) |
| Waldweg (Erde, Wald) | – | 0,034 (21) | 0,031 (22) |
| Wiese | 0,050 | 0,040 (19) | 0,034 (21) |
| Waldpfad | – | 0,054 (15) | 0,037 (19) |
| Fels-Pfad | – | 0,080 (11) | 0,042 (18) |

- Einmündungen: `wayLiftY(x,z,base)` hebt Wege/Nebenstraßen bis 9 m neben einer Straße weich auf Fahrbahnhöhe (Optik in `gtSideMesh` und Fahrlinie in `rgPts`/`gNodeY` gleich), Wegenden enden genau 0,3 m im Fahrbahnrand (`edgePt` in `gtSideIdx`). Auf der Hauptrunde an Weg-Einmündungen kein Graben/keine Leitpfosten (JUNC ±5 m). Aus: `window.NO_WAYLIFT`.

**Radmodelle (0.16.0)**
- Code (alles in `src.html` vor `makeRider`): `BIKE_GEO` (Punkte je Rad, Tretlager immer z=-0.08, Sattel/Hüfte relativ zum Tretlager auf allen Rädern gleich), `BIKE_COLS` (Farben als Tabelle, **spätere Farbauswahl**: Eintrag überschreiben oder `opt.cols[typ]`, dann `setRiderBike`), `buildBike(typ, opt, g, seatUp)` → `buildRoadBike` (Rennrad unverändert, nur ausgelagert) bzw. `buildDirtBike` (Gravel/MTB). Gemeinsame Bausteine: `bikeDrive` (Antrieb, Rennrad 2-fach, sonst 1-fach 40T/32T mit großer Kassette), `dirtWheel`/`tireGeos` (Reifen als Drehkörper, Stollen eingeschmolzen), `bikeDiscs`, `bikeBottle`, `bikeBags`, `bikeDecal`.
- `setRiderBike(r, typ)` tauscht nur die Rad-Gruppe `r.bikeG` (Figur, Trikot, Kurbelwinkel bleiben), ruft `pbrApply` auf (sonst blasse Farben). Aufgerufen vom Menü Fahrrad, `me` startet mit `BIKE`. Mitspieler senden `rb` (Radtyp) und werden mit ihrem Rad gezeigt. Bots bleiben Rennrad.
- Gravel (Hicore): Bronze/Kupfer metallic, schwarze Anbauteile, Skinwall-Reifen 42 mm (hellbraune Flanken), Rahmen höher/kürzer (Lenker 5 cm höher, 5,5 cm näher), Lenker 5 % breiter, Unterlenker 15° Flare, Hoods oben 13° nach innen (`GRAVEL_BAR`, `gravelMap`). Rahmentasche + Oberrohrtasche (dunkelgrau, Zickzack, roter Zipper, „Hicore“), zwei schwarze Flaschen (Unterrohr = Trinkgeste, Sitzrohr).
- MTB: Hardtail mattes Dunkelgrün, orange Federgabel (Krone, Tauchrohre, Brücke), orange Griffringe/Felgen-/Rahmenschrift, 29 x 2,4 Stollenreifen, Flatbar 760 mm mit Backsweep (`MTB_BAR`), Teleskopstütze, eine schwarze Flasche.
- Haltung: `bikeRig(typ)` liefert Hüfthöhe, Oberkörperwinkel (`th` bei low 0/1: Gravel 34°/12°, MTB 43°/33°), Griffe `grips` und Greif-Rahmen `gripf`. Gravel-Griffe werden mit derselben Abbildung wie der Lenker berechnet, dadurch greifen Ober-, Hoods- und Unterlenkerhand exakt. MTB: alle drei Griffe = Flatbar, Haltung nur nach Leistung (`rig.flat`). `poseGLB` bekommt `opt.rig`.
- **Vorarbeit 0.17.0 (Treppen):** Rad ist eine eigene Gruppe `r.bikeG` im Fahrer-`g`, Haltung kommt komplett aus `rig` + `poseGLB`-Optionen. Zum Tragen/Schultern: `r.bikeG` relativ zum Fahrer bewegen/drehen und in `poseGLB` eigene Ziele für Hüfte, Füße (Gehen) und Hände (Oberrohr/Lenker) setzen, analog zu Stand (`stop`) und Gesten (`gestTarget`).
- Leistung: `mergeBikeStatic` fasst statische Radteile, Laufräder und Kurbel je Material zusammen (Rennrad 148 → 92 Zeichenaufrufe je Fahrer, Gravel 158 → 67, MTB 147 → 60). Aus: `window.NO_BIKEMERGE`. Radwechsel baut in 50–160 ms neu (nur im Menü spürbar).
- Test: `tests/tbike.js` (Studio-Bilder im Menü ohne Welt, ca. 10 s; `BIKES`, `VIEWS` side/q34/front/top/hands/handsF, `GRIPS` 0/1/2, `STOP=1`, `DRINK=2.2`), `tests/tbikew.js` (in der Welt, Wechsel während der Fahrt).

**Wegenetz und Radwahl (0.15.0)**
- Wege-Daten und Darstellung aus 0.14.0 (ways.bin-Format, Untergrund `sf`, Texturatlas, Kacheln): siehe `docs/ARCHIV.md`, Abschnitt „Stand 0.16.1“.
- `gnData()` (Straßennetz) bleibt unverändert für Optik, Verkehr, Gelände. Fahren/Abbiegen läuft über **`gnRG()`**: gleiche Knoten-/Kantennummern wie gnData, dazu Nebenstraßen (side2.bin, `kind 's'`, c=20+Klasse) und Wege (ways.bin, `kind 'w'`). Straßenkanten werden an Wege-Anbindungen nur im RG geteilt (erstes Stück behält die Nummer, `R.split[k]`, `R.pieceOf`), nie Kreisel, Schleifen, Doppelfahrbahnen. `R.loop` = Hauptrunde in RG-Kanten.
- Aufbau `rgBuildWays` (ca. 0,7 s, Cloud): Anbindung, wo ein Weg die Fahrbahn kreuzt oder darauf liegt (nicht unter Straßen > 3 m über DEM), Wege untereinander über gemeinsame Endpunkte, T-Einmündungen (0,6 m) und Schnittpunkte, Knoten < 0,9 m zusammengelegt. Stand: 30.700 Kanten, 27.000 Knoten, 2.670 km Wege/Nebenstraßen, 98 % mit der Runde verbunden. Aus: `window.NO_WAYNET`.
- Weg-Punkte (`RGE.P`) erst bei Bedarf: Höhe `terrainH+0.08` wie das Wege-Netz, an Straßen 10 m übergeblendet, Brücken gerade zwischen den Enden.
- Radwahl: Menü Welt → Fahrrad, `BIKE` ('road'|'gravel'|'mtb', localStorage `hicoreRide.bike`), `BIKES[...]` (CdA 0,32/0,34/0,37), Modell und Haltung siehe 0.16.0. `gAdj()`: Rennrad = Straßen + asphaltierte/gepflasterte Nebenstraßen + asphaltierte Wirtschafts-/Radwege (`adjS`), Gravel/MTB alles (`adjW`). `window.GADJ='R'` = reines Straßennetz (Tests, Startrunde in `zgApplyStart`).
- Rollwiderstand `BIKE_CRR[sf][rad]` und `gEdgeCrr(E)` (schmale Pfade: Gravel ×1,5, MTB ×0,95), Wurzelstellen `ROOT_CRR` (0,09/0,075/0,028) auf Pfaden/Reitwegen im Wald alle 70–220 m (`R.roots`, `gRootAt`, sichtbar `gtRootMesh`). Wird in der Physik pro Bild über `gEdgeAt(S.dist)` gesetzt (`meP.crr/cda`). Beim Wechsel auf einen Weg kurzer Hinweis mit Wegart und Untergrund.
- Abbiegen: `gPath` mit Binärheap, Nebenstraßen ×1,25 und Wege ×1,6 teurer (Rückweg zur Runde bevorzugt Straßen). Hinweise zeigen bei Wegen „Waldweg · Schotter“ usw. (`gWayName`). Kein Autoverkehr, solange man auf einem Weg/einer Nebenstraße fährt, Autos fahren nie auf Wege. Auf schmalen Wegen fährt man mittig.
- Brücken auf Wegen und Nebenstraßen: `buildWayBridges()` (Holz/Beton, Geländer, je 1-km-Feld ein Netz), Nebenstraßen-Brücken nicht mehr auf dem Gelände.
- Tests: `tnet.js` (Aufbau, Zeit, Verbundenheit), `twjun.js` (NS Knoten, BIKE: Abbiegen an Wege-Kreuzungen, Sprung, Lücke, Kehrtwende, Höhe), `tride.js` (im Spiel abbiegen + Bilder).
- Grenzen: Wege-Wege-Kreuzungen auf verschiedenen Ebenen ohne Brücken-Flag werden verbunden; Rückweg zur Runde nimmt den kürzesten Weg; Startpunkt auf der großen Karte nur auf Straßen; Höhen auf Wegen aus 25-m-DEM (steile Pfade bis ca. 30 %).

**Offen / unsicher**
- 0.13.0 am iPad prüfen: Ladezeit-Meldung, Ruckler beim ersten Auto/Zug/Regen, FPS-Anzeige mit Prozent (Details 0.13.0 in docs/ARCHIV.md).
- 0.16.0 am iPad prüfen: Optik Gravel/MTB, Sitzhaltung, ob Farben direkt nach dem Radwechsel stimmen; Lenkerbreite/Flare/Hoods-Winkel ggf. in `GRAVEL_BAR` nachjustieren.
- 0.14.0 am iPad prüfen: Wege-Optik (Helligkeit, Grasnarbe, Waldboden), FPS mit den zusätzlichen Wegen.
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
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
4. Leistung Teil 2 nur bei Bedarf: Modelle nach Bedarf laden, Wald-Instanzen bündeln (Rad-Verschmelzen ist seit 0.16.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. **Treppen (Hicore 24.11., nach 0.16.0):** OSM `highway=steps` (mit `step_count`) über die Sandbox nachladen (Kosten vorher nennen) und ins Netz. Rennrad nie, Gravel trägt hoch und runter, MTB fährt runter, trägt hoch. Absteigen, bei 2–3 Stufen anheben, sonst schultern (Cyclocross), Schritttempo, oben/unten wieder aufsteigen. **Animation wie im echten Cyclocross** (vorher echte Bewegungsabläufe recherchieren): 2–3 Stufen = Rad an Oberrohr und Lenker greifen, kurz anheben, drübertragen; längere Treppen = absteigen im Lauf, Rad schultern (Oberrohr auf der Schulter, Arm um das Steuerrohr/Lenker), hochlaufen, wieder aufspringen.
7. Accounts (Supabase Auth mit Google), Easter Eggs, später Abo.
