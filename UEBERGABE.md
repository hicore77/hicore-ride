# Hicore Ride: Übergabe (aktueller Stand)

Stand: 28.11.2026 (Nacht). Letzte veröffentlichte Version: **0.28.0 Beta** (Texturatlas/Bündeln: OSM-Objekte, Schmetterlinge, Schilder, Ampeln, Wegbrücken; gleiches Aussehen, 22–42 % weniger Zeichenaufrufe). Davor 0.27.0 (Olbersdorfer See, OSM-Objekte), 0.26.1 (Dolomiten-Fahrfehler, Seen flach).
Diese Datei ist bewusst kurz und enthält nur, was ein neuer Thread zum Weiterarbeiten braucht.
Alles Ältere (Entscheidungsgeschichte, frühere Versionen, Hardware-Details, Asset-Herkunft) steht in **`docs/ARCHIV.md`**. Nur bei Bedarf gezielt darin suchen (`grep`), nicht ganz lesen.

**Arbeitsweise seit 24.11.:** Ein Thread pro Schritt bzw. Version. Am Ende jeder Version diese Datei aktualisieren: Stand, Versionsnotizen (nur die letzten 3, ältere nach `docs/ARCHIV.md` verschieben), nächster Schritt. Ziel: höchstens ca. 200 Zeilen.

---

## 1. Worum es geht

- Zwift-ähnliches Indoor-Radspiel im Browser. Three.js r187 mit WebGPU (Rückfall WebGL 2), eine große HTML-Datei plus Datenpakete, Bluetooth über Web Bluetooth.
- Hauptwelt **Zittauer Gebirge**: echtes OSM-Straßennetz (ca. 180 km), echte Höhen, Kreuzungen, Kreisel, Verkehr, Bahn, Wahrzeichen, Wetter. Weitere Welten: Sonneninsel, Elbsandstein. Hügelland und Alpenpass sind seit 0.24.5 ausgeblendet (Hicore 26.11.), Code bleibt.
- Zielgruppe: Hicore selbst und Freunde (Multiplayer über Supabase Realtime). Später eventuell öffentlich, Abo-Idee nicht entschieden.
- Bleibt im Browser (Entscheidung 19.11.). Keine Markenlogos, keine Google-/Esri-Bilder, kein Nachbau fremder Spiele.
- Hauptgerät: **iPad Air M1**, Bluetooth nur in der App **Bluefy**. Watt/Kadenz über Stages-Powermeter, Puls über Wahoo TICKR X. Elite Drivo (Name „DR“, Firmware 026) hat kein FTMS, liefert echte Watt/Kadenz über Cycling Power (seit 0.25.1 in Bluefy verbindbar); Steigung steuert seit 0.25.3 den Widerstand über Elites Kanal (kein ERG).

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
- Nie automatisch nachkaufen. Higgsfield (seit 27.11. Ultra, 3.000 Credits/Monat): bis 100 Credits je Aufgabe ohne Rückfrage, danach immer Verbrauch und Restguthaben nennen; darüber erst Kosten nennen und fragen. Stand 27.11. abends: 2.931 Credits.
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
| **0.28.0** | **Texturatlas und Bündeln: OSM-Objekte je Zelle als ein BatchedMesh mit Atlas, Schmetterlinge 1 statt ca. 64 Zeichenaufrufe, Schilder-Atlas je Kachel, Ampeln zusammengefasst, Wegbrücken in 4-km-Zellen** |
| 0.27.0 | Zittau: Objekte aus OSM an echten Stellen (Bänke, Wegweiser, Tafeln, Hütten, Hochsitze, Parkplätze, Camping, Strände, Sportplätze), Olbersdorfer See mit Schaufelrad, Muschel, Badegästen; Zufalls-Deko entfernt |
| 0.26.1 | Dolomiten: Gelände nie mehr auf der Fahrbahn, Kehren rund, Bach in 3D mit Mäander und Durchlass, Einfahrten sauber, Buckel, Pedal innen oben; Zittau: alle Seen flach (Olbersdorfer See) |

**Kacheln/Rand (0.17.0):** Details (Datenquellen, `rand_auffuellen.py`, `kacheln.py`, `KC`/`kcTick`/`kcReady`, Felsen, Zäune, Wanderer `HIKE`, Tests `tkc`/`thike`) jetzt in `docs/ARCHIV.md`.

