http://localhost:3000/booking/getTicket
GET request JSON
{
    "ticket_id" : "30"
}


result JSON:

[
    {
        "train_code": "Subarna Express",
        "class_code": "2nd Mail",
        "from": "Dhaka",
        "to": "Tangail",
        "seats": [
            2
        ]
    },
    {
        "train_code": "Subarna Express",
        "class_code": "2nd General",
        "from": "Dhaka",
        "to": "Tangail",
        "seats": [
            2
        ]
    }
]
