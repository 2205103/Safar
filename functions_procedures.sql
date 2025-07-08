-- function for offer eligibility
CREATE OR REPLACE FUNCTION get_eligible_offers(ticket_count INTEGER)
RETURNS TABLE (
    offer_id INT,
    offer_criteria INT,
    offer_description VARCHAR,
    offer_pct DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.offer_id, o.offer_criteria, o.offer_description, o.offer_pct
    FROM offer o
    WHERE o.offer_criteria <= ticket_count;
END;
$$ LANGUAGE plpgsql;




-- ticket insert function
CREATE OR REPLACE FUNCTION insert_ticket(
    user_id INTEGER,
    boarding_station_id INTEGER,
    destination_station_id INTEGER,
    price DECIMAL(10, 2),
    transaction_id INTEGER,
    seat_id INTEGER,
    route_id INTEGER,
    journey_date DATE,
    station_sequence INTEGER[]
)
RETURNS VOID AS $$
BEGIN
    
    FOR i IN 1 .. array_length(station_sequence, 1) LOOP
        UPDATE seat_availability
        SET available = FALSE
        WHERE seat_availability.seat_id = insert_ticket.seat_id
        AND seat_availability.travel_date = journey_date
        AND seat_availability.station_id = station_sequence[i];
    END LOOP;

    IF transaction_id < 0 THEN
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id, seat_id, date_of_journey)
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'pending', transaction_id, seat_id, journey_date);
    ELSE
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id, seat_id, date_of_journey)
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'confirmed', transaction_id, seat_id, journey_date);
    END IF;
  
END;
$$ LANGUAGE plpgsql;



-- transaction insert function
CREATE OR REPLACE FUNCTION insert_transaction(
    transaction_id INTEGER,
    mode_of_transaction VARCHAR(50),
    offer_id INTEGER,
    amount DECIMAL(10, 2),
    user_id INTEGER
)
RETURNS transaction AS $$
DECLARE
    transaction_time TIMESTAMP := now();
    received INTEGER;
    new_transaction transaction; 
BEGIN
    if transaction_id IS NULL THEN
        received := 0;
        transaction_id := nextval('negative_transaction_id_seq');
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        RETURNING * INTO new_transaction; 
    ELSE
        received := 1;
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        RETURNING * INTO new_transaction; 
    END IF;
    
    RETURN new_transaction; 
END;
$$ LANGUAGE plpgsql;


CREATE SEQUENCE negative_transaction_id_seq
    START WITH -1  
    INCREMENT BY -1; 

-- drop function insert_ticket_transaction;


--station sequence finding function
CREATE OR REPLACE FUNCTION get_station_sequence(route_id_input INT)
RETURNS TABLE(
    route_id INT,
    station_id INT,
    sequence_number INT,
    station_name varchar(50)
) AS $$
BEGIN
    RETURN QUERY WITH RECURSIVE StationSequence AS (
        SELECT 
            rs.route_id,
            rs.station_id,
            rs.sequence_number,
            s.station_name
        FROM 
            route_stations rs
        JOIN 
            station s ON rs.station_id = s.station_id
        WHERE 
            rs.route_id = route_id_input
        UNION ALL
        SELECT 
            rs.route_id,
            rs.station_id,
            rs.sequence_number,
            s.station_name
        FROM 
            route_stations rs
        JOIN 
            StationSequence ss ON rs.route_id = ss.route_id AND rs.sequence_number = ss.sequence_number + 1
        JOIN 
            station s ON rs.station_id = s.station_id
    )
    SELECT DISTINCT * FROM StationSequence
    ORDER BY sequence_number;
END;
$$ LANGUAGE plpgsql;




------------------populate the seat availability table

-- CREATE OR REPLACE PROCEDURE populate_seat_availability()
-- LANGUAGE plpgsql
-- AS $$
-- BEGIN
--   DELETE FROM seat_availability WHERE travel_date < CURRENT_DATE;

--   IF NOT EXISTS (SELECT 1 FROM seat_availability WHERE travel_date = CURRENT_DATE + INTERVAL '1 day') THEN
--     INSERT INTO seat_availability (seat_id, travel_date, station_id, available)
--     SELECT seat.seat_id, CURRENT_DATE + INTERVAL '1 day', route_stations.station_id, TRUE
--     FROM seat
--     JOIN route_stations ON seat.route_id = route_stations.route_id
--     WHERE NOT EXISTS (
--       SELECT 1 
--       FROM seat_availability 
--       WHERE seat_availability.seat_id = seat.seat_id 
--       AND seat_availability.travel_date = CURRENT_DATE + INTERVAL '1 day'
--       AND seat_availability.station_id = route_stations.station_id
--     );
--   END IF;
-- END;
-- $$;