**Fahrgefühl auf Wegen (0.17.1):** Details (`WF`, `wayFeelStep`, Pfützen `WET.p`, Matsch, Test `twet`) jetzt in `docs/ARCHIV.md`.

**Echte Bäume aus Luftbild (0.17.2):** Details (Quellen, Kette `werkzeuge/chm_ausschnitt|dop_holen|dop_baeume|dop_einfuegen`, `gnDopW`, `NO_DOPT`, Test `tdop`) jetzt in `docs/ARCHIV.md`. Nächste Ausschnitte: gleiche Kette mit anderer bbox.

**Hotfix 0.17.3:** Details (Nahgras/Acker auf Wegen, `gfCell`, `NO_GFWAY`, Test `tgf`) jetzt in `docs/ARCHIV.md`.

**Treppen 0.18.0, Rennrad nur auf Straßen 0.18.1, echte Bäume/Wald/Äcker 0.19.0:** Details (`stairInit`, `STAIR`, `tstair`, `okS`, `dop_gebiet.py`, `dop_maske.png`, `NO_DOPT`) jetzt in `docs/ARCHIV.md`. Gut erreichbare Treppen: Jonsdorf Auf der Heide 9 Stufen (Weg-ID 41396618), Oybin Kammstraße (1209305178).

**Tschechien (0.19.1), Hotfix Zaun/Arm (0.19.2):** Details (ČÚZK-Orthofoto, `dop_gebiet.py ergaenzen cz`, `tstairfit`, `propOnWay`, `tprobe`, `tcarry`) jetzt in `docs/ARCHIV.md`. Achtung: Weg-ID 41396618 liegt in Jonsdorf, die Oybiner Treppe ist 1209305178.

**Schultern 0.19.3–0.19.8, Gabeln 0.19.5:** Details (`carryGripPar`, `carryBody`, `carryRig`, `taperLeg`, `forkStep`, Tests `tcarry`/`tdismount`/`tbike`, Schalter `OLD_CARRY*`, `OLD_DISMOUNT`, `OLD_GRAVELFORK`, `NO_FORKMOVE`) jetzt in `docs/ARCHIV.md`.

**Leistung 0.20.0–0.21.0** (Details 0.20.0–0.20.2 in `docs/ARCHIV.md`): Kachelwald gebündelt (`GT.w`, `OLD_GTW`), Baumschatten nur nah (`OLD_TREESH`), HUD sparsam (`OLD_HUD`), Leistungstest per Tipp auf FPS-Anzeige (`LTEST`), Messung `tests/tgpuperf.js`. iPad-Lesart: Chrome hängt an Pixeln, Bluefy an den Bäumen.
**Drivo 0.25.1–0.25.5:** Details (Bluefy-optionalServices als Text, Elite-Widerstand `[0x01, g*10+10]` auf 347b0010, Kadenz aus 0015 Byte 3, `bt-test.html`, Schalter `OLD_BTOPT`, `NO_ELITESLOPE`, `OLD_ELICAD`) jetzt in `docs/ARCHIV.md`.

