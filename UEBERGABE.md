# Hicore Ride: Übergabe (aktueller Stand)

Stand: 26.11.2026. Letzte veröffentlichte Version: **0.25.6 Beta** (Dolomiten: 10-m-Gelände TINITALY, Fels, Dunst, Bachrinnen, Haustypen). Davor 0.25.5 (Drivo-Kadenz), 0.25.4 (Bergbäche).
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
| **0.25.6** | **Dolomiten realistischer: Höhenmodell TINITALY 10 m, Poly-Haven-Fels, Dunst, Bachrinnen mit Ufersteinen und Strömung, Haustypen Cortina/Chalet/Albergo/Casa, Datenquellen-Seite** |
| 0.25.5 | Drivo: Kadenz im Steuermodus (Commit c5482d0) |
| 0.25.4 | Dolomiten: Bergbäche und Seen aus OSM |

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
**0.25.1 Drivo in Bluefy** (Hicore 26.11.: Drivo erscheint in der Trainersuche nie, Zwift am Apple TV kann ihn)
- Ursache: Bluefy 3.9.3 lehnt `requestDevice` mit **optionalServices als Zahlen** sofort ab (Fehler ohne Text, nur `2`, Liste öffnet sich nicht). Ohne optionalServices oder mit Text-Namen (`'cycling_power'` usw.) geht es; Bluefy gibt nach dem Verbinden ohnehin alle Dienste frei (auch den Elite-Dienst). In `connectTrainer` jetzt Text-Namen (`OPT`), alt: `window.OLD_BTOPT`. Gilt für jedes Gerät, nicht nur den Drivo.
- Drivo 1 (nRF Connect + `bt-test.html`): wirbt nur CSC 0x1816 + Elite `347b0001-…`, hat verbunden aber auch **Cycling Power 0x1818** (Feature `0d 02 01 00`, Control Point 2A66), Device Info (Elite, HW 001, FW 026), Legacy DFU. Spiel nimmt den CPS-Zweig → echte Watt/Kadenz. Elite-Merkmale: 0010 w, 0011 n (sendet `00` je Sekunde), 0012 w, 0013 r (Nullen), 0014 n, 0015 n (3 Pakete/s: `01|02|03`, u16 Zähler, dann 8×u16, vermutlich Kraftverlauf je Kurbelumdrehung), 0016 w, 0017 n. **Widerstand (0.25.3):** Zwift-Mitschnitt (Android-HCI-Snoop am Redmi, Fehlerbericht per `*#*#284#*#*`, Auswertung `btsnoop_hci.log` mit eigenem Parser) zeigt nur einen Befehl: Write-Request `[0x01, X]` auf `347b0010`, alle ~2 s, keine Elite-Notifications nötig. X = Steigung in 0,1 % + 10 (10 = flach, 0 = −1 %, 120 ≈ 11 % „fast nicht tretbar“, per W-Knöpfen in bt-test.html bestätigt). Im Spiel `eliteSlope()` aus `sendGrade` (CPS-Zweig mit `trainer.eli`), Steigung × `S.diff`, begrenzt −1 … +15 %, sofort bei ≥0,3 % Änderung, sonst alle 2 s. Aus: `window.NO_ELITESLOPE`. **Kadenz (0.25.5):** Sobald Steigungsbefehle laufen, sendet der Drivo im CPS keine Kurbeldaten mehr (auch bei Zwift: Balance-Byte `c8`, Kurbel `00 00 00 00`). Kadenz steht in Elite 0015, Byte 3 = U/min (mit Screenshots verglichen: 0x35 = 53). Spiel abonniert 0015 und nimmt dann nur noch diese Kadenz (nach 2,5 s ohne Paket 0), alt: `window.OLD_ELICAD`. Chrome braucht ELITE in optionalServices (wird außer in Bluefy mitgegeben).
- Testseite `webgpu-spiel/bt-test.html`: 10 Suchvarianten, Dienste, Geräteinfo, Watt/Kadenz live, Elite-Rohdaten, „Log kopieren“. Nützlich für jedes neue Gerät.

