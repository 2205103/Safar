# Siren, A Railway E-Ticket System
This project, Siren, is a comprehensive Railway E-Ticket System developed using PostgreSQL, React, and Node.js. The system is designed to handle various functionalities of a railway ticket booking platform, including user registration, ticket booking, payment integration, and ticket management.

## Features
* User Authentication: Secure login and registration process for users.
* Ticket Booking: Allows users to search for trains, select routes, and book tickets.
* Payment System Integration: Seamlessly integrates payment methods for ticket purchase.
* Admin Panel: Enables admins to manage train schedules, bookings, and users.
* CSV Data Imports: Utilizes pre-generated CSV files for easy population of the database with real-world data.

## Data
The project comes with Excel and CSV files containing sample data which can be used to populate the system's database. There are also Python scripts that extract values from these files and generate the corresponding CSV files required for importing data into PostgreSQL.

Included:
* Excel files containing initial train schedules, booking data, and user details.
* Python code that processes Excel files and outputs structured CSV files.
* Dummy CSV files to demonstrate how the data is structured in the database.

## Technologies Used
* Frontend: React
* Backend: Node.js
* Database: PostgreSQL
* Python: For data extraction and CSV generation

Project Partner: 
## Anika Morshed (2105068)
[GitHub](https://github.com/Anika-34)

Dept. of Computer Science and Engineering

Bangladesh University of Engineering and Technology

This Project was built for the course Database Sessional (CSE 216) of the session July, 2023.

A brief demonstration of the web application in action:

## User End
Home Page-
![image_2025-03-19_00-01-17 (3)](https://github.com/user-attachments/assets/74b51155-3569-47fb-bac8-2f899aead975)
![image](https://github.com/user-attachments/assets/727f9bd1-a676-4f7c-962b-d0df2810b476)

List of Trains and their schedules-
![image](https://github.com/user-attachments/assets/8b18f350-b36a-49b5-8b71-b73e7b6a7df6)
![image](https://github.com/user-attachments/assets/7c7fad73-784a-4844-b69a-8a80ccf3989c)
![image](https://github.com/user-attachments/assets/5d022bc6-033c-4e31-be19-68c87e1db232)


Searching Trains as per requirement-
![image_2025-03-19_00-04-58](https://github.com/user-attachments/assets/c4019bce-df71-4b4e-b4c6-d4ec3c1793b7)
![image_2025-03-19_00-05-09](https://github.com/user-attachments/assets/60be5054-382c-43b1-bb11-94b69eb3720e)

Available Coaches/Classes and seats are seen here-
![image_2025-03-19_00-05-32](https://github.com/user-attachments/assets/4f11cf9e-c75d-4f06-90ce-472c890aea98)

Selecting Seats(selected seats by the user are highlighted in green) & Bill Updating automatically-
![image_2025-03-19_00-06-00](https://github.com/user-attachments/assets/86836550-ca00-4808-97c0-49ee8af0644e)

Booked seats unavailble for rebooking by other users-
![image_2025-03-19_00-17-43](https://github.com/user-attachments/assets/0f2ae9a1-70d2-4312-81ec-9a6a70eb3697)

Proceeding to book (dummy payment methods are added)-
![image_2025-03-19_00-06-20](https://github.com/user-attachments/assets/c54e2405-d13c-4175-a72b-275468cb382e)

Sign Up & Sign In-
![image_2025-03-19_00-03-10](https://github.com/user-attachments/assets/8e2e98c8-9c35-47b9-9e87-fbc455ee1bdf)
![image_2025-03-19_00-03-21](https://github.com/user-attachments/assets/2b397057-f133-4aef-8307-220a3d26746e)
![image_2025-03-19_00-03-46](https://github.com/user-attachments/assets/89c98d8e-520b-4bea-bc37-5a1cfda10577)
![image_2025-03-19_00-03-52](https://github.com/user-attachments/assets/6041e967-1cd9-4103-9343-168e19fcfc1d)

User Dashboard-
![image_2025-03-19_00-04-06](https://github.com/user-attachments/assets/069f9ef1-e943-4870-98bd-16e36a169937)
![image_2025-03-19_00-04-14](https://github.com/user-attachments/assets/64205359-cb7b-45dd-a3f9-9323c6bda8b8)

Ticket History accessible from User Dashboard, as well as Refund(before a certain period of the journey), Review(after journey is completed) options-
![image_2025-03-19_00-04-23](https://github.com/user-attachments/assets/b17571ed-9e66-4ab2-8810-d03111f589cd)
![image](https://github.com/user-attachments/assets/b74fbc51-c6be-416e-b9b8-aa4dba1a428e)

Sucessful Refunding-
![image](https://github.com/user-attachments/assets/51663361-5e21-4c47-b0bc-508730a7c87c)

Reviewing: User can check reviews before booking while browsing/searching trains-
![image](https://github.com/user-attachments/assets/a8b5a55d-de01-4316-8971-e432ba1e706e)
![image](https://github.com/user-attachments/assets/6bdd4f23-ca74-4bbc-9677-627e841aef67)

## Admin End
Admin end allows adding new trains to run on the existing routes/tracks-
![image](https://github.com/user-attachments/assets/07e5d4b8-9105-4b4e-825d-b12de7c571b6)
![image](https://github.com/user-attachments/assets/56151f5f-6de6-4078-aa36-7fe79d4e4a0d)

Clicking "Add" allows to schedule when the train stops at different stops and how many classes the train will have(along with seats in different classes/coaches)-
![image](https://github.com/user-attachments/assets/dc1a0ad5-a49c-44e9-aa43-f1d61659a89c)
![image](https://github.com/user-attachments/assets/1a107e18-d41e-43d6-8043-9ce3bf1af7ed)

![image](https://github.com/user-attachments/assets/4058ac2a-140b-4ff6-8477-bf5e3ab99ceb)
![image](https://github.com/user-attachments/assets/44c5912e-9ada-4369-94a7-319d2c1e0038)

Now that train is available for searching and booking-
![image](https://github.com/user-attachments/assets/e02b1513-5f7f-45f8-a0a9-7ad1c53528e9)
![image](https://github.com/user-attachments/assets/79860781-491e-4f15-a244-f499bfeeb96a)

New routes can be added too with a new route ID and adding a name and the stations which updates the database accordingly-
![image](https://github.com/user-attachments/assets/e5e93fdf-aba4-4b36-910b-744aa5852386)