**0.28.0 Texturatlas und Bündeln** (Heiko 27.11.: Atlas dort, wo er Ruckeln oder Speicher spart; Vorbereitung für Blätter-Nahdetail)
- Messwerkzeug `tests/tatlas.js`: zählt Zeichenaufrufe je Gruppe über einen Haken in `renderer._renderObjectDirect`, CPU-Zeit von render, geschätzten Texturspeicher. `W=zittau|dolo`, `CAM='[x,z,h,lx,lz]'` oder `CAMJS`, `DEEP=<Gruppenanfang>` für Feinaufschlüsselung, `PRE` für Schalter, `EXTRA` für eigene Abfragen. Läuft mit `?gl=1` (WebGPU über SwiftShader verlor bei Zittau das Gerät). `renderer.info.render.drawCalls` ist unzuverlässig (zählt Nachbearbeitung mit), Hakenwert nehmen.
- Befund vorher: am See 311 Zeichenaufrufe, davon 96 Ampeln (8 Meshes je Ampel, bis ins Zentrum im Bild), ca. 50 OSM-Objekte (je Modell und Zelle ein InstancedMesh), 21 Wegbrücken. Überall ca. 64 für 16 Schmetterlinge (2 Flügel + Körper, zweiseitig-transparent = doppelt gezeichnet). Häuser sind schon je Kachel und Material gebündelt (4 je Kachel, Wand-Atlas gibt es seit früher), Dolomiten-Tiere nur ca. 8 Aufrufe an einer Herde (Skelett je Tier, Bündeln lohnt nicht).
- `ZA`/`zaGeo`/`zaBatch` (vor `zoBuild`): feste OSM-Objekte je Ebene und Zelle als `THREE.BatchedMesh`; Seemodelle teilen den Atlas 2048² (16 Felder à 512, wird erst mit dem ersten Seemodell angelegt), einfarbige Bank/Schild/Stein ein Material ohne Textur. Schwimmer bleiben Instanzen. Alt `OLD_ZOATLAS`.
- `buildFauna`: Flügel-Atlas, alle Falter ein BatchedMesh, alphaTest statt Transparenz. Alt `OLD_BFATLAS`. `signMerge` (aus `gtFinishStep`): Schilder einer Kachel in einem Atlas (Regalpackung 1024 breit), Pfosten je Farbe. Alt `OLD_SIGNATLAS`. `zgSignals`: Ampeln je Material ein Mesh (Lampen schalten weiter über `SIGS.ph`). Alt `OLD_SIGMERGE`. Wegbrücken 4-km-Zellen, alt `OLD_WBMERGE`.
- Messung (Cloud, WebGL/SwiftShader, Stufe Mittel; CPU-Zeiten nur als Verhältnis brauchbar): See 311 → 179 Zeichenaufrufe, CPU render 9,8 → 8,2 ms; Jonsdorf-Start 544 → 426, 14,1 → 12,7 ms; Cortina-Start 189 → 116, 7,2 → 6,4 ms. Texturen (Schätzung aller Szenentexturen): See +7 MB (Atlas, dafür Einzeltexturen nicht mehr hochgeladen), Jonsdorf +3 MB (Schilder), Cortina +0,6 MB. Bilder vorschau/280_* (Wegweiser vorher/nachher gleich). Am iPad ungeprüft: FPS/CPU, BatchedMesh in Bluefy-WebGPU (falls Fehler: Schalter oben).
- Weitere Kandidaten, nicht gemacht: Haus-Dachtexturen kacheln (Atlas bräuchte Shader-Umbruch, ca. 2 Aufrufe je Kachel Ersparnis), Fahrer/Rad (ca. 20 Aufrufe nah), Schmalspurbahn-Abschnitte (bis 32 am See), Wolken-Sprites (25).

**0.27.0 Zittau originalgetreu: OSM-Objekte, Olbersdorfer See** (Heiko 27.11. 21:52–21:58, Sprachnachrichten)
- Daten: `quelle/werkzeuge/osm_objekte.py` (Sandbox, `holen` per Overpass mit User-Agent, `packen`) → `quelle/zg2/osm_obj.json` (p = Punkte je Art [x,z,dir,name], a = Flächen [art,[x,z..],name,surface,parking], l = Linien). build_gpu hängt sie als `window.ZGOBJ` an `data/zittau.js`. 9.245 Punkte (u. a. 1.452 Bänke, 697 Wegweiser, 411 Tafeln, 212 Schutzhütten, 164 Hochsitze), 824 Parkplätze, 37 Strände, 9 Campingplätze, Sportplätze.
- Spiel (Block „0.27.0“ nach `buildZgLakes`): `ZO`, `zoInit` (250-m-Zellen, `window.ZGOBJN`), `zoStep` (baut alle 0,4 s höchstens eine Zelle um `_camFix`/Kamera; Ebenen dec 1.600 m, obj 400, big 560, bath 330 m, × 0,5 Minimal / 0,7 Niedrig / 1,25 Hoch). Bank → Instanz `bank` zum Weg gedreht, Wegweiser `schild_holz`, Stein `fels_1`, Rest aus Einfachgeometrie (`zoPart`, ein Material mit Eckfarben). Flächen als Decals über `gtMeshH` (`zoDecal`, Sand/Asphalt/Kies, `ZO.wcut` schneidet Sand > 55 m vom Wasser ab, Grasstrände ohne Sand). Gras wird auf Sand/Parkplatz/Sportplatz unterdrückt (`zoBare`).
- Zufällige Deko in Zittau aus (Bänke, Schilder, Steine, Heuballen, Blumen, Zäune aus `addProps`), alt `OLD_ZGPROPS`. Bäume kamen schon aus dem Luftbild.
- See: Schaufelrad und Muschel an den OSM-Punkten (Higgsfield `zs_schaufelrad`, `zs_muschel`), OSM-Schutzhütte an der Muschel ausgelassen (`ZO.skip`), Volleyballnetze als Maschen mit Spielern, Parkplätze mit Autos (am See 55 % belegt), SeeCamping mit Wohnwagen/Wohnmobilen/Zelten (50 %) und Leuten, Strand mit bis 42 Badegästen, Schirmen, 11 Schwimmern (kreisen/wippen), Stehenden im Wasser; Naturstrand/FKK-Bereich gegenüber mit liegenden/sitzenden Figuren. Badegäste nur ohne Regen/Schnee/Nacht. Abschaltbar: Einstellungen → Welten → `zgBad`.
- Higgsfield-Modelle `quelle/props/zs_*.glb` (12 Stück, `PROP_FIX`, nur bei Bedarf geladen). Unbekleidete Figuren (oben ohne, FKK) hat Higgsfield als nsfw abgelehnt, deshalb nur bekleidete Badegäste. 174 Credits verbraucht, Rest 2.697.
- Test `tests/tzo.js` (V-Kameras, wartet auf Kacheln und ZO-Zellen). Bilder vorschau/270_*.jpg. Nicht geprüft: FPS am iPad am See, Ausrichtung einzelner Figuren, Wirkung abseits des Sees.

