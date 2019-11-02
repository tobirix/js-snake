(function () {
    'use strict';
    //****************************************
    // Variablen für Zugriff auf HTML-Elemente
    //****************************************
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    var buttonLinks = document.getElementById("buttonLinks");
    var buttonOben = document.getElementById("buttonOben");
    var buttonRechts = document.getElementById("buttonRechts");
    var buttonUnten = document.getElementById("buttonUnten");
    var buttonStart = document.getElementById("buttonStart");
    var buttonPause = document.getElementById("buttonPause");

    //****************************************
    // Sonstige Variablen
    //****************************************
    var spielZustand = "anfang"; // "spielLaeuft", "pause", "gameOver"
    var timerLaeuft = false;
    var spielfeldhoehe = 400;
    var spielfeldbreite = 300;
    var raster = 20;
    var statusHoehe = 30;
    var zweiPi = Math.PI * 2;

    //****************************************
    // Objekte
    //****************************************
    var Koerperteil = function (x, y, farbe) {
        this.x = x;
        this.y = y;
        this.richtung = "nachRechts";
        this.radius = raster / 2;
        this.farbe = farbe;
        this.weiterlaufen = function () {
            switch (this.richtung) {
                case "stop":
                    break;
                case "nachRechts":
                    this.x = this.x + snake.geschwindigkeit;
                    break;
                case "nachLinks":
                    this.x = this.x - snake.geschwindigkeit;
                    break;
                case "nachOben":
                    this.y = this.y - snake.geschwindigkeit;
                    break;
                case "nachUnten":
                    this.y = this.y + snake.geschwindigkeit;
            }
        },
            this.zeichnen = function () {
                context.fillStyle = this.farbe;
                context.beginPath();
                context.arc(this.x + this.radius, this.y + this.radius, this.radius,
                    0, zweiPi, true);
                context.stroke();
                context.fill();
                context.closePath();
            }
    };

    var snake = {
        score: 0,
        highscore: 0,
        xKopf: 140,
        yKopf: 180,
        geschwindigkeit: 1,
        farbe: "yellow",
        aktuelleRichtung: "nachRechts", // "nachRechts", "nachLinks", "nachOben", "nachUnten"
        naechsteRichtung: "nachRechts", // "nachRechts", "nachLinks", "nachOben", "nachUnten"
        crashed: false,
        koerper: [
            new Koerperteil(120, 180, "red"),
            new Koerperteil(100, 180, "blue"),
            new Koerperteil(80, 180, "green")
        ],
        reset: function () {
            this.score = 0;
            this.crashed = false;
            this.xKopf = 140;
            this.yKopf = 180;
            this.aktuelleRichtung = "nachRechts";
            this.naechsteRichtung = "nachRechts";
            this.koerper = [
                new Koerperteil(120, 180, "red"),
                new Koerperteil(100, 180, "blue"),
                new Koerperteil(80, 180, "green")
            ];
            apfel.x = 180;
            apfel.y = 180;
        },
        zeichnen: function () {
            // Koerper zeichnen
            for (var i = this.koerper.length - 1; i >= 0; i--) {
                this.koerper[i].zeichnen();
            }

            // Kopf zeichnen
            context.fillStyle = this.farbe;
            context.fillRect(this.xKopf, this.yKopf, raster, raster);
        },
        weiterlaufen: function () {
            // 1. auf Raster evtl. Richtung ändern
            // und prüfen, ob Apfel gefressen
            // und prüfen, ob selbst gefressen
            if ((this.xKopf % raster === 0) && (this.yKopf % raster === 0)) {
                // Richtung der Körperteile ändern
                // letztes Körperteil zuerst
                // jedes Körperteil übernimmt Richtung vom Vorgänger
                for (var i = this.koerper.length - 1; i > 0; i--) {
                    this.koerper[i].richtung = this.koerper[i - 1].richtung;
                }
                // erstes Körperteil übernimmt Richtung vom Kopf
                this.koerper[0].richtung = this.aktuelleRichtung;

                // Richtung  vom Kopf ändern
                this.aktuelleRichtung = this.naechsteRichtung;

                // Apfel gefressen?
                if (apfel.x === this.xKopf && apfel.y === this.yKopf) {
                    // Score und evtl. Highscore ändern
                    this.score++;
                    if(this.score > this.highscore){
                        this.highscore = this.score;
                    }

                    // neues Koerperteil hinten anhängen
                    var anzahlDerKoerperteile = this.koerper.length;
                    // Position vom letzten Koerperteil übernehmen
                    var x = this.koerper[anzahlDerKoerperteile - 1].x;
                    var y = this.koerper[anzahlDerKoerperteile - 1].y;
                    this.koerper[anzahlDerKoerperteile] = new Koerperteil(x, y, apfel.farbe);
                    this.koerper[anzahlDerKoerperteile].richtung = "stop";

                    // Apfel verschwinden und neu positionieren lassen
                    apfel.verschwindibus();
                }

                // Selbst gefressen?
                for (var index = 0; index < this.koerper.length; index++) {
                    if (this.xKopf === this.koerper[index].x &&
                        this.yKopf === this.koerper[index].y) {
                        this.crashed = true;
                    }
                }
            }

            // 2. Positionen neu berechnen
            // Kopf
            switch (this.aktuelleRichtung) {
                case "stop":
                    break;
                case "nachRechts":
                    this.xKopf = this.xKopf + this.geschwindigkeit;
                    break;
                case "nachLinks":
                    this.xKopf = this.xKopf - this.geschwindigkeit;
                    break;
                case "nachOben":
                    this.yKopf = this.yKopf - this.geschwindigkeit;
                    break;
                case "nachUnten":
                    this.yKopf = this.yKopf + this.geschwindigkeit;
            }
            // Koerper
            for (var i = 0; i < this.koerper.length; i++) {
                this.koerper[i].weiterlaufen();
            }

            // 3. Schlange aus dem Feld gelaufen?            
            if (this.yKopf > spielfeldhoehe - raster) {
                this.yKopf = spielfeldhoehe - raster;
                this.crashed = true;
            }
            if (this.yKopf < 0) {
                this.yKopf = 0;
                this.crashed = true;
            }
            if (this.xKopf > spielfeldbreite - raster) {
                this.xKopf = spielfeldbreite - raster;
                this.crashed = true;
            }
            if (this.xKopf < 0) {
                this.xKopf = 0;
                this.crashed = true;
            }
        },
        isCrashed: function () {
            return this.crashed;
        },
        nachLinks: function () {
            // Snake darf nicht rückwärts laufen
            if (this.aktuelleRichtung !== "nachRechts") {
                this.naechsteRichtung = "nachLinks";
            }
        },
        nachOben: function () {
            if (this.aktuelleRichtung !== "nachUnten") {
                this.naechsteRichtung = "nachOben";
            }
        },
        nachRechts: function () {
            if (this.aktuelleRichtung !== "nachLinks") {
                this.naechsteRichtung = "nachRechts";
            }
        },
        nachUnten: function () {
            if (this.aktuelleRichtung !== "nachOben") {
                this.naechsteRichtung = "nachUnten";
            }
        }
    };

    var apfel = {
        x: 180,
        y: 180,
        radius: raster / 2,
        farbe: "red",
        zeichnen: function () {
            context.fillStyle = this.farbe;
            context.lineWidth = 2;
            context.strokeStyle = "white";
            context.beginPath();
            context.arc(this.x + this.radius, this.y + this.radius, this.radius,
                0, zweiPi, true);
            context.stroke();
            context.fill();
            context.closePath();
        },
        verschwindibus: function () {
            // Position des Apfels ändern

            var positionBesetzt;
            do {
                positionBesetzt = false;

                // neue zufällige Position berechnen
                this.x = Math.floor(Math.random() * spielfeldbreite / raster) * raster;
                this.y = Math.floor(Math.random() * spielfeldhoehe / raster) * raster;

                // prüfen, ob Position schon besetzt
                if (this.x === snake.xKopf && this.y === snake.yKopf) {
                    positionBesetzt = true;
                } else {
                    snake.koerper.forEach(koerperteil => {
                        if (this.x === koerperteil.x && this.y === koerperteil.y) {
                            positionBesetzt = true;
                        }
                    });
                }
            } while (positionBesetzt);

            // Farbe des Apfels
            var o = Math.round, r = Math.random, s = 255;
            this.farbe = 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',' + 255 + ')';
        }
    };

    var statusleiste = {
        hoehe: statusHoehe,
        hintergrundfarbe: "black",
        schriftfarbe: "white",
        zeichnen: function () {
            // Rechteck zeichnen
            context.fillStyle = this.hintergrundfarbe;
            context.fillRect(0, spielfeldhoehe, spielfeldbreite, this.hoehe);

            // Score & Highscore ausgeben
            context.font = "bold 20px monospace";
            context.fillStyle = this.schriftfarbe;
            context.fillText("Highscore: " + snake.highscore + "  Score: " + snake.score, 5, spielfeldhoehe + this.hoehe / 1.5);
        }
    };

    var gameOverMeldung = {
        x: 20,
        y: 100,
        hoehe: 50,
        breite: 260,
        hintergrundfarbe: "rgba(255,0,0,0.4)",
        schriftfarbe: "white",
        zeichnen: function () {
            // Rechteck zeichnen
            context.fillStyle = this.hintergrundfarbe;
            context.fillRect(this.x, this.y, this.breite, this.hoehe)

            // Text ausgeben
            context.font = "bold 20px monospace";
            context.fillStyle = this.schriftfarbe;
            context.fillText("G A M E   O V E R",
                this.x + 30, this.y + 30);
        }
    };

    var pauseMeldung = {
        x: 20,
        y: 100,
        hoehe: 50,
        breite: 260,
        hintergrundfarbe: "rgba(255,0,0,0.4)",
        schriftfarbe: "white",
        zeichnen: function () {
            // Rechteck zeichnen
            context.fillStyle = this.hintergrundfarbe;
            context.fillRect(this.x, this.y, this.breite, this.hoehe)

            // Text ausgeben
            context.font = "bold 20px monospace";
            context.fillStyle = this.schriftfarbe;
            context.fillText("P A U S E",
                this.x + 30, this.y + 30);
        }
    };

    var anleitung = {
        x: 10,
        y: 100,
        hoehe: 180,
        breite: spielfeldbreite - 20,
        hintergrundfarbe: "rgba(255,0,0,0.4)",
        schriftfarbe: "white",
        zeichnen: function () {
            // Rechteck zeichnen
            context.fillStyle = this.hintergrundfarbe;
            context.fillRect(this.x, this.y, this.breite, this.hoehe)

            // Text ausgeben
            context.font = "bold 20px monospace";
            context.fillStyle = this.schriftfarbe;
            context.fillText("Use ↑ ← ↓ →",
                this.x + 60, this.y + 30);
            context.fillText("or W A S D to play!",
                this.x + 20, this.y + 55);
            context.fillText("R - start again",
                this.x + 20, this.y + 135);
            context.fillText("ESC - pause",
                this.x + 20, this.y + 160);
        }
    }


    //****************************************
    // Funktionen
    //****************************************    
    var allesZeichnen = function () {
        // alte Zeichnung löschen
        context.clearRect(0, 0, spielfeldbreite, spielfeldhoehe + statusHoehe);

        // Spielfiguren zeichnen
        apfel.zeichnen();
        snake.zeichnen();

        // Statusleiste zeichnen
        statusleiste.zeichnen();

        // evtl. Game Over zeichen
        if (spielZustand === "gameOver") {
            gameOverMeldung.zeichnen();
        }

        // evtl. Pause zeichen
        if (spielZustand === "pause") {
            pauseMeldung.zeichnen();
        }

        // evtl. Anleitung zeichen
        if (spielZustand === "anfang") {
            anleitung.zeichnen();
        }

    };

    var start = function () {
        if (!timerLaeuft) {
            timerLaeuft = true;
            requestAnimationFrame(wiederhole);
        }
    };

    var gameOver = function () {
        spielZustand = "gameOver";
        timerLaeuft = false;
    }

    // Timer, GameLoop
    var wiederhole = function (timestamp) {
        // Dieser Quellcode wird wiederholt:
        // 1. Koordinaten und Eigenschaften der
        // Spielobjekte neu berechnen
        snake.weiterlaufen();

        // 2. Schlange gegen Spielfeldrand gelaufen?
        if (snake.isCrashed()) {
            gameOver();
        }

        // 3. Alles zeichnen
        allesZeichnen();

        // 4. Rekursion
        if (timerLaeuft) {
            requestAnimationFrame(wiederhole);
        } else {

        }
    };

    // nächste Richtung der Schlange ändern
    var nachLinks = function () {
        switch (spielZustand) {
            case "anfang":
                spielZustand = "spielLaeuft";
                snake.nachLinks();
                start();
                break;
            case "spielLaeuft":
                snake.nachLinks();
        }
    };

    var nachOben = function () {
        switch (spielZustand) {
            case "anfang":
                spielZustand = "spielLaeuft";
                snake.nachOben();
                start();
                break;
            case "spielLaeuft":
                snake.nachOben();
        }
    };

    var nachRechts = function () {
        switch (spielZustand) {
            case "anfang":
                spielZustand = "spielLaeuft";
                snake.nachRechts();
                start();
                break;
            case "spielLaeuft":
                snake.nachRechts();
        }
    };

    var nachUnten = function () {
        switch (spielZustand) {
            case "anfang":
                spielZustand = "spielLaeuft";
                snake.nachUnten();
                start();
                break;
            case "spielLaeuft":
                snake.nachUnten();
        }
    };

    var pause = function () {
        switch (spielZustand) {
            case "spielLaeuft":
                spielZustand = "pause";
                timerLaeuft = false;
                break;
            case "pause":
                spielZustand = "spielLaeuft";
                start();
        }
    };

    var neuesSpielStarten = function () {
        spielZustand = "anfang";
        snake.reset();
        allesZeichnen();
    }

    var startTaste = function () {
        if (spielZustand === "gameOver") {
            neuesSpielStarten();
        }
    };

    //****************************************
    // Eventhandler
    //****************************************
    // Buttons
    buttonLinks.addEventListener("click", nachLinks);
    buttonOben.addEventListener("click", nachOben);
    buttonRechts.addEventListener("click", nachRechts);
    buttonUnten.addEventListener("click", nachUnten);
    buttonPause.addEventListener("click", pause);
    buttonStart.addEventListener("click", startTaste);

    // Eventhandler fuer Tastatur
    document.addEventListener("keydown", function (event) {
        switch (event.keyCode) {
            case 38: // ↑
                nachOben();
                break;
            case 87: // W
                nachOben();
                break;
            case 39: // →
                nachRechts();
                break;
            case 68: // D
                nachRechts();
                break;
            case 40: // ↓
                nachUnten();
                break;
            case 83: // S
                nachUnten();
                break;
            case 37: // ←
                nachLinks();
                break;
            case 65: // A
                nachLinks();
                break;
            case 27: // Escape
                pause();
                break;
            case 82: // R
                startTaste();
                break;
        }
    });

    //****************************************    
    // Hauptprogramm
    //****************************************
    allesZeichnen();
})();