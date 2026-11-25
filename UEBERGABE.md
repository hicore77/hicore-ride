# Hicore Ride: Übergabe (aktueller Stand)

Stand: 25.11.2026. Letzte veröffentlichte Version: **0.22.0 Beta** (Tiere laufen natürlich, Autos lenken/wanken/blinken, runde Räder, weniger Nachlade-Ruckler). Davor 0.21.0 (Impostors: Bäume ab 60 m als Bild, Poly Haven Standard), 0.20.3 (Bildraten-Regler `FPSCTL`).
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
| **0.22.0** | **Tiere laufen mit Skelett (Schritt/Trab/Galopp, Grasen), Autos lenken/wanken/blinken, runde Autoräder, Kachel-Fertigstellung auf 5 Bilder verteilt** |
| 0.21.0 | Impostors: Bäume ab 60 m als Bild (1 Zeichenaufruf), voller Wald; kleinere Pufferuploads gegen Ruckler; Poly Haven Standard |
| 0.20.3 | Bildraten-Regler `FPSCTL`: 50–60 FPS ungebremst, seltene Auflösungswechsel, Probelauf alle 3 min |

**Kacheln/Rand (0.17.0):** Details (Datenquellen, `rand_auffuellen.py`, `kacheln.py`, `KC`/`kcTick`/`kcReady`, Felsen, Zäune, Wanderer `HIKE`, Tests `tkc`/`thike`) jetzt in `docs/ARCHIV.md`.

**Fahrgefühl auf Wegen (0.17.1):** Details (`WF`, `wayFeelStep`, Pfützen `WET.p`, Matsch, Test `twet`) jetzt in `docs/ARCHIV.md`.

**Echte Bäume aus Luftbild (0.17.2):** Details (Quellen, Kette `werkzeuge/chm_ausschnitt|dop_holen|dop_baeume|dop_einfuegen`, `gnDopW`, `NO_DOPT`, Test `tdop`) jetzt in `docs/ARCHIV.md`. Nächste Ausschnitte: gleiche Kette mit anderer bbox.

**Hotfix 0.17.3:** Details (Nahgras/Acker auf Wegen, `gfCell`, `NO_GFWAY`, Test `tgf`) jetzt in `docs/ARCHIV.md`.

