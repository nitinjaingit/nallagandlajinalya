import argparse
import csv
import json
import re
import threading
from datetime import date
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HEADERS = [
    "BidMasterID",
    "BidName",
    "BidType",
    "StartDate",
    "EndDate",
    "StartingAmountINR",
    "WinnerCapacity",
    "DisplayOrder",
    "IsActive",
    "Status",
    "Description",
]
VALID_TYPES = {"Daily", "Special"}
VALID_ACTIVE = {"Yes", "No"}
VALID_STATUSES = {"Draft", "Published", "Closed", "Cancelled"}
WRITE_LOCK = threading.Lock()


def clean_text(value, field, maximum, required=False):
    text = str(value or "").strip()
    if required and not text:
        raise ValueError(f"{field} is required.")
    if len(text) > maximum:
        raise ValueError(f"{field} must be {maximum} characters or fewer.")
    if "\x00" in text:
        raise ValueError(f"{field} contains an invalid character.")
    if text.startswith(("=", "+", "-", "@")):
        raise ValueError(f"{field} cannot start with =, +, -, or @.")
    return text


def positive_integer(value, field, minimum):
    try:
        number = int(str(value))
    except (TypeError, ValueError) as error:
        raise ValueError(f"{field} must be a whole number.") from error
    if number < minimum:
        raise ValueError(f"{field} must be at least {minimum}.")
    return str(number)


def iso_date(value, field):
    try:
        return date.fromisoformat(str(value)).isoformat()
    except ValueError as error:
        raise ValueError(f"{field} must be a valid date.") from error


def validate_bid(payload):
    bid_type = str(payload.get("BidType", ""))
    if bid_type not in VALID_TYPES:
        raise ValueError("Bid type must be Daily or Special.")

    start_date = iso_date(payload.get("StartDate"), "Start date")
    end_date = iso_date(payload.get("EndDate"), "End date")
    if bid_type == "Special":
        end_date = start_date
    if end_date < start_date:
        raise ValueError("End date cannot be before start date.")

    active = str(payload.get("IsActive", ""))
    status = str(payload.get("Status", ""))
    if active not in VALID_ACTIVE:
        raise ValueError("Active must be Yes or No.")
    if status not in VALID_STATUSES:
        raise ValueError("Status is invalid.")

    return {
        "BidName": clean_text(payload.get("BidName"), "Bid name", 100, required=True),
        "BidType": bid_type,
        "StartDate": start_date,
        "EndDate": end_date,
        "StartingAmountINR": positive_integer(payload.get("StartingAmountINR"), "Starting amount", 0),
        "WinnerCapacity": positive_integer(payload.get("WinnerCapacity"), "Winner capacity", 1),
        "DisplayOrder": positive_integer(payload.get("DisplayOrder"), "Display order", 1),
        "IsActive": active,
        "Status": status,
        "Description": clean_text(payload.get("Description"), "Description", 300),
    }


def append_bid(csv_path, payload):
    record = validate_bid(payload)
    with WRITE_LOCK:
        with csv_path.open("r", encoding="utf-8-sig", newline="") as source:
            reader = csv.DictReader(source)
            if reader.fieldnames != HEADERS:
                raise ValueError("bid-master.csv has an unexpected header format.")
            rows = list(reader)

        highest_id = 0
        for row in rows:
            match = re.fullmatch(r"BM-(\d+)", row.get("BidMasterID", ""))
            if match:
                highest_id = max(highest_id, int(match.group(1)))
        record = {"BidMasterID": f"BM-{highest_id + 1:03d}", **record}

        temporary_path = csv_path.with_suffix(".csv.tmp")
        with temporary_path.open("w", encoding="utf-8", newline="") as destination:
            writer = csv.DictWriter(destination, fieldnames=HEADERS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
            writer.writerow(record)
        temporary_path.replace(csv_path)
    return record


def update_bid(csv_path, bid_master_id, payload):
    if not re.fullmatch(r"BM-\d+", bid_master_id):
        raise ValueError("Bid master ID is invalid.")
    record = {"BidMasterID": bid_master_id, **validate_bid(payload)}
    with WRITE_LOCK:
        with csv_path.open("r", encoding="utf-8-sig", newline="") as source:
            reader = csv.DictReader(source)
            if reader.fieldnames != HEADERS:
                raise ValueError("bid-master.csv has an unexpected header format.")
            rows = list(reader)

        matching_indexes = [index for index, row in enumerate(rows) if row.get("BidMasterID") == bid_master_id]
        if not matching_indexes:
            raise LookupError("Bid master record was not found.")
        if len(matching_indexes) > 1:
            raise ValueError("Bid master CSV contains duplicate IDs.")
        rows[matching_indexes[0]] = record

        temporary_path = csv_path.with_suffix(".csv.tmp")
        with temporary_path.open("w", encoding="utf-8", newline="") as destination:
            writer = csv.DictWriter(destination, fieldnames=HEADERS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
        temporary_path.replace(csv_path)
    return record


class BidRequestHandler(SimpleHTTPRequestHandler):
    bid_master_path = Path(__file__).with_name("bid-master.csv")

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path.rstrip("/") != "/bids/api/bid-master":
            self.send_json(404, {"error": "Endpoint not found."})
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 16_384:
                raise ValueError("Request body is missing or too large.")
            payload = json.loads(self.rfile.read(content_length))
            if not isinstance(payload, dict):
                raise ValueError("Request body must be an object.")
            self.send_json(201, append_bid(self.bid_master_path, payload))
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})
        except OSError:
            self.send_json(500, {"error": "Bid master data could not be saved."})

    def do_PUT(self):
        match = re.fullmatch(r"/bids/api/bid-master/(BM-\d+)/?", self.path)
        if not match:
            self.send_json(404, {"error": "Endpoint not found."})
            return
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0 or content_length > 16_384:
                raise ValueError("Request body is missing or too large.")
            payload = json.loads(self.rfile.read(content_length))
            if not isinstance(payload, dict):
                raise ValueError("Request body must be an object.")
            self.send_json(200, update_bid(self.bid_master_path, match.group(1), payload))
        except LookupError as error:
            self.send_json(404, {"error": str(error)})
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})
        except OSError:
            self.send_json(500, {"error": "Bid master data could not be saved."})


def main():
    parser = argparse.ArgumentParser(description="Serve the temple website with the bid CSV API.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8091, type=int)
    args = parser.parse_args()
    website_root = Path(__file__).resolve().parent.parent
    handler = lambda *handler_args, **handler_kwargs: BidRequestHandler(
        *handler_args, directory=str(website_root), **handler_kwargs
    )
    server = ThreadingHTTPServer((args.host, args.port), handler)
    print(f"Serving bid application at http://{args.host}:{args.port}/bids/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()