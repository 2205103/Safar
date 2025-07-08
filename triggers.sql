-- register new user trigger
CREATE OR REPLACE FUNCTION sign_up()
RETURNS TRIGGER AS $$
DECLARE
    LNAME VARCHAR(50);
    FNAME VARCHAR(50);
    NID VARCHAR(20);
    BREG VARCHAR(20);
    PASSENGER_EMAIL VARCHAR(100);
BEGIN
    SELECT INTO NID passenger.nid_number FROM passenger WHERE nid_number = NEW.nid_number AND LENGTH(NEW.nid_number) > 0;
    IF FOUND THEN
        RAISE EXCEPTION 'NID already in use' USING ERRCODE = 'XX001';
    END IF;

    SELECT INTO BREG passenger.birth_registration_number FROM passenger WHERE birth_registration_number = NEW.birth_registration_number AND LENGTH(NEW.birth_registration_number) > 0;
    IF FOUND THEN
        RAISE EXCEPTION 'Birth Registration Number already in use' USING ERRCODE = 'XX002';
    END IF;

    IF NEW.nid_number IS NULL AND NEW.birth_registration_number IS NULL THEN
        RAISE EXCEPTION 'NID or Birth Registration Number must be provided' USING ERRCODE = 'XX003';
    END IF;

    FNAME := NEW.first_name;
    LNAME := NEW.last_name;
    IF LENGTH(FNAME) = 0 OR LENGTH(LNAME) = 0 THEN
        RAISE EXCEPTION 'First Name and Last Name are required fields' USING ERRCODE = 'XX005';
    END IF;

    
    IF NEW.email IS NULL THEN
        RAISE EXCEPTION 'Email is required' USING ERRCODE = 'XX008';
    END IF;

    SELECT INTO PASSENGER_EMAIL passenger.email FROM passenger WHERE email = NEW.email AND NEW.email IS NOT NULL;

    IF FOUND THEN
        RAISE EXCEPTION 'Email already in use' USING ERRCODE = 'XX007';
    END IF;

    IF NEW.date_of_birth IS NULL OR  NEW.date_of_birth > CURRENT_DATE THEN
        RAISE EXCEPTION 'Insert a valid date of Birth' USING ERRCODE = 'XX006';
    END IF;

    IF NEW.phone_number IS NULL OR LENGTH(NEW.phone_number) <> 11 THEN
        RAISE EXCEPTION 'Invalid phone Number' USING ERRCODE = 'XX004';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER sign_up_trigger
BEFORE INSERT 
ON passenger
FOR EACH ROW
EXECUTE FUNCTION sign_up();





-- check for password match , phone number check before updating passenger information
CREATE OR REPLACE FUNCTION check_password()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password <> OLD.password THEN
        RAISE EXCEPTION 'Password does not match' USING ERRCODE = 'XX009';
    END IF;
    IF NEW.phone_number IS NULL OR LENGTH(NEW.phone_number) < 11 THEN
        RAISE EXCEPTION 'Invalid phone Number' USING ERRCODE = 'XX004';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER check_password_trigger
BEFORE UPDATE
ON passenger
FOR EACH ROW
EXECUTE FUNCTION check_password();


-- trigger for blocking refund the day before journey

CREATE OR REPLACE FUNCTION block_refund()
RETURNS TRIGGER AS $$
DECLARE
    doj DATE;
BEGIN
    SELECT date_of_journey INTO doj FROM ticket WHERE transaction_id = NEW.transaction_id;
    IF doj - CURRENT_DATE = 1 THEN
        RAISE EXCEPTION 'Refund not allowed the day before journey' USING ERRCODE = 'XX010';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_refund_trigger
BEFORE INSERT
ON refund
FOR EACH ROW
EXECUTE FUNCTION block_refund();




CREATE OR REPLACE FUNCTION check_transaction_exists()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM transaction WHERE transaction_id = NEW.transaction_id) THEN
        RAISE EXCEPTION 'Such a transaction already exists' USING ERRCODE = 'XX001';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER before_insert_transaction
BEFORE INSERT ON "transaction"
FOR EACH ROW
EXECUTE FUNCTION check_transaction_exists();



CREATE OR REPLACE TRIGGER before_update_transaction
BEFORE UPDATE OF transaction_id ON "transaction"
FOR EACH ROW
EXECUTE FUNCTION check_transaction_exists();