**Treppen (0.18.0)**
- Daten: `quelle/zg2/steps.bin` (11 KB, 483 Treppen, 7 km, 193 mit `step_count`), gebaut in der Higgsfield-Sandbox mit `zg2/steps.py` aus Overpass `way["highway"="steps"]` (bbox wie Straßen; overpass-api.de braucht einen User-Agent, sonst 406). Format wie ways.bin, Klasse 15, Byte 6 = Stufenzahl, Flags 1/2 incline bekannt/hoch, 4 Handlauf, 128 Schieberampe. `build_gpu.py` → `window.ZGSTEPS`, im Spiel `stairsData()`.
- Höhe (`stairInit`, seit 0.19.1): Stücke auf der Fahrbahn abgeschnitten (`T.s0/s1`), Richtung aus `incline`, sonst Gelände. Stufen folgen dem Geländeprofil `T.TS` (25 Proben), Trittflächen `T.YT[k]` einzeln (mind. `hmin` ≤ 10 cm, max. 24 cm, Tritt 4 cm über Gelände). Endet die Treppe oben an einer Straße, wird auf Fahrbahnhöhe skaliert. Was übers Gelände ragt, bekommt Seitenwände bis ins Gelände und eine grüne Böschung; oben ohne Straße läuft eine Erdrampe aus (`stairRamp`, Länge `stairRad` 2,5–7 m nach Überstand, gleiches Profil wie `stairBlend` für den Weg). Fahrlinie `stairY` stückweise linear durch die Stufen, `stairTop`/`stairStepY`. Alt: `window.OLD_STAIRFIT`.
- Netz: in `rgBuildWays` als Weg Klasse 15 (`E.st`, `E.stS0/S1`, `E.nv`), Knotenhöhen aus der Treppe, `rgPts` linear, `gRoute` rundet Treppen nicht ab. Rennrad nie (`adjS`), Routing ×6 teurer, `gRank` 9, Name „Treppe · N Stufen“. 3D-Stufen je 500-m-Kachel am Pfad-Netz (`stairsMesh`, Blöcke, Erdstufen mit Holzkante, Handlauf), Bäume halten Abstand (`stairsIdx` → `WAYS_H`).
- Ablauf (`STAIR`, `stairSpans`, `stairStep` in der Hauptschleife nach `curveVmax`): Modus `stairMode`: MTB bergab `ride` (stehend, Kurbel waagrecht, Stöße), bis 3 Stufen `lift` (links neben dem Rad, linke Hand Lenker, rechte Oberrohr, Rad über die Stufen gehoben), sonst `shoulder` (Oberrohr auf der rechten Schulter, rechter Arm um das Steuerrohr an den Lenker, linker Arm schwingt). Zonen 2,2–3,2 m vor/nach den Stufen (Ab-/Aufsteigen, rechtes Bein hinten über den Sattel), davor Bremsen auf 1,7–2,8 m/s, zur Treppe hin in die Wegmitte (`STAIR.lc`). Tempo nach Leistung (bergauf 0,5–1,25 m/s, bergab 0,7–1,3, kurz 1,0–1,4), ohne Treten bleibt man stehen. Trainer bekommt 0 %. Füße treffen die Stufenmitten (`stairCarry`), Figur waagrecht. Pose: `carryBody`, `carryRig` in `poseGLB` (opt.carry), Greifhände über `R._ghF`. Aus: `window.NO_STAIRS`.
- Test `tests/tstair.js` (`BIKE`, `PL`, `NV=min,max`, `UP=1|-1`; ohne `OUT` Logik: Tempo, Zeit, Fußfehler; mit `OUT`, `PTS=-1.6,mid,end`, `SIDE=1|-1|0` Bilder). Ergebnis: 500 Treppenstücke im Netz, keine für das Rennrad; 9 Stufen hoch in 11 s, Füße im Schnitt 5 cm über der Stufe, nie darunter.

**Rennrad nur auf Straßen (0.18.1):** Details (`okS` in `gnRG`, `OLD_ROADADJ`, Test `tadj`) jetzt in `docs/ARCHIV.md`. Gut erreichbare Treppen: Jonsdorf Auf der Heide 9 Stufen (Weg-ID 41396618), Oybin Kammstraße (Weg-ID 1209305178, ohne step_count, im Spiel „10 Stufen“, bei x 98…109, z 1072), Friedrich-Engels-Str. (S 133) 6 Felsstufen, Waltersdorf Hauptstraße 25, Kammstraße bei Hölle 3.