**0.26.1 Dolomiten-Fahrfehler, Zittauer Seen, Bach** (Heiko 27.11. abends mit Screenshots; Nachtarbeit)
- Gelände auf der Straße (große hellgrüne, kantige Flächen, Kehren): Ursache war das 10-m-Kachelnetz. Zwischen zwei Eckpunkten wird linear gemittelt; ein Eckpunkt am Hang oder an der anderen Seite einer Kehre hob das Dreieck bis 9,6 m über die Fahrbahn, obwohl `terrainH` auf der Straße stimmte. Jetzt `gnCap`: jeder Eckpunkt (Kachelbau und `gtMeshH`) wird gegen alle Straßenstücke im Umkreis von 16 m gedeckelt (0,35 m unter der Fahrbahn, 5 % bis 6 m, dann 16 %). Automatische Prüfung (`EV` mit `gtMeshH` alle 4 m an 6 Querpunkten der Runde, 94.200 Punkte): vorher 251 Treffer, jetzt 0 (schlechtester Wert 0,18 m unter der Fahrbahn). Panorama und Grobnetz waren es nicht (ebenfalls geprüft, 0 Treffer). Alt `OLD_GTCAP`.
- Kehren rund: Dolomiten haben jetzt 9000 statt 3000 Fahrlinienpunkte (`N` ist `let`, in `buildWorld` gesetzt; `gRoute` mit 13 statt 7,5 Punkten je Radiant). Alt `OLD_RTN`.
- Pedal: beim Rollen (Kadenz < 3, > 4 m/s) vor und in Kurven geht das kurveninnere Pedal nach oben (`me.turnAhead`, Kurswinkel über max(14 m, 1,8 s)). Aus `NO_COASTPEDAL`.
- Zittau, Olbersdorfer See „blauer Hügel“: Seen waren dort nur blau gefärbtes Gelände (Landbedeckung Klasse 5), das dem Höhenmodell folgte (im See bis 68 m Höhenunterschied). Jetzt `zwInit`/`zwH`/`buildZgLakes`: jede Wasserfläche ab 6 Zellen bekommt einen Spiegel (15-%-Wert der Uferhöhen minus 0,25 m; lange Flüsse örtlich, bisher keiner erkannt), Gelände darunter als Mulde, flache Ufer leicht angehoben, eigenes Wasser-Netz (`waterMaterial`), nie über Land oder Straße. 81 Seen, Prüfung `EV`: Straßen der Runde und aller Kanten nie unter dem Spiegel. Andere Welten: Teiche (`ponds`) sind schon flach und liegen unter dem Ufer, Dolomiten-Seen flach auf tiefster Uferhöhe. Alt `OLD_ZGLAKE`.
- Bach (`buildDoloWater3`, Ufer längs geglättet, alt `OLD_BANKSM`): Mäander und wechselnde Breite (`dlMeander`), eigene feine Rinne mit Ufern, Sohle und tiefer liegendem 3D-Wasser mit Wellen, Glanz und Schaum (`dlWaterMat3`); das Kachelgelände wird im Umkreis von ca. 230 m um die Kamera entlang des Bachs ausgeblendet (Maske `DLH`, 0,5 m je Pixel, `dlHoleStep`). An Straßen endet der Bach in einem Durchlass (Stirnmauer mit Rohr, `dlCulverts`). Alt `OLD_DLBACH`, nur ohne Ausblenden `NO_DLHOLE`.
- Einfahrten: Enden von Nebenwegen an der Hauptstraße werden entlang der Seitenlinie auf den Fahrbahnrand geschnitten (keine Pfeilspitzen mehr). Alt `OLD_SIDEEND`.
- Buckel: kleine Hügel 15–60 m, bis ca. ±1,5 m auf Wiesen/Almen (`dlBump`, ab 10 m neben der Straße, schwach in Orten/Fels, nicht im Bachbett). Aus `NO_DLBUMP`.
- Felsstreifen: schärfere Dreifach-Projektion und verbogene Höhenproben, damit die Wände nicht wie Höhenlinien wirken. Alt `OLD_ROCKSTRIPE`. Panorama nahe der Straße abgesenkt (`OLD_PANOLOW`, wirkungslos für den Straßenfehler, aber unschädlich).
- Prüfung abgekürzt (Heikos Wunsch): Bilder 640×360, `NF=12`, Zahlenprüfungen per `EV` statt Bilder; `tdolo.js` hat `XB` (Bachquerungen) und `XH` (Kehren). Higgsfield: nichts verbraucht.

