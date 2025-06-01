http://localhost:3000/booking/reserve

POST Method
JSON
  {
    "Train_Code": "701",
    "Class_Code": "1",
    "Seat_Number": "1",
    "Date": "2025-08-31",
    "From_Station": "SAMI",
    "To_Station": "SARWAR"
  }

returned JSON
{
    "message": "Ticket created successfully",
    "ticket_id": 10
}