**Echte Bäume, Wald, Äcker überall (0.19.0)**
- Hicore (24.11.): „Jonsdorf überall, jeder Baum, Strauch, Acker an seinem Platz“, Häuser bleiben. Wald tief drin darf ausgedünnt sein, an befahrbaren Wegen nicht.
- Kette neu: `werkzeuge/dop_gebiet.py` (Sandbox, kein Credit-Verbrauch): `chm` (beide CHM-Kacheln 120212122 + 120212123 von S3, Region x −10000…6000, z −14000…8000 als chm.npy), `alle` (88 Kacheln à 2 km mit 100 m Rand, DOP20 RGB+CIR direkt mit 1 m vom WMS, je Kachel ca. 6–15 s, Zeitbudget je Lauf), `packen` → `dop_gebiet.bin` (zlib, 'DOPC') + `dop_maske.png`. Zurück per Graustufen-PNG-Chunks (470 000 Bytes) über `image_paths`, md5 geprüft. Dann `python3 werkzeuge/dop_einfuegen.py zg2/dop_gebiet.bin` (liest DOPB und DOPC, entfernt alte DOP-Bäume Typ ≥16 und 8 im Gebiet, `dopwald.json` entfällt).
- Ergebnis: 270.422 Bäume + 49.215 Sträucher (neuer Kacheltyp **8** = Strauch aus Luftbild, im Spiel bushA/bushB, auf LITE/MINI ausgedünnt), 1.056 wegen OSM-Baum weggelassen. Kacheln 2,3 → 3,7 MB. Tschechien/Polen: WMS liefert nichts → Maske 0, dort bleibt ESA/OSM wie bisher.
- Maske `zg2/dop_maske.png` (1600×2200, 10 m, R: 0 kein Luftbild/127 offen/254 Wald, G: Acker 85 grün/170 gelb (Raps/Stoppel)/255 kahl) → `window.ZGDOPM` in zittau.js, im Spiel `DOPM_READY`, `gnDopM`, `gnDopW` (Maske vor alter Liste), `gnAcker` (ersetzt den Schlag-Zufallshash in `lcCol` und `gfCell`). Acker-Zustand stammt vom Luftbild-Flugdatum (Frühjahr, deshalb Raps gelb).
- Wald: Inneres weiter prozedural mit Ausdünnung (`KEEP`), neu aber volle Dichte bis 16 m an befahrbaren Wegen (`waysNear` in `gtForestGen`, alt: `window.NO_WAYWALD`). Einzelkronen im geschlossenen Wald liefert das CHM nicht zuverlässig, deshalb dort keine echten Einzelbäume.
- Treppen: dunkle Vorderkante je Stufe (alt: `window.OLD_STAIRVIS`). Zäune: jedes Zaunfeld an 5 Punkten gegen Straßen/Wege/Treppen geprüft (vorher nur Mitte, Zaun stand quer über Treppe Oybin Kammstraße). Schultern: linker Arm hängt locker, Ellbogen nach hinten-unten (alt: `window.OLD_CARRYARM`).
- Aus: `window.NO_DOPT` (alles Luftbild-Zeug inkl. Sträucher und Acker-Zustand).

**Tschechien (0.19.1), Hotfix Zaun/Arm (0.19.2):** Details (ČÚZK-Orthofoto, `dop_gebiet.py ergaenzen cz`, `tstairfit`, `propOnWay`, `tprobe`, `tcarry`) jetzt in `docs/ARCHIV.md`. Achtung: Weg-ID 41396618 liegt in Jonsdorf, die Oybiner Treppe ist 1209305178.

**Schultern 0.19.3–0.19.8, Gabeln 0.19.5:** Details (`carryGripPar`, `carryBody`, `carryRig`, `taperLeg`, `forkStep`, Tests `tcarry`/`tdismount`/`tbike`, Schalter `OLD_CARRY*`, `OLD_DISMOUNT`, `OLD_GRAVELFORK`, `NO_FORKMOVE`) jetzt in `docs/ARCHIV.md`.

