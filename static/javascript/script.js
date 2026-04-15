let reisestyle = "Comfort";

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".style-btn");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            buttons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            reisestyle = this.dataset.value;
            console.log("Aktiv:", reisestyle);
        });
    });
});

let am_wasser = "Ja";
document.addEventListener("DOMContentLoaded", function () {
    const wasserButtons = document.querySelectorAll(".wasser-btn");

    wasserButtons.forEach(button => {
        button.addEventListener("click", function () {
            wasserButtons.forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            am_wasser = this.dataset.value;
            console.log("Wasser:", am_wasser);
        });
    });
});

let ferienstil = "Aktiv";

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".ferienstil-btn");

    buttons.forEach(button => {
        button.addEventListener("click", function () {

            // alle deaktivieren
            buttons.forEach(btn => btn.classList.remove("active"));

            // aktuellen aktivieren
            this.classList.add("active");

            // Wert speichern
            ferienstil = this.dataset.value;

            console.log("Ferienstil:", ferienstil);
        });
    });
});

let ferienlage = "Stadt";

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".ferienlage-btn");

    buttons.forEach(button => {
        button.addEventListener("click", function () {

            // alle deaktivieren
            buttons.forEach(btn => btn.classList.remove("active"));

            // aktuellen aktivieren
            this.classList.add("active");

            // Wert speichern
            ferienlage = this.dataset.value;

            console.log("Ferienlage:", ferienlage);
        });
    });
});

let ferienart = "Stationaer";

document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".ferienart-btn");

    buttons.forEach(button => {
        button.addEventListener("click", function () {

            // alle deaktivieren
            buttons.forEach(btn => btn.classList.remove("active"));

            // aktuellen aktivieren
            this.classList.add("active");

            // Wert speichern
            ferienart = this.dataset.value;

            console.log("Ferienart:", ferienart);
        });
    });
});

async function askgemini() {
//Variabeln Zuteilung nach dem einlesen
    const start_datum = document.getElementById('Start_Datum').value;
    const end_datum = document.getElementById('End_Datum').value;
    const budget = document.getElementById('Budget').value;
    const budgettoleranz = document.getElementById('Budgettoleranz').value;
    const mintemperatur = document.getElementById('Mindesttemperatur').value;
    const maxtemperatur = document.getElementById('Maximaltemperatur').value;
    const ferienfokus = document.getElementById('Fokus').value;
    const btn = document.getElementById('sendBtn');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('result');


//überprüfen ob wählbare eingaben Getätigt wurden
    if (!start_datum || start_datum.trim() === "") {
        console.log("Ich bin im if")
        alert("Das Start Datum fehlt");
        return;
    }
    if (!end_datum || end_datum.trim() === "") {
        console.log("Ich bin im if")
        alert("Das End Datum fehlt");
        return;
    }
    if (!budget || budget.trim() === "") {
        console.log("Ich bin im if")
        alert("Das Budget fehlt");
        return;
    }
    if (!budgettoleranz || budgettoleranz.trim() === "") {
        console.log("Ich bin im if")
        alert("Die Budgettoleranz fehlt");
        return;
    }
    if (!mintemperatur || mintemperatur.trim() === "") {
        console.log("Ich bin im if")
        alert("Die Mindesttemperatur fehlt");
        return;
    }
    if (!maxtemperatur || maxtemperatur.trim() === "") {
        console.log("Ich bin im if")
        alert("Die Maximaltemperatur fehlt");
        return;
    }


    //Loading anzeigen
    loading.style.display = "block";
    btn.disabled = true;
    btn.innerText = "Bitte warten...";

    // Anfrage an Backend
    try {
        //Anzeige in der Konsole das suche Gestartet wurde
        console.log("Anfrage gestartet")

        //Effektive abfrage
        const response = await fetch('/request', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                start_datum,
                end_datum,
                budget,
                budgettoleranz,
                mintemperatur,
                maxtemperatur,
                am_wasser,
                reisestyle,
                ferienstil,
                ferienfokus,
                ferienlage,
                ferienart,
            })
        });

        //Auf die anwort warten
        const data = await response.json();

        //Antwort in die Konsole schreiben
        console.log("Server Antwort:", data);

        //Antwort entschlüssel
        const parsedAnswer = JSON.parse(data.answer);

        //Antwort in die Carte weitergeben als liste
        renderCards(parsedAnswer.vorschlaege);

        //Fehler abfangen und in die Konsole schreiben
    } catch (e) {
        console.error("Fehler-Details:", e);
        alert("Fehler beim Request oder beim Verarbeiten der Daten");


        //Loading screen abbrechen und Button wiederfreischalten
    } finally {
        loading.style.display = "none";
        btn.disabled = false;
        btn.innerText = "Search";
    }
}

async function get_img(stadt, land) {
    const response = await fetch('/img_request', {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            stadt,
            land,
        })
    });


    const img_url_answer = await response.json();
    const img_url = img_url_answer.answer_img;
    console.log("Responseim url:" + img_url);
    //Antwort entschlüssel
    return img_url;
}

// Karten anzeigen
function renderCards(vorschlaege) {
    const start_datum = document.getElementById('Start_Datum').value;
    const end_datum = document.getElementById('End_Datum').value;
    currentVorschlaege = vorschlaege;
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    //Karten in einer Vorschleife mit index v anzeigen
    vorschlaege.forEach((v, index) => {
        resultDiv.innerHTML += `
            <div class="card"onclick="showDetails(${index})" style="cursor: pointer;">
                <h3>${v.stadt}, ${v.land} ${start_datum} - ${end_datum}</h3>
                <p>Kosten: ${v.geschaetzte_kosten_chf} CHF --- Temperatur: ${v.average_temp_month_in_c}°C</p>
                <p>${v.begruendung}</p>
            </div>
        `;
    });
}

async function showDetails(index) {
    const v = currentVorschlaege[index];
    const detailsDiv = document.getElementById("details-container");
    const bildQuelle = await get_img(v.stadt, v.land);
    // Replace the view with details or append a modal
    detailsDiv.innerHTML = `
        <hr>
        <div class="details-view-card">
        <div class="text-inhalt">
            <h1>${v.land}</h1>
            <h2>Details für ${v.stadt}</h2>
            <p>Durchschnitts Temperatur von ${v.average_temp_month_in_c}°C</p>
            <p>Durchschnitts Niederschlag von ${v.average_niederschlag_month_in_mm} mm</p>
            <p>Sonnenstunden ${v.average_Sonnenstunden_month_in_h} h</p>
            ${v.wasser_in_20km_radius ? `<p>Wassertemperatur: ${v.closest_water_temp_in_c}°C</p>` : ""}
            <h2>Reisegestaltung</h2>
            <p>Transportmittel: ${v.transportmittel}</p>
            <p>Unterkunftsart: ${v.unterkunft_art}</p>
            <p>Geschätzes Budget: ${v.geschaetzte_kosten_chf}</p>
            <p>Begründung: ${v.begruendung}</p>
        </div>
        <img src="${bildQuelle}" alt="Reisebild" class="reise-bild-rechts">
        </div>
    `;
    //Automatisch scrollen
    detailsDiv.scrollIntoView({behavior: 'smooth', block: 'start'});
}

