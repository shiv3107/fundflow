from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mftool import Mftool
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mf = Mftool()

# Predefined list of real Indian Mutual Funds mapped to our categories
FUND_CONFIG = [
    # Equity (High Risk)
    {"code": "120465", "category": "Equity", "risk": "high"}, # SBI Small Cap
    {"code": "122639", "category": "Equity", "risk": "high"}, # Parag Parikh Flexi Cap
    {"code": "120503", "category": "Equity", "risk": "high"}, # Nippon India Growth
    # Hybrid (Medium Risk)
    {"code": "118989", "category": "Hybrid", "risk": "medium"}, # ICICI Pru Equity & Debt
    {"code": "118968", "category": "Hybrid", "risk": "medium"}, # ICICI Pru Balanced Advantage
    {"code": "100371", "category": "Hybrid", "risk": "medium"}, # HDFC Balanced Advantage
    # Debt (Low Risk)
    {"code": "119062", "category": "Debt", "risk": "low"}, # HDFC Liquid Fund
    {"code": "119598", "category": "Debt", "risk": "low"}, # SBI Magnum Gilt Fund
    {"code": "105741", "category": "Debt", "risk": "low"}  # Kotak Liquid Fund
]

@app.get("/api/funds")
def get_funds():
    funds_data = []
    for config in FUND_CONFIG:
        code = config["code"]
        try:
            # Fetch live scheme details
            details = mf.get_scheme_quote(code)
            if details:
                nav = details.get("nav", "N/A")
                name = details.get("scheme_name", "Unknown Scheme")
                funds_data.append({
                    "id": code,
                    "name": name,
                    "category": config["category"],
                    "risk": config["risk"],
                    "nav": nav,
                    # We pass the live NAV as a string to display in the UI instead of static 3Y returns
                    "returns3Y": f"₹{nav}" 
                })
        except Exception as e:
            print(f"Error fetching {code}: {e}")
            pass
            
    return funds_data