**Leistung 0.20.0–0.21.0** (Details 0.20.0–0.20.2 in `docs/ARCHIV.md`): Kachelwald gebündelt (`GT.w`, `OLD_GTW`), Baumschatten nur nah (`OLD_TREESH`), HUD sparsam (`OLD_HUD`), Leistungstest per Tipp auf FPS-Anzeige (`LTEST`), Messung `tests/tgpuperf.js`. iPad-Lesart: Chrome hängt an Pixeln, Bluefy an den Bäumen.
- 0.20.3 (Hicore: 0.20.2 lief erst 60 FPS/90 %, dann alle ~30 s Ruckler und wieder „28 FPS · max 30“): `FPSCTL.win(fps, maxFrameMs)` ersetzt `DRES.tick`/FCAP-Zweig. Unter 55 FPS Auflösung −10 % bis 70 % (nach jedem Wechsel ein Fenster Pause), kein Gewinn bei 70 % (< 3 FPS ggü. 100 %) → zurück auf 100 % und 5 min Sperre; 50–55 ungebremst, < 50 → 30er-Grenze, Probe alle 3 min; hoch +5 % nach 4×≥59, fällt es binnen 12 s → 3 min keine Erhöhung; Fenster mit Bild > 250 ms (Nachladen) zählen nicht. Alt: `window.OLD_FPSCTL`.
**Tiere und Autos 0.22.0** (Hicore: Hirsch auf der Kammstraße hüpfte; Autos sollen lenken/blinken; Räder wirkten achteckig wie Papier; Ruckler beim Nachladen)
- Blickrichtung korrigiert in `PROP_FIX` (`ry`, alt `ry0`): Reh lief rückwärts, Hirsch/Kuh seitwärts, Pferd/Huhn rückwärts, Ziege schräg.
- Skelett automatisch (`ANIM_CFG`, `animRig`, `animObject`, `animUpdate`, Block `/*ANIM-START*/`): Beine aus Punkten unter dem Bauch (`bf` = Bauchhöhe/Höhe) per k-Mittel vorn/hinten, links/rechts; Knochen Wurzel, Rumpf, Kopf/Hals, je Bein oben/unten, Gewichte weich; `SkinnedMesh` teilt Geometrie und Material (1 Zeichenaufruf je Tier wie vorher). `propObject` liefert für Tiere in `ANIM_CFG` das Skelett-Objekt.
- Gangarten (`ANIM_GAITS`, Beine LH, LV, RH, RV): Schritt lateral je 1/4, Trab diagonal, Transversalgalopp (Hirsch/Reh/Pferd), Sprunggalopp (Katze/Eichhörnchen), Hühner zweibeinig. Wechsel nach Froude-Zahl (Trab ab ~0,5, Galopp ab ~2,5), Schrittlänge 2,3·Beinlänge·Fr^0,3 (Alexander & Jayes), Kopfnicken im Schritt, Rumpfschwingen im Galopp, Grasen senkt den Kopf (`gr`).
- Verhalten: `deerStep` (grast/schaut/geht, unter 75 m schaut es zum Fahrer, unter 40 m Flucht mit Schreck, Antraben, Galopp bis `vmax` 11–12 m/s, Drehrate begrenzt), `critterAnim` (Weide-/Hoftiere grasen, gehen ab und zu ein paar Meter, Hühner trippeln und picken; über 160 m Pose eingefroren). Eichhörnchen/Katze laufen statt zu hüpfen. Hase hoppelt weiter (ist richtig). Vögel unverändert.
- Autos (`steerStep`, `blinkStep`, `turnAt`): Spurwechsel weich (`c.lv`, begrenzte Seitenbeschleunigung), Karosserie zeigt in die Bewegungsrichtung, Vorderräder lenken mit; Wanken ~3,7°/g, Nicken ~2,6°/g über gedämpfte Feder (1,4 Hz, ζ 0,4). Blinker (`c.bl`, 4 Lampen + Lichthof) 1,5 Hz: ~1 s vor dem Ausscheren (`c.pbT`), beim Wiedereinscheren, Anfahren vom Rand, Rechtsranfahren, vor Abbiegen an Kreuzungen (Kantenwechsel in `NET.cur.ents`, Knoten mit ≥3 Straßen, Richtungsänderung > 0,55 rad). Alt: `OLD_CARDYN`, `OLD_BLINK`.
- Räder (`wheelGeo`, `wheelTex`, `wheelMat`, `axleX`): eigener runder Reifen (Drehkörper 32 Segmente) + Alufelge 5 Speichen (Traktor gelb 8), Achsen/Spur aus den alten Rad-Dreiecken; über 26 rad/s verwischte Felge gegen Stroboskop. Alt: `OLD_WHEELS`.
- Nachladen: `gtFinishStep` verteilt das Fertigstellen einer Geländekachel auf 5 Bilder (Normalen, Schilder, Nebenstraßen, Wege+Treppen, Einhängen), `gtJobDrop`. Alt: `OLD_GTFS`.
- Test `tests/tanim.js` (`TI=1,4` Autotypen, `KINDS=reh,hirsch`, `OUT`): Auto seitlich/vorn/hinten mit Blinker, Tier ruhig/Schritt/Flucht. Gangbilder ohne Spiel: Harness in der Thread-Sandbox (lädt `props/*.glb` + Block ANIM), Bild vorschau/220_tiere.jpg, 221_autos.jpg.

