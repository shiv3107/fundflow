# Mutual Fund Advisor App (Full-Stack Real Market Integration)

We have successfully migrated the application from a purely static, mocked frontend into a full-stack architecture that fetches real, live Net Asset Values (NAV) for top Indian Mutual Funds.

## What Was Built

### 1. Python FastAPI Backend ([backend/main.py](file:///c:/Users/Siri%20vennela/Desktop/shivu-antigravity/backend/main.py))
- Created a robust API server using `FastAPI`.
- Integrated the `mftool` Python library to communicate directly with AMFI data endpoints.
- Built a single `/api/funds` endpoint that iterates over our curated list of scheme codes (e.g., SBI Small Cap, HDFC Liquid) and returns their Live NAVs in real-time.

### 2. Frontend Integration ([app.js](file:///c:/Users/Siri%20vennela/Desktop/shivu-antigravity/app.js))
- The frontend now performs an asynchronous HTTP request to the Python backend upon loading.
- Replaced the hardcoded static `3Y Returns` metric on the recommendation cards with the **Live NAV**.
- **Enhanced Investment Math**: When you click "Invest", the frontend now calculates the exact number of units you purchased using the real Live NAV (`Amount / NAV`) and presents this in the success message!

## How to Test

Since the app now relies on a Python backend, you need to start the server before opening the HTML file.

**Step 1: Start the Backend Server**
Open a terminal in your workspace folder (`c:\Users\Siri vennela\Desktop\shivu-antigravity`) and run the following commands:
```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
You should see a message stating the server is running on `http://127.0.0.1:8000`.

**Step 2: Test the Frontend**
1. Open `index.html` in your browser.
2. Click **Get Started**.
3. Wait a brief second for the funds to be fetched from the Python API in the background.
4. Click **Today's Top 3 For You**.
5. Observe that the recommendation cards now display real **Live NAVs**.
6. Enter an amount and click **Invest**. Notice the success message detailing exactly how many units you acquired at the live market rate!