CREATE OR REPLACE PROCEDURE populate_seat_availability()
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM seat_availability WHERE travel_date < CURRENT_DATE;

  FOR i IN 0..2 LOOP
    IF NOT EXISTS (SELECT 1 FROM seat_availability WHERE travel_date = CURRENT_DATE + i) THEN
      INSERT INTO seat_availability (seat_id, travel_date, station_id, available)
      SELECT seat.seat_id, CURRENT_DATE + i, route_stations.station_id, TRUE
      FROM seat
      JOIN route_stations ON seat.route_id = route_stations.route_id
      WHERE NOT EXISTS (
        SELECT 1 
        FROM seat_availability 
        WHERE seat_availability.seat_id = seat.seat_id 
        AND seat_availability.travel_date = CURRENT_DATE + i
        AND seat_availability.station_id = route_stations.station_id
      );
    END IF;
  END LOOP;
END;
$$;

---------------------
CREATE OR REPLACE PROCEDURE populate_seat_availability_new(train_id_input INTEGER)
LANGUAGE plpgsql
AS $$
BEGIN
  FOR i IN 0..2 LOOP
    INSERT INTO seat_availability (seat_id, travel_date, station_id, available)
    SELECT seat.seat_id, CURRENT_DATE + i, route_stations.station_id, TRUE
    FROM seat
    JOIN route_stations ON seat.route_id = route_stations.route_id
    WHERE seat.train_id = train_id_input
    AND NOT EXISTS (
      SELECT 1 
      FROM seat_availability 
      WHERE seat_availability.seat_id = seat.seat_id 
      AND seat_availability.travel_date = CURRENT_DATE + i
      AND seat_availability.station_id = route_stations.station_id
    );
  END LOOP;
END;
$$;
----------------------



-- refunding

CREATE OR REPLACE PROCEDURE refund_tickets(user_id1 INTEGER, transaction_id1 INTEGER) 
LANGUAGE plpgsql
AS $$
DECLARE
    refund_amt DECIMAL(10, 2);
BEGIN
    SELECT amount * 0.8 INTO refund_amt
    FROM "transaction"
    WHERE transaction_id = transaction_id1;
    
    INSERT INTO refund (transaction_id, refund_time, refund_amount)
    VALUES (transaction_id1, NOW(), refund_amt);

    
    UPDATE seat_availability sa
    SET available = 'TRUE'
    FROM ticket t 
    WHERE sa.seat_id = t.seat_id 
    AND t.transaction_id = transaction_id1
    AND t.user_id = user_id1;

    UPDATE ticket SET ticket_status = 'cancelled'
    WHERE user_id = user_id1 AND transaction_id = transaction_id1;

    UPDATE "transaction" SET received = 0
    WHERE transaction_id = transaction_id1;
   
END;
$$;


--procedure to auto cancel tickets
CREATE OR REPLACE PROCEDURE update_ticket_status(userId IN INTEGER)
AS $$
DECLARE
trans_row RECORD;
BEGIN
    FOR trans_row IN 
        SELECT * FROM transaction WHERE received = 0 and user_id = userId
    LOOP
        IF trans_row.transaction_time + INTERVAL '12 hours' < CURRENT_TIMESTAMP THEN
            UPDATE ticket SET ticket_status = 'cancelled'
            WHERE transaction_id = trans_row.transaction_id;
        END IF;
    END LOOP;
END;
$$
LANGUAGE plpgsql;
 







-- procedure for checking admin side train addition
CREATE OR REPLACE PROCEDURE add_train(train_id_input INT, train_name_input VARCHAR, route_id_input INT)
LANGUAGE plpgsql
AS $$
DECLARE
    t_id INTEGER;
    t_name VARCHAR(100);
    r_id INTEGER;
BEGIN
    t_id := null;
    t_name := null;
    r_id := null;
    SELECT train_id  INTO t_id FROM train WHERE train_id = train_id_input;
    SELECT route_id INTO r_id FROM train_routes WHERE route_id = route_id_input;
    SELECT train_name INTO t_name FROM train WHERE UPPER(train_name) = UPPER(train_name_input);

    IF t_id is not null AND t_name is not null AND r_id is not null THEN
        RAISE EXCEPTION 'Train already exists' USING ERRCODE = 'XX010';
    END IF;
    IF t_id is not null AND t_name is null THEN
        RAISE EXCEPTION 'ID and Name mismatch' USING ERRCODE = 'XX013';
    END IF;
    IF t_id is null AND t_name is not null THEN
        RAISE EXCEPTION 'Duplicate Train Name not allowed' USING ERRCODE = 'XX011';
    END IF;
    IF t_id is not null AND r_id is not null THEN
        RAISE EXCEPTION 'Train already has this route' USING ERRCODE = 'XX012';
    END IF;