**0.26.0 Tiere in den Dolomiten:** Details (`buildDoloFauna`, `dlFaunaStep`, `DLF`, Yeti, Töne `dl_*`, `NO_DLFAUNA`) jetzt in `docs/ARCHIV.md`.

**0.25.0–0.25.9 Dolomiten (Daten, Höhenmodell TINITALY, Fels, Himmel, Bäche, Häuser, Wegkreuze, Felsbrocken):** Details jetzt in `docs/ARCHIV.md` (Werkzeugkette `dolo_bau.py` → `dolo_terrassen.py` → `dolo_detail.py` → `build_gpu.py`, Test `tdolo.js` mit `V`, `EV`, `EVB`, `EVN`, `NEAR`, `WAT2`, `SHR`).

**Bluefy-Anmeldung 0.24.2:** Details (`ACC.blu`, `ACC.handStart`, Kanal `hl:CODE`, `ACC.give`, Test `thlogin`) jetzt in `docs/ARCHIV.md`.


**0.23.1 Restpunkte, 0.23.2 Autoräder:** Details (`twend`, `OLD_STAIRFLOAT`, Dachschnee `SNOWCAP`, `saveSheet`, `steerStep2`, `OLD_WHEELS`, `OLD_CARSTEER`) jetzt in `docs/ARCHIV.md`.

**Handy-Fernbedienung 0.23.0:** Details (Seite `quelle/handy/`, Kanal `hc:CODE`, `CMP`, `NO_CMP`, Test `thandy` mit `fake_supabase.js`) jetzt in `docs/ARCHIV.md`. Online: https://hicore77.github.io/hicore-ride/webgpu-spiel/handy/

**Tiere und Autos 0.22.0:** Details (`ANIM_CFG`, Gangarten, `deerStep`, `blinkStep`, `wheelGeo`, `gtFinishStep`, Test `tanim`) jetzt in `docs/ARCHIV.md`.

- 0.21.0 Impostors (`IMP`, `impR` 60 m, `OLD_IMP`), Ruckler-Messung `tstutter2`, `upR`/`OLD_UPR`: Details in `docs/ARCHIV.md`. Poly Haven ist Standard.

