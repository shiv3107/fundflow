# Mutual Fund Advisor App Plan (v5 - Full Stack with mftool)

To integrate real market data and historical returns, we are transitioning from a purely static frontend to a full-stack architecture. We will build a lightweight Python backend to fetch and serve real data to our frontend using the `mftool` library.

## Proposed Changes

### Backend (New)
#### [NEW] [backend/main.py](file:///c:/Users/Siri%20vennela/Desktop/shivu-antigravity/backend/main.py)
- Set up a Python FastAPI server.
- Utilize the `mftool` Python library to fetch real Mutual Fund data.
- **Endpoints**:
  - `GET /api/funds`: Returns our predefined list of top funds (mapped to our Equity/Debt/Hybrid categories), augmented with real, live data fetched via `mftool`:
    - Current NAV.
    - Historical Returns (e.g., 1Y or 3Y returns).
- Configure CORS (Cross-Origin Resource Sharing) so the frontend can call the backend.
#### [NEW] [backend/requirements.txt](file:///c:/Users/Siri%20vennela/Desktop/shivu-antigravity/backend/requirements.txt)
- Dependencies: `fastapi`, `uvicorn`, `mftool`.

### Frontend
#### [MODIFY] [app.js](file:///c:/Users/Siri%20vennela/Desktop/shivu-antigravity/app.js)
- Remove the hardcoded `mutualFunds` array.
- Implement an async `fetchFunds()` function that calls `http://127.0.0.1:8000/api/funds` when the app loads.
- Add a loading state to the Dashboard and Recommendations view while the data is being fetched.
- Ensure the recommendation engine uses the newly fetched real data (NAV and real Returns) to populate the UI.

#### [MODIFY] [style.css](file:///c:/Users/Siri%20vennela/Desktop/shivu-antigravity/style.css)
- Add CSS for a loading spinner/overlay to be displayed while waiting for the backend API.

## Verification Plan

### Automated/System Verification
- Run `pip install -r backend/requirements.txt`.
- Start the backend server: `uvicorn backend.main:app --reload`.

### Manual Verification
1. Ensure the Python backend is running.
2. Open `index.html` in the browser.
3. Verify that a loading state appears briefly.
4. Open the Network tab and verify a successful call to `/api/funds`.
5. Click "Today's Top 3 For You".
6. Verify that the recommendation cards now display real 3Y Returns and Live NAV data sourced from `mftool`.