END;
$$;





-- procedure for inserting new train


-- CREATE OR REPLACE PROCEDURE add_route_train(train_id_input INT, train_name_input VARCHAR, route_id_input INT, route_name_input VARCHAR )
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE
    
-- BEGIN
--     INSERT INTO train (train_id, train_name) VALUES (train_id_input, train_name_input);
--     INSERT INTO route (route_id, route_name) VALUES (route_id_input, route_name_input);
--     INSERT INTO train_routes (train_id, route_id) VALUES (train_id_input, route_id_input);
-- END;
-- $$;

CREATE OR REPLACE PROCEDURE add_route_train(train_id_input INT, train_name_input VARCHAR, route_id_input INT, route_name_input VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO train (train_id, train_name) VALUES (train_id_input, train_name_input);

    BEGIN
        INSERT INTO route (route_id, route_name) VALUES (route_id_input, route_name_input);
    EXCEPTION
        WHEN unique_violation THEN
            NULL;
    END;

    INSERT INTO train_routes (train_id, route_id) VALUES (train_id_input, route_id_input);
END;
$$;


-- CREATE OR REPLACE PROCEDURE insert_class_schedule(train_id_input INT, train_name_input VARCHAR, route_id_input INT, station_ids_input INT[], class_ids_input INT[], arrival_time_input TIME[], departure_time_input TIME[], seat_count INT[])
-- LANGUAGE plpgsql
-- AS $$
-- DECLARE 
--     i INT;
-- BEGIN
--     FOR i IN 1 .. array_length(class_ids_input, 1) LOOP
--         INSERT INTO train_class (train_id, class_id, seat_count) VALUES (train_id_input, class_ids_input[i], seat_count[i]);

--         INSERT INTO seat (train_id, class_id, route_id, seat_number) SELECT train_id_input, class_ids_input[i], route_id_input, generate_series(1, seat_count[i])::text;
        
--     END LOOP;

--     FOR i IN 1 .. array_length(station_ids_input, 1) LOOP
--         INSERT INTO route_stations (route_id, station_id, sequence_number) VALUES (route_id_input, station_ids_input[i], i);

--         INSERT INTO schedule (train_id, station_id, route_id, arrival, departure) 
--         VALUES (train_id_input, station_ids_input[i], route_id_input, arrival_time_input[i], departure_time_input[i]);
--     END LOOP;
-- END;
-- $$;


CREATE OR REPLACE PROCEDURE insert_class_schedule(train_id_input INT, train_name_input VARCHAR, route_id_input INT, station_ids_input INT[], class_ids_input INT[], arrival_time_input TIME[], departure_time_input TIME[], seat_count INT[])
LANGUAGE plpgsql
AS $$
DECLARE 
    i INT;
    station_count INT;
BEGIN
    FOR i IN 1 .. array_length(class_ids_input, 1) LOOP
        INSERT INTO train_class (train_id, class_id, seat_count) VALUES (train_id_input, class_ids_input[i], seat_count[i]);

        INSERT INTO seat (train_id, class_id, route_id, seat_number) SELECT train_id_input, class_ids_input[i], route_id_input, generate_series(1, seat_count[i])::text;
        
    END LOOP;

    SELECT COUNT(*) INTO station_count FROM route_stations WHERE route_id = route_id_input;

    
        FOR i IN 1 .. array_length(station_ids_input, 1) LOOP
            IF station_count = 0 THEN
            INSERT INTO route_stations (route_id, station_id, sequence_number) VALUES (route_id_input, station_ids_input[i], i);
            END IF;
            INSERT INTO schedule (train_id, station_id, route_id, arrival, departure) 
            VALUES (train_id_input, station_ids_input[i], route_id_input, arrival_time_input[i], departure_time_input[i]);
        END LOOP;
    
END;
$$;






-- procedure for checking duplicate stations in station array

-- CREATE OR REPLACE FUNCTION check_duplicate_stations(station_ids_input INT[])
-- RETURNS INT[] AS $$
-- DECLARE 
--     i INT;
--     EXIST INT;
--     new_station_id_arr INT[] := '{}';
-- BEGIN
--     FOR i IN 1 .. array_length(station_ids_input, 1) LOOP
--         SELECT COUNT(*) INTO EXIST FROM station WHERE station_id = station_ids_input[i];
--         IF EXIST = 0 THEN
--             new_station_id_arr := array_append(new_station_id_arr, station_ids_input[i]);
--         END IF;
--     END LOOP;
-- RETURN new_station_id_arr;
-- END;
-- $$ LANGUAGE plpgsql;

