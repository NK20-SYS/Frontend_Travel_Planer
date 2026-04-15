    // Buttons

    // Vorauswahl -> immer der erste Button wird "active" geschrieben:
    let api_base_url = "test";
let reisestyle = "Comfort";
let am_wasser = "Ja";
let ferienstil = "Aktiv";
let ferienlage = "Stadt";
let ferienart = "Stationaer";

    // Die Logik gilt für alle Buttons der Art toggle-btn:
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".toggle-btn");

    // "click" Option für die Buttons
    buttons.forEach(button => {
        button.addEventListener("click", function () {
            const group = this.dataset.group;

                // "Active" wird entfernt sobald ein Button angeklickt wurde
            document
                .querySelectorAll(`.toggle-btn[data-group="${group}"]`)
                .forEach(btn => btn.classList.remove("active"));

                // "Active" wird gesetzt und für jede Gruppe entsprechend gespeichert
            this.classList.add("active");

            if (group === "reisestyle") reisestyle = this.dataset.value;
            if (group === "wasser") am_wasser = this.dataset.value;
            if (group === "ferienstil") ferienstil = this.dataset.value;
            if (group === "ferienlage") ferienlage = this.dataset.value;
            if (group === "ferienart") ferienart = this.dataset.value;
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


    // Überprüfen ob wählbare Eingaben getätigt wurden
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


    // Loading anzeigen
    loading.style.display = 'flex';
    btn.disabled = true;
    btn.innerText = "Bitte warten...";

    // Anfrage an Backend
    try {
        // Anzeige in der Konsole dass Suche gestartet wurde
        console.log("Anfrage gestartet")

        // Effektive Abfrage
        const response = await fetch(`${api_base_url}/img_request`, {
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

        // Auf die Antwort warten
        const data = await response.json();

        // Antwort in die Konsole schreiben
        console.log("Server Antwort:", data);

        // Antwort entschlüsselt
        const parsedAnswer = JSON.parse(data.answer);

        // Antwort in die Karte weitergeben als Liste
        renderCards(parsedAnswer.vorschlaege);

        // Fehler abfangen und in die Konsole schreiben
    } catch (e) {
        console.error("Fehler-Details:", e);
        alert("Fehler beim Request oder beim Verarbeiten der Daten");


        // Loading screen abbrechen und Button wieder freischalten
    } finally {
        loading.style.display = "none";
        btn.disabled = false;
        btn.innerText = "Search";
    }
}

async function get_img(stadt, land) {
    const response = await fetch(`${api_base_url}/img_request`, {
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
    // Antwort entschlüsselt
    return img_url;
}

// Karten anzeigen
function renderCards(vorschlaege) {
    const start_datum = document.getElementById('Start_Datum').value;
    const end_datum = document.getElementById('End_Datum').value;
    currentVorschlaege = vorschlaege;
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    // Karten in einer Vorschleife mit Index v anzeigen
    vorschlaege.forEach((v, index) => {
        resultDiv.innerHTML += `
            <div class="card"onclick="showDetails(${index})" style="cursor: pointer;">
                <div class="karten-titel">${v.stadt}, ${v.land}
                </div> 
                <div class="karten-datum">${start_datum} - ${end_datum}
                </div>
                <div class="karten-inhalt">
                Kosten: ${v.geschaetzte_kosten_chf} CHF --- Temperatur: ${v.average_temp_month_in_c}°C
                ${v.begruendung}</div>
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
    // Automatisch scrollen
    detailsDiv.scrollIntoView({behavior: 'smooth', block: 'start'});
}

