http://localhost:3000/booking/getTicket
POST
Header =>{
authorization : 
}

Body =>

{
    "ticket_id" : "30"
}


result JSON:

{
    "train_code": 702,
    "train_name": "Subarna Express",
    "From": "Dhaka",
    "To": "Feni",
    "Journey_date": "2025-08-30T18:00:00.000Z",
    "Seat_details": [
        {
            "class_code": "2nd General",
            "seats": [
                1,
                11
            ]
        },
        {
            "class_code": "2nd Mail",
            "seats": [
                2
            ]
        }
    ],
    "total_cost": 140
}
