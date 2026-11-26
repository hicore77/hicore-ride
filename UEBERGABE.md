# Hicore Ride: Übergabe (aktueller Stand)

Stand: 26.11.2026. Letzte veröffentlichte Version: **0.24.4 Beta** (Zäune nicht mehr über Straßen/Wege/Gleise, kein Gras auf Pflaster, Handy-Layout fest, Trikots ohne Schrift). Davor 0.24.3 (E-Mail + Passwort), 0.24.2 (Bluefy-Login per QR).
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
| **0.24.4** | **Zäune nie über Straßen, Wege, Gleise; kein Gras auf Pflaster-/Splittstreifen; Handy-Kreuzungsfeld feste Höhe; Sprint-/Bergtrikot ohne Schrift** |
| 0.24.3 | E-Mail + Passwort mit „Neu registrieren“ als Hauptweg (kein Code nötig, Supabase „Confirm email“ aus), Code-Login nur noch aufklappbar (braucht eigenen SMTP) |
| 0.24.2 | Bluefy-Anmeldung: E-Mail-Code wieder vorn mit Erklärung, Google in Bluefy über Handy/Chrome (Seite handy/login.html, Übergabe per Code/QR, Kanal hl:CODE), Anmeldung von Spiel zu Spiel übertragen, Prüfung ob Google eingeschaltet |

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
**0.24.4 Zäune, Gras, Handy, Trikots** (Hicore 26.11.: Dekozäune quer über Straßen und Bahn, Grasbüschel auf Kopfsteinpflaster, Handy-Layout springt, Trikot-Schrift zu groß)
- Zäune: `fenceHit(ax,az,bx,bz,m)` (bei `propOnWay`) prüft ein Zaunstück alle 0,5 m gegen Straßen (`gnNear`, Rand + m), Wege/Treppen (`waysNear`) und Gleise (`railNear`, eigenes 20-m-Raster aus `ZSB.lines`, Schmalspur 1,6 m, Normalspur 2,1 m halbe Bettbreite). Gilt für OSM-Zäune (`gtFenceMesh`, m 1,0), Deko-Zaun entlang der Runde (`addProps`, m 2,6 = auch nicht auf dem Pflasterstreifen), Weidezaun (m 2,6), Jägerzaun/Hecke (m 1,0 + nicht auf Pflaster, `buildFencesHedges`) und Vorgartenzäune (`gardenFences`). Vorher wurden Gleise nirgends, Wege bei Weide-/Jägerzaun gar nicht geprüft. Alt: `window.OLD_FENCECHK`.
- Gras: `gnPave(x,z,m)` (nach `gnNear`, das jetzt auch `px/pz` liefert) = liegt der Punkt auf dem Pflaster-/Splittstreifen im Ort (gleiche Breiten wie `orBuilder`). Feines Gras/Büschel (`gfCell`) und Rand-Büschel/Blumen (`buildVerge`, dort auch nicht mehr auf Wegen) lassen diese Stellen aus. Alt: `window.OLD_GRASSPAVE`.
- Handy (`quelle/handy/index.html`): Kreuzungsfeld hat feste Höhe (Text 2 Zeilen, Knopfreihe 52 px, Knöpfe einzeilig), Pfeile rutschen nicht mehr.
- Trikots: Schriftzüge aus `jer/tex_sprint.jpg` und `jer/tex_berg.jpg` entfernt (`werkzeuge/trikot_ohne_text.py`, Inpainting direkt in der UV-Textur; Originale in der Git-Historie). Vorschaubilder `thumb_*` unverändert.
- Test `tests/tfence.js` (ca. 20 min, `PRE='window.OLD_FENCECHK=1;window.OLD_GRASSPAVE=1;'` = alter Stand): zählt Zaunstücke, die Straße/Weg/Gleis berühren, und Feingras auf Pflaster. Ergebnis Start Zittau: alt 54 Zaunstücke über Wege/Gleise (Weide, Jäger, Hecke), neu 0; Ortskern Zittau Feingras auf Pflaster alt 3.653, neu 0. `terr2` none.

