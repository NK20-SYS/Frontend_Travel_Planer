from google import genai
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from google.genai import types
from pydantic import BaseModel
from typing import List

app = Flask(__name__)
CORS(app) #Kommunikation Frontend Backend

@app.route('/')
def index():
    return render_template('index.html')
# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client(api_key="")
MODEL_ID = "gemini-3-flash-preview"

class ReiseAntwort(BaseModel):
    stadt: str
    land: str
    begruendung: str
    geschaetzte_kosten_chf: int
    average_temp_month_in_c: float
    average_niederschlag_month_in_mm: int
    average_Sonnenstunden_month_in_h: int
    wasser_in_20km_radius: bool
    closest_water_temp_in_c: float
    transportmittel: str
    unterkunft_art: str

class ReiseEmpfehlungen(BaseModel):
    vorschlaege: List[ReiseAntwort]

@app.route('/request',methods=['POST'])
def get_travel_recommendations():
    data = request.json
    budget = data.get("budget" "")
    startdatum = data.get("start_datum" "")
    enddatum = data.get("end_datum" "")
    temperatur = data.get("temperatur" "")
    wassernaehe = data.get("am_wasser" "")
    reise_stil = data.get("reisestyle" "")
    try:
        #startdatum = input("Welches Start datum möchtest du gehen")
        #enddatum = input("Welches End datum möchtest du zurück kommen")
        #budget = int(input("Was ist dein Budget? "))
        #temperatur = input("Was ist dein bevorzugte Temperatur? ")
        #wassernaehe = input("Mochtest du am wasser Ferien machen?")
        #reise_stil = input("Was ist dein Reise styl? Comfort, Luxus, adventourus, Budget, Umweltfreundlich")
        prompt = f"Ich plane eine Reise ab Zuerich. Vom {startdatum} bis {enddatum},Budget von {budget} fr.-. Temperatur: {temperatur} In Wassernähe: {wassernaehe} Reisestyl: {reise_stil} Gebe exakt 3 Vorschlaege"
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': ReiseEmpfehlungen,
                'temperature': 0.3,
            }
        )

        reise_daten = response.parsed

        print(f"--- Deine Reisevorschläge mit Budget von {budget} fr.-. ---")
        for i, option in enumerate(reise_daten.vorschlaege, start=1):
            print(f"Dies ist Option {i}")
            print(f"Gehe nach: {option.land}")
            print(f"In die Stadt: {option.stadt}")
            print(f"Ungefaeres Budget: {option.geschaetzte_kosten_chf}")
            print(f"Art der Unterkunft: {option.unterkunft_art}")
            print(f"Transportmittel: {option.transportmittel}")
            print(f"---Wetter Daten---")
            print(f"Durchschnitt Temp: {option.average_temp_month_in_c} C°")
            print(f"Durchschnitt Niederschlag: {option.average_niederschlag_month_in_mm} mm")
            print(f"Durchschnitt Sonnenstunden: {option.average_Sonnenstunden_month_in_h} h")
            if option.wasser_in_20km_radius:
                print(f"Wassertemperatur: {option.closest_water_temp_in_c} C°")
            print(f"----------------------")
            print(f"Warum? {option.begruendung}")
            print(f"----------------------")
            print("")

        return jsonify({"answer": response.text})
    except Exception as e:
        print(f"Fehler: {e}")


if __name__ == "__main__":
    app.run(debug=True, port = 5000)
