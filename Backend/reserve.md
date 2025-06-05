http://localhost:3000/booking/reserve
POST
Header => {
"Authorization" : "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJpYXQiOjE3NDkwNzQyNTQsImV4cCI6MTc0OTA3Nzg1NH0.j-KiefXtkqMfjbNMXC_zjTUHROI4OJTJwIy3hc8wYTA"
}

Body => 
{
    "Train_Code": "702",
    "Date": "2025-09-1",
    "From_Station": "Banani",
    "To_Station": "Feni",
    "Seat_Details" : 
    [
        {
        "Class_Code": "1",
        "Seat_Number": "2"
        },
        {
        "Class_Code": "1",
        "Seat_Number": "22"
        },
        {
        "Class_Code": "2",
        "Seat_Number": "1"
        }
    ]
}



Response JSON
{
    "message": "Ticket created successfully",
    "ticket_id": 7
}
