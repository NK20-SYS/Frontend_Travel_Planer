from google import genai
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from google.genai import types
from pydantic import BaseModel
from typing import List

app = Flask(__name__)
CORS(app) #Kommunikation Frontend Backend

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client(api_key="")
# Model der KIi
MODEL_ID = "gemini-3-flash-preview"

#Aufruf des Index files
@app.route('/')
def index():
    return render_template('index.html')

#Class Antworten Schema für di KI
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
#Erstellung einer Liste für die 3 Antwortmöglichkeiten
class ReiseEmpfehlungen(BaseModel):
    vorschlaege: List[ReiseAntwort]

#Aufruf der Funktion vom Frontend search button
@app.route('/request',methods=['POST'])
def get_travel_recommendations():
    #Variablen übernahme aus dem Frontend
    data = request.json
    budget = data.get("budget" "")
    startdatum = data.get("start_datum" "")
    enddatum = data.get("end_datum" "")
    temperatur = data.get("temperatur" "")
    wassernaehe = data.get("am_wasser" "")
    reise_stil = data.get("reisestyle" "")

    #Sendung des Prompts an die KI
    try:
        prompt = f"Ich plane eine Reise ab Zuerich. Vom {startdatum} bis {enddatum},Budget von {budget} fr.-. Temperatur: {temperatur} In Wassernähe: {wassernaehe} Reisestyl: {reise_stil} Gebe exakt 3 Vorschlaege"
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            #Configuration der erwartende Antwort
            config={
                'response_mime_type': 'application/json',
                'response_schema': ReiseEmpfehlungen,
                'temperature': 0.3,
            }
        )
        #Rückgabe an das Frontend in Jason format
        return jsonify({"answer": response.text})
    except Exception as e:
        print(f"Fehler: {e}")


if __name__ == "__main__":
    app.run(debug=True, port = 5000)
