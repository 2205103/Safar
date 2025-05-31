for user search =>
url: http://localhost:3000/booking/search
POST Method JSON Body: 
{
  "fromcity": "Dhaka",
  "tocity": "Sirajgonj",
  "doj":"2025-05-29"
}

response JSON:
{
    "message": "Route details fetched successfully",
    "data": [
        {
            "train_name": "Sirajgonj Express",
            "classes": [
                {
                    "class_name": "2nd General",
                    "total_seat": 50,
                    "unavailable_seats": []
                },
                {
                    "class_name": "2nd Mail",
                    "total_seat": 52,
                    "unavailable_seats": []
                },
                {
                    "class_name": "Commuter",
                    "total_seat": 47,
                    "unavailable_seats": []
                },
                {
                    "class_name": "Sulav",
                    "total_seat": 38,
                    "unavailable_seats": []
                },
                {
                    "class_name": "Shovon",
                    "total_seat": 46,
                    "unavailable_seats": []
                },
                {
                    "class_name": "Shovon Chair",
                    "total_seat": 44,
                    "unavailable_seats": []
                },
                {
                    "class_name": "1st Chair/ Seat",
                    "total_seat": 35,
                    "unavailable_seats": []
                },
                {
                    "class_name": "1st Berth",
                    "total_seat": 54,
                    "unavailable_seats": []
                },
                {
                    "class_name": "Snigdha",
                    "total_seat": 41,
                    "unavailable_seats": []
                },
                {
                    "class_name": "AC seat",
                    "total_seat": 51,
                    "unavailable_seats": []
                }
            ]
        }
    ]
}