**0.25.6 Dolomiten realistischer** (Hicore 26.11. abends: „Berge zu gemalt, Wasser unecht“; Maßstab Stufe „Mittel“ auf dem iPad, nur frei und kommerziell nutzbare Quellen, siehe `docs/DATENQUELLEN.md`)
- Höhenmodell: TINITALY 1.1 (INGV, CC BY 4.0). Innen ±7,6 km mit 10 m als `dolo/dem10.png` (Rot/Grün = 16 Bit, (Höhe−900)·4, lädt `dataLoadDolo` nach `window.DEM2`), außen 25 m in `net.json`. `gdemH0` mischt mit 150 m Übergang (`NO_DEM10`). Beschaffung: `werkzeuge/tinitaly_crop.py` in der Sandbox (Kacheln w51570, w51575, w51070, w51075), PNG-Stücke, md5 geprüft, in der Cloud `/home/user/dolo/tin_inner.npy` und `tin_outer.npy` (nicht im Repo). Straßenhöhen neu gerechnet (62,72 km, 925 m).
- Grobgelände: „enge Hülle“ (`OLD_HULL`). Vorher Minimum der 8 Nachbarn, das trug Gipfel um 30–60 m ab (runde Berge, schwebende Gipfelhütten). Jetzt je Zelle 4×4 Proben des feinen Geländes, gesenkt wird nur bei Mulden und nur im Umkreis 2,6 km der Straßen.
- Fels: `dolowand` (Poly Haven cliff_side) seitlich, `dolofels` (rock_face_03) von oben, nah 9 m und fern 75 m, Stufe Mittel mit 5 statt 6 Abfragen (`gfxQ`, `OLD_ROCKTX`); Panorama als Node-Material mit Wandgliederung (`OLD_PANOTX`). Dunst 1,5–52 km bläulich, Wolken hoch und weit, kein Dunstring (`OLD_DLSKY`).
- Bäche: `dlBedIndex`/`dlBedQ`/`dlBedH` senken das Gelände in `gdemH` auf ein stetig fallendes Sohlenprofil (Sohle hw+6 m, Böschung 9 m, meist 1 m, höchstens ca. 2,7 m tief; `NO_DLBED`). Index erst nach `gnData()` bauen (sonst Sohle bei Höhe 0: war der Fehler mit den „Schluchten“). `buildDoloWater2`: Geröllband (`bachbett`, Poly Haven river_small_rocks) auf `gtMeshH` (Höhe der gezeichneten 10-m-Kachel), Ufersteine (ein InstancedMesh, nur bis 420 m um die Straßen), Wasser `dlWaterMat` (drei Fließlagen, wandernde Wirbel, Schaum an Rand und Gefälle, Himmelsspiegelung bei flachem Blick). Alt: `OLD_DLWATER`. Kein Felsrelief am Bach.
- Häuser: `CORTINA`, `CHALET`, `ALBERGO`, `CASA`, Geranienkästen, Pastell-Palette 7 (`OLD_ALPH2`). Balkone nur an annähernd rechteckigen Häusern und nicht über Straßen (`OLD_BALCHK`). Latschen (`NO_LATSCHE`).
- Startmenü, Reiter Welt: „Datenquellen und Lizenzen“.
- Tests: `tdolo.js` mit `WAT2=1` (Bachstellen an der Strecke, wartet auf Kacheln, gibt Höhenproben aus), `WJ=sek` (wartet auf Häuser), `EV='js'`. Nicht im Bild geprüft: Balkone aus der Nähe, Latschen, Ufersteine aus der Nähe, FPS auf dem iPad.

**0.25.4 Bergbäche und Seen**: `dolo_bau.py` exportiert `ZGNET.streams` ([Breite, x0,z0,…], stream 2,6 m, river 7 m, OSM-width) und `ZGNET.lakes`. `buildDoloWater`: Kiesbett (`geroell`-Textur) + türkises Fließwasser (`flowWaterMaterial`, schneller) knapp über dem Gelände, unter Straßen ausgespart; Seen auf tiefster Uferhöhe. Bachrauschen über `window.DLWPTS` (Ton `prep`). Aus: `window.NO_DLWATER`. Test: `WAT=1 node tdolo.js`. Offen: Bäume halten noch keinen Abstand zum Bach.

**0.25.2 Alpenhäuser, Wegkreuze, Fels** (Hicore 26.11. zu 0.25.0: „Berge verwaschen, nicht das typische Grau-Weiß, überall Umgebindehäuser“; FPS super)
- Häuser: Alpen-Atlas (`atlasFn` mit `alp`, Zellen 8–12 und 31, Giebel 1–4 ersetzt, eigener Cache `atlasA`, `GT.hm` wird in `dataReset` geleert). Typen `LAD`, `STADEL`, `TABIA`, `RIFUGIO`, `HOTELA` (`HT`, `alp`: Traufe 0,95 m, Giebel 0,7 m; `bal`: Holzbalkone an den Traufseiten, Hotel je Geschoss; Dach `rf` m = Blech grau/rot/grün, w = Lärchenschindeln). `htPick` Dolomiten neu, `dolo_bau.py` trennt Stadel/Ställe (k 3) von Hütten (k 7). Alt: `window.OLD_ALPH`.
- Wegkreuze: `buildDoloShrines` (Holzkreuz mit Dächlein, Bildstock, Marterl; OSM-Knoten `ZGNET.crosses` ohne Gipfelkreuze + an der Runde alle 1,5–2,6 km, nicht an Häusern/steilen Stellen). Aus: `window.NO_SHRINES`. Test: `SHR=3 node tdolo.js` fotografiert die ersten Kreuze.
- Fels: `dlRockD` verschiebt Kachel- und Grobgelände auf Fels/Geröll (gratige Rauschsumme, Bänder, Kanten geschärft gegen 55-m-Mittel, nie näher als 10–35 m an Straßen; nur Optik). Grobgelände Dolomiten 480 statt 320 Zellen. Fels-Erkennung zusätzlich über Helligkeit (Dolomit ist im Satellitenbild beige), Faktor 0,74 (`DLROCKF`), Shader mit Schichtbändern, Regenstreifen, Ockerflecken (`OLD_ROCKSH`). Schalter: `NO_ROCKD`, `OLD_DLROCKL`.
- Satellitenbild: Schattenseiten entsättigt (vorher cyan/neongrün), Unscharf-Maskieren.