**0.24.3 Passwort als Hauptweg** (Hicore 26.11.: Screenshot, Mail-Vorlagen im Free-Plan nur mit eigenem SMTP änderbar → kein Code möglich): `ACC.register` (`signUp`; mit Session = sofort angemeldet, `identities:[]` = Adresse vergeben, sonst Hinweis auf Bestätigungs-Link), Felder E-Mail + Passwort vorn, Code-Login in `<details>`. Einrichtung: „Confirm email“ aus, optional Hostinger-SMTP (`docs/KONTO_EINRICHTEN.md` Schritt 3/4). Test `tacc` (26 Prüfungen inkl. Registrieren).

**Bluefy-Anmeldung 0.24.2** (Hicore 26.11.: Google geht in Bluefy nicht, E-Mail brachte nur „Confirm“-Link, keinen Code)
- Ursache E-Mail: Supabase-Vorlagen enthalten ab Werk keinen Code, und im Free-Plan sind sie nur mit eigenem SMTP änderbar (deshalb 0.24.3).
- Google in Bluefy wird gesperrt (eingebetteter Browser). `ACC.blu()` = iOS + `navigator.bluetooth`; dort öffnet der Google-Knopf die Übergabe (`ACC.handStart`): Code + QR auf `handy/login.html?c=CODE`. Die Seite (Handy oder Chrome) meldet mit Google an und sendet die Sitzung über Realtime-Kanal `hl:CODE` (`hlSend`, Wiederholung alle 2,5 s bis `ok`); Spiel macht `setSession`. Der Sender vergisst die Sitzung danach lokal (gleicher Erneuerungsschlüssel auf zwei Geräten → Supabase meldet beide ab). Code gilt 10 min.
- Angemeldetes Spiel kann unter „Anderes Gerät anmelden“ selbst übertragen (`ACC.give`, meldet sich dabei ab). Vor Google-Weiterleitung `GET /auth/v1/settings` (`googleOn`), damit keine rohe JSON-Fehlerseite kommt.
- Test `tests/thlogin.js` (Spiel ↔ login.html und Spiel → Spiel, `fake_auth.js` mit Fake-Kanal/`FAKE_OAUTH`), `tacc` weiter grün.

**Konten 0.24.0** (Hicore 26.11.: „Accounts wäre nicht schlecht“)
- Supabase Auth im selben Projekt wie Multiplayer (`ACC` in `src.html` direkt vor `$('bTr').onclick`). Eigener Client mit `persistSession`, `flowType:'pkce'`, `storageKey:'hicoreRide.auth'`; Multiplayer/Handy-Clients bleiben ohne Sitzung. Rückkehr-Adresse = `location.origin+pathname` (nichts fest verdrahtet, eigene Domain nur in Supabase eintragen).
- Anmelden über 👤 oben rechts im Menü (`#accModal`): E-Mail-Code (`signInWithOtp` + `verifyOtp type:'email'`, Hauptweg für Bluefy, weil Links aus der Mail-App in Safari landen), Passwort (nach erster Anmeldung im Konto festlegen), Google (`signInWithOAuth`; setzt vorher `bootN`/`stage` zurück, sonst startet das iPad nach der Rückkehr im MINI-Modus). Fehlertexte deutsch (`ACC.em`). Link im falschen Browser → Hinweis, Code einzugeben.
- Daten (SQL `supabase/konto.sql`, RLS je Konto): `profiles` (Name, Gewicht, FTP, Puls max., `settings` jsonb, `total_km`), `segment_bests` (beste Zeit gewinnt, `ACC.bestPush` bei neuer Bestzeit, Abgleich in `syncBests`), `rides` + Bucket `fit` (`<uid>/<id>.fit`, nur Fahrten mit echtem Trainer ab 1 min, `ACC.saveRide` in `endRide`, Warteschlange `hicoreRide.accQ` bei fehlendem Netz/Login, max. 10), `delete_my_account()`.
- Einstellungen: `ACC.KEYS` (Gewicht, Schwierigkeit, Bots, Trikot, Watt-Glättung/-Korrektur, Rad, Tageszeit, Wetter, Schnee, Ton, Bloom, Name, Anzeige, Welt, FTP, Puls max.). Nicht synchron: Grafikstufe, Gemini-Schlüssel, Handy-Code. `store.set` ist umhüllt (`ACC.touch` setzt `hicoreRide.accLocalT`), neuere Seite gewinnt (`settings._t`), Hochladen 3 s nach Änderung. `totalKm` = Maximum.
- Konto-Fenster: Profil, Meine Fahrten (FIT herunterladen über `saveFile`, löschen mit zweitem Tipp), Bestzeiten-Zahl, Passwort, Abgleichen, Abmelden, Konto löschen (zweiter Tipp). Aus: `window.NO_ACC`.
- Einrichtung im Supabase-Dashboard: `docs/KONTO_EINRICHTEN.md` (SQL, Redirect-URLs, `{{ .Token }}` in Mail-Vorlagen, eigener SMTP für Freunde, Google-Client). Supabase-Standardversand schickt nur an Team-Mitglieder.
- Test `tests/tacc.js` (ca. 1 min, kein Spielstart nötig): `fake_auth.js` (im Browser, über `window.HC_SB`) + `fake_auth_srv.js` (Node, RLS-Nachbau), zwei Kontexte = zwei Geräte. 23 Prüfungen: Code-Login, Profil/Einstellungen hoch und runter, Bestzeiten in beide Richtungen, Fahrt + FIT, Passwort, Sitzung nach Neuladen, Google-Meldung, Konto löschen. Echte Supabase nur bei Hicore prüfbar.

