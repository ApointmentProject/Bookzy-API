CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
    id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email TEXT,  -- Cambiado a TEXT para coincidir con la tabla
    phone_number TEXT,  -- Cambiado a TEXT para coincidir con la tabla
    birthday DATE,
    id_number VARCHAR(50),
    gender VARCHAR(20),
    created_at TIMESTAMP,
    uid TEXT,  -- Agregado el campo uid
    profile_pic TEXT  -- Agregado el campo profile_pic
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
        u.created_at,
        u.uid,
        u.profile_pic
    FROM user_account u
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE create_user(
    p_first_name VARCHAR(50),
    p_last_name VARCHAR(50),
    p_email TEXT,  -- Cambiado a TEXT
    p_phone_number TEXT,  -- Cambiado a TEXT
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

CREATE OR REPLACE FUNCTION check_if_user_exists(p_email TEXT)  -- Cambiado a TEXT
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

-- 4. Actualizar la función get_user_password
DROP FUNCTION IF EXISTS get_user_password;

CREATE OR REPLACE FUNCTION get_user_password(user_email TEXT)  -- Cambiado a TEXT
RETURNS TEXT AS $$
DECLARE
    user_password TEXT;
BEGIN
    SELECT password_hash
    INTO user_password
    FROM user_account
    WHERE email = user_email;

    RETURN user_password;
END;
$$ LANGUAGE plpgsql;