**0.25.0 Dolomiten** (Hicore 26.11.: „wie Zittauer Gebirge, mit allen Daten“, nur Hauptstraßen befahrbar, Nebenstraßen sichtbar, Panorama „atemberaubend“; Wunschliste in Projekt-Memory `dolomiten-welt`)
- Daten: `werkzeuge/dolo_bau.py` baut `quelle/dolo/` (ca. 9 s) aus Rohdaten unter `/home/user/dolo` (nicht im Repo): Copernicus GLO-30 (S3, Kacheln N46 E011/E012), ESA WorldCover 2021 (S3, Dateiname mit kleinem „v200“), Sentinel-2 L2A Kachel **32TQS** Szene S2C_32TQS_20250919_0 (33TUM deckt das Gebiet nicht), OSM über Sandbox/Overpass (`osmc.json`, als PNG-Chunks geholt). Projektion LAT0 46.49, LON0 12.06, Welt-y = Höhe − 1200 m.
- Inhalt: DEM 25 m (x −21000…21000, z −16000…14000, Waldkorrektur −11 m), 4 Kanten per Dijkstra auf primary/secondary/tertiary (SR48 Cortina–Pocol, SP638 Giau, SP638 Giau–Selva–Caprile, SR48 Falzarego), Steigung geglättet max. 15,5 %; Runde = Pocol-Schleife, Start Cortina über `zgApplyStart`. Nebenstraßen/Wege im ZGSIDE-Format (nur sichtbar, `NO_WAYNET`). Gebäude, Ortsschilder, Bergwertungen (Giau von Pocol/Selva, Falzarego von Andraz/Pocol, Pocol), 233 Gipfel in `pois`. Landbedeckung 10 m (`lc.png`, Klassen 6 Fels, 8 Schnee, 9 Geröll, 10 Alpweide), Satellitenbild nah 10 m / fern 25 m mit Schatten-/Blaustich-Korrektur.
- Spiel: `build_gpu.py` schreibt `gpu/data/dolomiten.js` (`window.DLDATA`, ca. 7 MB, wird erst bei Weltwahl geladen). `dataSwitch(def)` tauscht die `window.ZG*`-Bündel ohne Neuladen (Bluetooth bleibt), `dataReset` leert alle Weltzwischenspeicher. `lcCol` nimmt die Satellitenfarbe (Fels grau = Kennung für den Shader), Gelände-Shader mischt Dolomit-Textur (`texjpg/dolomit.jpg`, Poly Haven marble_cliff_05) nach Farbe und Hangneigung. `buildDoloPano`: Ring aus dem ganzen DEM mit `sat_far` bis ca. 20 km, Nebel 4–62 km. Wald Fichte/Kiefer, Baumgrenze ab ca. 1.960 m. Italienische blaue Wegweiser.
- Test `tests/tdolo.js` (`W=dolo|zittau`, `OUT`, `D` Fahrerbilder in m, `V` freie Kamera `[x,z,h,lx,lz,name]`, `NF`); ein Bild mit Panorama dauert in der Cloud ca. 5–7 min.
- Farben: Satellitenwerte sind sRGB, `lcCol` setzt sie mit `THREE.SRGBColorSpace` (vorher linear gelesen = viel zu hell, alt `window.OLD_DLLIN`), Fels zusätzlich ×0,6 (`window.DLROCKF`), weil das Bild schon Sonnenlicht enthält.
- Grenzen: Gelände-Farbe = Eckpunktfarbe, fern also unscharf; Häuser vorerst Zittauer Typen; Gipfel noch ohne Beschriftung.



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

0. Dolomiten 0.25.x: Hicores iPad-Urteil zu 0.25.6 abwarten (FPS auf Mittel!). Dann Nahdetail nach Entfernung (Blätter/Rinde/Gras/Fassaden: nah Struktur, ab 20–30 m schlicht, weiche Übergänge), Licht/Atmosphäre, Wolken weniger gemalt, Wasser aus der Nähe prüfen; für alle Welten Texturen/Bewuchs gegen freie Alternativen prüfen (vorher/nachher messen). Kapellen; Lärche/Zirbe/Latschen, Alpenblumen; Bäche Boite/Cordevole/Codalonga türkis mit Rauschen; Kühe mit Glocken, Gämsen/Steinböcke, Murmeltiere, versteckter Yeti; Gipfelnamen.

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
