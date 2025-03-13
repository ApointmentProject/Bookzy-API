CREATE OR REPLACE FUNCTION get_user_by_id(user_id INT)
RETURNS TABLE (
    id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255),
    phone_number TEXT,
    birthday DATE,
    id_number VARCHAR(50),
    gender VARCHAR(20),
    created_at TIMESTAMP
) AS $$
BEGIN
RETURN QUERY
SELECT
    u.id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    u.birthday,
    u.id_number,
    u.gender,
    u.created_at
FROM user_account u
WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE create_user(
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_email VARCHAR(255),
    p_phone_number TEXT,
    p_birthday DATE,
    p_id_number VARCHAR(50),
    p_gender VARCHAR(20),
    p_password_hash TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_account (first_name, last_name, email, phone_number, birthday, id_number, gender, password_hash)
    VALUES (p_first_name, p_last_name, p_email, p_phone_number, p_birthday, p_id_number, p_gender, p_password_hash);
END;
$$;

CREATE OR REPLACE FUNCTION check_if_user_exists(p_email VARCHAR(255))
RETURNS BOOLEAN AS $$
DECLARE
email_exists BOOLEAN;
BEGIN
SELECT EXISTS (
    SELECT 1 FROM user_account WHERE email = p_email
) INTO email_exists;

RETURN email_exists;
END;
$$ LANGUAGE plpgsql;