**Offen / unsicher**
- 0.25.5 am iPad prüfen: Kadenz mit Drivo plausibel, geht beim Aufhören auf 0.
- 0.25.3 am iPad prüfen (Heiko 26.11.: „hat funktioniert“): Widerstand folgt der Steigung (Kammstraße, Lausche), Schwierigkeit-Regler wirkt, keine Aussetzer; Gefälle nur bis −1 % möglich.
- 0.25.1 am iPad prüfen: Trainersuche findet „DR“ (Stufe 1 Name), Watt/Kadenz im Spiel plausibel gegenüber Stages? Puls- und Stages-Suche weiter ok?
- 0.25.0 am iPad prüfen: Ladezeit Dolomiten, FPS mit Panorama (LITE/MINI kleiner), Felsfarbe, Steigungen Giau/Falzarego.
- 0.13.0 am iPad prüfen: Ladezeit-Meldung, Ruckler beim ersten Auto/Zug/Regen, FPS-Anzeige mit Prozent (Details 0.13.0 in docs/ARCHIV.md).
- 0.16.0 am iPad prüfen: Optik Gravel/MTB, Sitzhaltung, ob Farben direkt nach dem Radwechsel stimmen; Lenkerbreite/Flare/Hoods-Winkel ggf. in `GRAVEL_BAR` nachjustieren.
- 0.14.0 am iPad prüfen: Wege-Optik (Helligkeit, Grasnarbe, Waldboden), FPS mit den zusätzlichen Wegen.
- 0.18.0 am iPad prüfen: Treppen-Animation (Absteigen, Schultern, Drübertragen, MTB runter), Tempo auf Treppen, ob Stufen im Gelände versinken/schweben, FPS. FIT-Datei bei Strava auf den echten Straßen?
- 0.18.1 am iPad prüfen: Rennrad zeigt keine Feld-/Waldwege mehr, fehlt keine echte Straße?
- 0.17.3 am iPad prüfen: Feldwege frei, Äcker-Optik, FPS am Feld, Wackel-Phasen.
- 0.17.1 am iPad prüfen: Stärke des Wackelns (Gravel/MTB), Pfützen-Optik und Ausweichen, Matschbrocken sichtbar genug, Rutscher nicht zu oft; FPS mit dem neuen Wege-Shader. Pfützen starten bei Spielbeginn leer, auch wenn es schon lange regnet (echtes Wetter: Regen der letzten Stunden noch nicht ausgewertet).
- 0.19.0 am iPad prüfen: FPS mit Bäumen überall (v. a. Orte mit vielen Gartenbäumen, Felder), Ladezeit Kacheln, Sträucher, Acker-Farben, Waldwege dichter, Treppe Oybin Kammstraße (Zaun weg? Stufen sichtbar?), Schulter-Arm. Treppen über flachem Gelände: Stufen höchstens 40 cm Abweichung, deshalb teils halb im Boden; ggf. Gelände an Treppen anpassen.
- 0.17.0 am iPad prüfen: Ladezeit beim Start (Kacheln), Nachladen ohne Ruckler, Felswände (Jonsdorf/Oybin-Umgebung), Ränder Ost (Neiße) und Süd (Tschechien), Wanderer.
- 0.16.1 am iPad prüfen: Vorauswahl in Orten (Spitzkunnersdorf), ob dezente Abzweig-Hinweise reichen, Ruckler beim automatischen Neuberechnen, Optik der Einmündungen.
- Idee (Hicore 24.11.): Abbiegen über die Schaltgriffe der elektronischen Schaltung (links/rechts) wählen.
- 0.15.0 am iPad prüfen: Fahrgefühl Gravel/MTB, Ladezeit (+0,7 s), Wurzeln/Brücken.
- 0.24.5 am iPad prüfen: Sonneninsel Querwege links/rechts wählbar, nur noch 3 Welten in der Auswahl.
- 0.24.4 am iPad prüfen: Zäune quer über Straßen/Bahn weg? Fehlen jetzt sichtbar Zäune? Gras auf Pflaster weg, Handy-Pfeile bleiben stehen, Trikots.
- Konten bestätigt (Hicore 26.11., 19:47, Bluefy): Passwort-Login, Profil, Fahrt mit FIT und Bestzeit im Konto. Noch nicht real getestet: QR-Übergabe vom Handy, FIT-Download aus dem Konto in Bluefy.
- 0.23.2 am iPad prüfen: Räder im Radkasten, Einlenken beim Überholen und in Kurven, Kreisel-Gegenverkehr.
- 0.23.1 am iPad prüfen: Speichern in Bluefy (Teilen-Knopf, sonst „An Handy senden“), Dachschnee bei „viel“, Knirschen, Treppen/Wegenden. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

