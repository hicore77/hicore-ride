# Konten einrichten (einmalig, Supabase-Dashboard)

Projekt: https://supabase.com/dashboard/project/snpmmskruuzqrvvsdztz

## 1. Datenbank anlegen (Pflicht, 1 Minute)
SQL Editor › New query › den Inhalt von `supabase/konto.sql` einfügen › **Run**.
Datei: https://github.com/hicore77/hicore-ride/blob/main/supabase/konto.sql (Knopf „Copy raw file“).
Legt an: `profiles`, `rides`, `segment_bests`, Speicher-Bucket `fit`, Funktion `delete_my_account`. Alles mit Row Level Security (jeder sieht nur seine Daten). Mehrfach ausführen schadet nicht.

## 2. Rückkehr-Adressen (Pflicht)
Authentication › URL Configuration:
- Site URL: `https://hicore77.github.io/hicore-ride/webgpu-spiel/`
- Redirect URLs › Add URL: `https://hicore77.github.io/hicore-ride/**`
- Später bei eigener Domain zusätzlich z. B. `https://hicore-ride.de/**` eintragen. Im Spiel ist nichts fest verdrahtet (es nimmt immer die aktuelle Seite).

## 3. Anmelden mit Passwort ohne Mail (Pflicht im Free-Plan, 30 Sekunden)
Authentication › Sign In / Providers › **Email** › Schalter **Confirm email** aus › Save.
Danach legt „Neu registrieren“ im Spiel (E-Mail + Passwort) das Konto sofort an, ganz ohne Mail. Das ist der Hauptweg in Bluefy.
Nachteil: Die E-Mail-Adresse wird nicht geprüft (Tippfehler fallen nicht auf, „Passwort vergessen“ gibt es ohne Mailserver nicht). Für dich und Freunde reicht das.
Wichtig: Die Mail-Vorlagen lassen sich im Free-Plan **nur mit eigenem Mailserver** ändern (Hinweis „Set up custom SMTP to edit templates“). Ohne Schritt 4 enthalten Mails nur einen Link und keinen Code.
Bestehendes Konto ohne Passwort: einmal mit Google anmelden (in Bluefy über den QR-Code am Handy) und im Konto „Passwort festlegen“. Oder unter Authentication › Users den Eintrag löschen und im Spiel neu registrieren (es sind noch keine Daten daran).

## 4. Eigener Mailserver über Hostinger (optional: Code per Mail, Bestätigungs-Mails, Freunde)
1. Bei Hostinger ein Postfach anlegen, z. B. `ride@deinedomain.de` (hPanel › E-Mails), Passwort merken.
2. Supabase › Authentication › Emails › **Set up SMTP** (bzw. SMTP Settings) › Enable custom SMTP:
   - Sender email: `ride@deinedomain.de`, Sender name: `Hicore Ride`
   - Host: `smtp.hostinger.com`, Port: `465`
   - Username: `ride@deinedomain.de` (die volle Adresse), Password: Postfach-Passwort
   - Save.
3. Jetzt sind die Vorlagen bearbeitbar. Bei **Magic link or OTP** und **Confirm signup** im Body ergänzen und speichern:
   ```html
   <p>Dein Code für Hicore Ride: <b>{{ .Token }}</b></p>
   ```
4. Authentication › Rate Limits: „Emails sent per hour“ z. B. auf 30 stellen (ohne eigenen Server ist das fest sehr niedrig).
5. Wer will, kann „Confirm email“ (Schritt 3) dann wieder einschalten.

## 5. Google-Anmeldung (optional, ca. 10 Minuten)
1. https://console.cloud.google.com › neues Projekt „Hicore Ride“.
2. APIs & Services › OAuth consent screen (bzw. „Google Auth Platform“): External, App-Name „Hicore Ride“, deine E-Mail. Danach unter Audience auf **Publish app / In production** stellen, sonst dürfen nur eingetragene Testnutzer rein.
3. Credentials › Create credentials › OAuth client ID › Web application.
   - Authorized JavaScript origins: `https://hicore77.github.io`
   - Authorized redirect URIs: `https://snpmmskruuzqrvvsdztz.supabase.co/auth/v1/callback`
4. Client ID und Client Secret kopieren.
5. Supabase › Authentication › Sign In / Providers › Google › Enable, beide Werte einfügen › Save.

Bluefy: Google sperrt die Anmeldung dort (getestet 26.11.). Seit 0.24.2 öffnet der Google-Knopf in Bluefy einen Code mit QR: am Handy scannen (oder Link in Chrome öffnen), dort mit Google anmelden, Bluefy ist danach angemeldet. Seite: `webgpu-spiel/handy/login.html`, liegt unter der schon eingetragenen Redirect-URL `https://hicore77.github.io/hicore-ride/**`.
