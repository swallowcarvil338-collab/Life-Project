"""
XAUUSD Daily Bias Calculator
-----------------------------
Runs once a day (shortly after the new Daily candle forms on Twelve Data's
New York-based daily bars). Fetches the last few closed daily candles for
XAU/USD, applies the 3-candle bias rule agreed with the user, and writes
the result to bias.json so the PROJECT 21 website can display it.

Bias rules (candle1 = older reference candle, candle2 = candle right after it,
bias applies to candle3 = the day currently forming):

- No Bias:
    * candle2's high & low stay fully inside candle1's range (no touch), OR
    * candle2 sweeps BOTH sides of candle1 (high AND low)
- Reversal:
    * candle2 touches/wicks past ONE side only, but its CLOSE comes back
      inside candle1's range (does not break-and-hold beyond that level)
    * bias = opposite direction of the side that was swept
- Continuation:
    * candle2's BODY closes beyond ONE side only (real break, not just a
      wick), AND candle2's color matches the breakout direction
      (bullish candle for an upside break, bearish candle for a downside
      break)
    * bias = same direction as the breakout

Any combination that doesn't cleanly match one of the above (e.g. a body
break with a mismatched candle color) is conservatively labelled "No Bias".
"""

import json
import os
from datetime import datetime
from zoneinfo import ZoneInfo

import requests

API_KEY = os.environ.get("TWELVEDATA_API_KEY", "")
SYMBOL = "XAU/USD"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "bias.json")

HARI_ID = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']


def fetch_daily_candles(outputsize=6):
    url = "https://api.twelvedata.com/time_series"
    params = {
        "symbol": SYMBOL,
        "interval": "1day",
        "outputsize": outputsize,
        "apikey": API_KEY,
        "timezone": "America/New_York",
    }
    r = requests.get(url, params=params, timeout=20)
    r.raise_for_status()
    data = r.json()
    if data.get("status") != "ok" or "values" not in data:
        raise RuntimeError(f"Twelve Data error: {data}")
    return data["values"]  # sorted descending: most recent closed candle first


def determine_bias(c1, c2):
    o1, h1, l1, cl1 = (float(c1["open"]), float(c1["high"]), float(c1["low"]), float(c1["close"]))
    o2, h2, l2, cl2 = (float(c2["open"]), float(c2["high"]), float(c2["low"]), float(c2["close"]))

    swept_high = h2 > h1
    swept_low = l2 < l1
    is_bull2 = cl2 > o2
    is_bear2 = cl2 < o2

    if not swept_high and not swept_low:
        return "No Bias", "Candle kedua terkurung penuh di range candle pertama."
    if swept_high and swept_low:
        return "No Bias", "Candle kedua men-sweep kedua sisi candle pertama sekaligus."

    if swept_high and not swept_low:
        if cl2 > h1 and is_bull2:
            return "Bullish", "Continuation: body candle kedua break di atas high candle pertama dan candle-nya bullish."
        if cl2 <= h1:
            return "Bearish", "Reversal: high candle pertama di-sweep, close candle kedua balik masuk ke range candle pertama."
        return "No Bias", "Break di atas high candle pertama tapi warna candle tidak searah — kondisi tidak jelas."

    if swept_low and not swept_high:
        if cl2 < l1 and is_bear2:
            return "Bearish", "Continuation: body candle kedua break di bawah low candle pertama dan candle-nya bearish."
        if cl2 >= l1:
            return "Bullish", "Reversal: low candle pertama di-sweep, close candle kedua balik masuk ke range candle pertama."
        return "No Bias", "Break di bawah low candle pertama tapi warna candle tidak searah — kondisi tidak jelas."

    return "No Bias", "Kondisi tidak terklasifikasi."


def main():
    if not API_KEY:
        print("TWELVEDATA_API_KEY belum diset. Berhenti tanpa menulis bias.json.")
        return

    candles = fetch_daily_candles(outputsize=6)
    if len(candles) < 2:
        print("Data candle tidak cukup dari Twelve Data.")
        return

    c2 = candles[0]  # candle paling baru yang sudah closed
    c1 = candles[1]  # candle sebelum itu

    bias, reason = determine_bias(c1, c2)

    today_ny = datetime.now(ZoneInfo("America/New_York")).date()
    day_name = HARI_ID[today_ny.weekday()]
    date_str = today_ny.strftime("%d-%m-%Y")
    label = f"Bias hari {day_name}, {date_str}"

    result = {
        "label": label,
        "date": today_ny.isoformat(),
        "bias": bias,
        "reason": reason,
        "reference_candles": {
            "candle1_date": c1["datetime"],
            "candle2_date": c2["datetime"],
        },
        "updated_at": datetime.now(ZoneInfo("UTC")).isoformat(),
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(result, f, indent=2)

    print(f"{label}: {bias}")
    print(reason)


if __name__ == "__main__":
    main()