000. 0.28.0 am iPad: FPS/CPU-Anzeige auf Mittel am See und in Jonsdorf mit 0.27.0-Werten vergleichen (vorher 8,8–10 ms am See), Strand/Camping/Schilder/Ampeln unverändert? Danach Blätter-Nahdetail.
00. Zittau 0.27.0: Heikos iPad-Urteil (FPS am See auf Mittel, Strand/Camping/Parkplätze, fehlt etwas?). Danach nächster Schritt laut Gedächtnis: Texturatlas, dann Blätter-Nahdetail. Weitere Originaltreue Zittau: Baumarten/Sträucher, Zäune aus OSM (barrier=fence), Spielgeräte genauer.
0. Dolomiten: Heikos iPad-Urteil zu 0.26.1 abwarten (FPS auf Mittel mit neuem Bach und 9000 Fahrlinienpunkten, Kehren rund genug, noch Gelände auf der Straße an Nebenstraßen?, Bach-Optik, Pedal in Kurven; Zittau: Olbersdorfer See). Dann Texturatlas-Version (Tiere, Kleinobjekte, Fassaden, mit Messung) und Blatt-/Baumbilder aus Higgsfield prüfen. Aus 0.26.0 weiter offen: FPS mit Tieren, Tiere zu klein/groß, Flucht, Glocken-Lautstärke). Offene Tier-Ideen: Kühe mit Glocken auch in Zittau, Kleinobjekte (Heuharfen, Wegweiser Wanderwege, Bänke an Aussichtspunkten), Alpendohlen. Danach 0.25.6–0.25.8-Punkte (FPS auf Mittel, Himmel, Gras, Wald nahe der Straße echt oder Kegel?). Dann weiter Nahdetail nach Entfernung (Blätter/Rinde/Gras/Fassaden: nah Struktur, ab 20–30 m schlicht, weiche Übergänge), Licht/Atmosphäre, Wolken weniger gemalt, Wasser aus der Nähe prüfen; für alle Welten Texturen/Bewuchs gegen freie Alternativen prüfen (vorher/nachher messen). Kapellen; Lärche/Zirbe/Latschen, Alpenblumen; Bäche Boite/Cordevole/Codalonga türkis mit Rauschen; Gipfelnamen.

1. Hicores Rückmeldung zu 0.13.0 und 0.14.0 (iPad).
1a. 0.19.8 am iPad prüfen: Absteigen/Aufsteigen über den Sattel natürlich? Schultern Gravel (0.19.7) hat Hicore bestätigt. Gabeln 0.19.5 (Gravel starr, MTB federt genug/zu viel?), Treppe Oybin Kammstraße frei (0.19.2). Aus 0.19.1 noch offen: Tschechien-Bäume (FPS, Optik südlich der Lausche), Treppen (Böschung/Erdrampe).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
1e. 0.23.0 testen: Spiel am iPad, 📱 oben rechts, QR mit dem Handy scannen; Abbiegen per Pfeil, Wenden, Gesten, Werte am Handy. Danach Ideen: „Ride On“, Karte am Handy, Lenker-Knöpfe.
1d. 0.22.0 am iPad prüfen: Hirsch/Reh (Kammstraße Oybin–Lückendorf) laufen/galoppieren natürlich? Weidetiere, Autos beim Überholen (Lenken, Wanken, Blinker), Räder rund, Ruckler beim Nachladen weniger? FPS unverändert?
1c. 0.21.0 am iPad prüfen (Hicore 25.11.: läuft wesentlich flüssiger) (Chrome und Bluefy): FPS am Waldrand/im Wald, fällt der Wechsel 3D ↔ Bild auf (ca. 50–60 m), Bäume von oben/Berg, Ruckler noch da? Falls Übergang sichtbar: `impR` größer, Atlas 256 → 384 px.
1b. 0.20.0 am iPad prüfen (Chrome und Bluefy): FPS-Anzeige ablesen (FPS, „max 30“, Prozent, CPU ms) an Start, im Ort, im Wald; Bäume/Wald unverändert? Stromsparmodus aus. Je nach CPU-Wert nächster Schritt: CPU hoch → weitere Zeichenaufrufe bündeln (Fahrer, Deko, Häuser); CPU niedrig → Grafiklast (Blattkarten-Bäume, Schatten, Nachbearbeitung).
4. Leistung Teil 3 nur bei Bedarf: Modelle nach Bedarf laden (Rad-Verschmelzen seit 0.16.0, Wald-Bündeln seit 0.20.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. Treppen: erledigt in 0.18.0. Mögliche Verfeinerung: echte Zwischenpodeste, Treppen-Zählung aus Luftbild, Mitspieler tragen sichtbar.
7. Konten erledigt (0.24.0). Mögliche Folgen: Bestenliste je Bergwertung unter Freunden (Leserecht `segment_bests` für angemeldete), FTP für Trainingszonen/W/kg nutzen, Easter Eggs, später Abo.
