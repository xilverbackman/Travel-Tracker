-- name: getCountryCode  
    SELECT country_code 
    FROM countries
    WHERE LOWER(country_name) LIKE '%' || $1 || '%'; 
  
-- name: addCountry  
    INSERT INTO visited_countries(country_code, user_id) 
    VALUES ($1, $2)
    RETURNING *; 

-- name: deleteCountry  
    DELETE FROM visited_countries 
    WHERE country_code = ($1) AND user_id = ($2)
    RETURNING *; 
  
-- name: getUsersCountries  
    SELECT users.name, users.id, visited_countries.country_code, visited_countries.user_id 
    FROM users 
    JOIN visited_countries 
    ON users.id = visited_countries.user_id
    WHERE users.id = $1; 

--name: addUser
    INSERT INTO users(name, colour) 
    VALUES($1, $2)
    RETURNING *;

--name: deleteUser
    DELETE FROM users 
    WHERE users.id = $1
    RETURNING *;