- **0.21.0 Impostors (Bild-Bäume)**, Hicore will vollen Mischwald: `IMP`, `impAtlas` rendert beim Laden jede Art (`IMP.kinds`, 14 ohne Obstbäume) aus 8 Richtungen in einen Atlas (`RenderTarget` 8×256 × 14×256 px, Mipmaps, schwarz+Alpha 0 = vormultipliziert; LITE 128 px). `impCal` misst einmal per 2-Farben-Bild, ob das Backend Render-Target-Texturen gespiegelt ausliest (`IMP.fl`; WebGL2 ja). `impSet`/`impPut`/`impFin`: ein Mesh (`InstancedBufferGeometry`, Attribute `iP` x,y,z,rIn · `iS` Breite,Höhe,Drehung,Zeile · `iC` Farbe,rOut) = 1 Zeichenaufruf für alle Bild-Bäume. In `gpuFx` Zweig `fx.imp`: Quad dreht zur Kamera, Atlasspalte aus Blickwinkel minus Baumdrehung, Nachbarspalten weich gemischt, Normale kugelförmig (Licht wie Blattkarten), Instanzfarbe nach der Gamma-Umrechnung (wie 3D-Bäume), Schnee wie Laub, Gegenlicht-Schimmer, Alpha-Anhebung bei Verkleinerung. Übergang 3D ↔ Bild per Raster über `LOD_B` 12 m, Bild ↔ Fernkrone (Streckenbäume) ebenso.
  - Radien: 3D bis `impR()` = 60 m (LITE 45, MINI 35, `window.__IR` zum Probieren), Kachelwald Bild bis `gtMidR` 280 m, dann Minikronen wie bisher. Streckenbäume (`TREE_LOD.I`): 3D bis max(60, Schattenbereich `TREE_SHR`), Bild bis `GFX_TREE_R`, dann Fernkrone. Mittelstufe (vereinfachte Kronen) entfällt für Arten mit Bild.
  - Neu für alle Baumstufen: Instanzmitte `iO` (gesetzt über Hook in `setMatrixAt`), Vertex-Shader legt Bäume außerhalb ihres Bereichs auf einen Punkt (vorher bis 30 m Überhang voll gerechnet und nur per Raster verworfen). Alt: `window.OLD_NCULL`.
  - Alt komplett: `window.OLD_IMP` oder `?oldimp=1`. Test `tests/timp.js` (`FPT=1` Waldrand-Punkte, `PRE='window.__IR=8'` = fast alles als Bild zum Vergleich, Atlas als `atlas*.jpg`). Bild vorschau/210_impostors.jpg.
  - Zahlen Waldrand Jonsdorf: 3D-Bäume 480–620 → 90–140 je Bild, dazu 1.100–1.600 Bild-Bäume in einem Aufruf; Mittelstufe 1.100–1.600 → 0.