**0.23.1 Restpunkte, 0.23.2 Autoräder:** Details (`twend`, `OLD_STAIRFLOAT`, Dachschnee `SNOWCAP`, `saveSheet`, `steerStep2`, `OLD_WHEELS`, `OLD_CARSTEER`) jetzt in `docs/ARCHIV.md`.

**Handy-Fernbedienung 0.23.0:** Details (Seite `quelle/handy/`, Kanal `hc:CODE`, `CMP`, `NO_CMP`, Test `thandy` mit `fake_supabase.js`) jetzt in `docs/ARCHIV.md`. Online: https://hicore77.github.io/hicore-ride/webgpu-spiel/handy/

**Tiere und Autos 0.22.0:** Details (`ANIM_CFG`, Gangarten, `deerStep`, `blinkStep`, `wheelGeo`, `gtFinishStep`, Test `tanim`) jetzt in `docs/ARCHIV.md`.

- 0.21.0 Impostors (`IMP`, `impR` 60 m, `OLD_IMP`), Ruckler-Messung `tstutter2`, `upR`/`OLD_UPR`: Details in `docs/ARCHIV.md`. Poly Haven ist Standard.

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
- 0.24.4 am iPad prüfen: Zäune quer über Straßen/Bahn weg? Fehlen jetzt sichtbar Zäune? Gras auf Pflaster weg, Handy-Pfeile bleiben stehen, Trikots.
- 0.24.3 prüfen: „Confirm email“ aus, in Bluefy registrieren/anmelden mit Passwort; Übergabe per QR vom Handy (0.24.2), Google in Chrome.
- 0.24.0 einrichten und prüfen: Dashboard-Schritte aus `docs/KONTO_EINRICHTEN.md`, dann Anmelden per Code in Bluefy, Google in Chrome und Bluefy (Google sperrt evtl. eingebettete Browser), Fahrt speichern, FIT aus dem Konto laden.
- 0.23.2 am iPad prüfen: Räder im Radkasten, Einlenken beim Überholen und in Kurven, Kreisel-Gegenverkehr.
- 0.23.1 am iPad prüfen: Speichern in Bluefy (Teilen-Knopf, sonst „An Handy senden“), Dachschnee bei „viel“, Knirschen, Treppen/Wegenden. KI-Gespräch mit Figuren auf dem iPad unzuverlässig.
- Redmi Note 10 Pro stürzt ab (ruht). Häuserflackern auf „Hoch“ (Chrome iPad) unbestätigt.
- `tjun` meldet 3 bekannte, unkritische Artefakte.

## 6. Nächste Schritte

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