- Ruckler (0.21.0, `tests/tstutter2.js` fährt die Strecke in 8-m-Schritten ohne Bildaufbau ab und misst die Streaming-Funktionen): Spitzen kommen von `gtFinish` (Gelände-Kachel fertigstellen, Cloud bis 18 ms), `gtForestRange` (bis 11 ms) und `fvFill` (Fernsicht neu verteilen, 5–13 ms, lief beim Nachrechnen alle 0,5 s und lud jedes Mal bis 8,5 MB Instanzdaten hoch). Neu: `upR` lädt nur den belegten Teil der Instanzpuffer hoch (Fernsicht, Wald, Bild-Bäume), Fernsicht beim Nachrechnen höchstens alle 2,5 s. Alt: `window.OLD_UPR`. `gtFinish` ist seit 0.22.0 in Zeitscheiben.
- Poly-Haven-Bodentexturen (0.21.0) sind Standard: gleiche Größe (512 px) und Anzahl wie die bisherigen, also kein FPS-/Speicherunterschied. Einmalige Umstellung über `hicoreRide.tex21`, danach gilt die Wahl im Menü.
- Nächster Hebel für Bluefy (falls Hicore dort 60 will): Nahstufe der Bäume billiger (weniger Blattkarten, kleinerer Radius `gtNearR`/`GFX_TREE_R`), sichtbar prüfen.
- Noch offen (falls nötig): eigener Fahrer 57 Zeichenaufrufe + 55 im Schatten, unbenannte Deko-Gruppe ca. 90, Häuser je Kachel ca. 60.

**Offen / unsicher**
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
- Schnee-Reste aus 0.12.0: Dach-Schneekanten, Schneegeräusche (Details in docs/ARCHIV.md).
- FIT- und Fahrtbild-Download in Bluefy kaputt. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

1. Hicores Rückmeldung zu 0.13.0 und 0.14.0 (iPad).
1a. 0.19.8 am iPad prüfen: Absteigen/Aufsteigen über den Sattel natürlich? Schultern Gravel (0.19.7) hat Hicore bestätigt. Gabeln 0.19.5 (Gravel starr, MTB federt genug/zu viel?), Treppe Oybin Kammstraße frei (0.19.2). Aus 0.19.1 noch offen: Tschechien-Bäume (FPS, Optik südlich der Lausche), Treppen (Böschung/Erdrampe).
2. Poly-Haven-Paket **Stufe 2** (freigegeben): white_plaster_02, beige_wall_001, weathered_brown_planks, old_stone_wall, clay_roof_tiles_02, roof_slates_03, sandstone_cracks oder mossy_sandstone, bark_brown_02 oder pine_bark. Über die Sandbox holen, umschaltbar, Vergleichsbilder.
3. Grashalme nur ca. 20–30 m um den Fahrer.
1d. 0.22.0 am iPad prüfen: Hirsch/Reh (Kammstraße Oybin–Lückendorf) laufen/galoppieren natürlich? Weidetiere, Autos beim Überholen (Lenken, Wanken, Blinker), Räder rund, Ruckler beim Nachladen weniger? FPS unverändert?
1c. 0.21.0 am iPad prüfen (Hicore 25.11.: läuft wesentlich flüssiger) (Chrome und Bluefy): FPS am Waldrand/im Wald, fällt der Wechsel 3D ↔ Bild auf (ca. 50–60 m), Bäume von oben/Berg, Ruckler noch da? Falls Übergang sichtbar: `impR` größer, Atlas 256 → 384 px.
1b. 0.20.0 am iPad prüfen (Chrome und Bluefy): FPS-Anzeige ablesen (FPS, „max 30“, Prozent, CPU ms) an Start, im Ort, im Wald; Bäume/Wald unverändert? Stromsparmodus aus. Je nach CPU-Wert nächster Schritt: CPU hoch → weitere Zeichenaufrufe bündeln (Fahrer, Deko, Häuser); CPU niedrig → Grafiklast (Blattkarten-Bäume, Schatten, Nachbearbeitung).
4. Leistung Teil 3 nur bei Bedarf: Modelle nach Bedarf laden (Rad-Verschmelzen seit 0.16.0, Wald-Bündeln seit 0.20.0 erledigt).
5. Später: dezente Farbauswahl je Rad (über `BIKE_COLS`), Laufmodus (RSC/FTMS) auf demselben Netz.
6. Treppen: erledigt in 0.18.0. Mögliche Verfeinerung: echte Zwischenpodeste, Treppen-Zählung aus Luftbild, Mitspieler tragen sichtbar.
7. Accounts (Supabase Auth mit Google), Easter Eggs, später Abo.
