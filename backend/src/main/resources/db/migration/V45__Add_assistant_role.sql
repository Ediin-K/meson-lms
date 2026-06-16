INSERT INTO roles (name, description, normalized_name)
SELECT 'assistant', 'Asistent akademik / laboratorik', 'ASSISTANT'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE normalized_name = 'ASSISTANT'
);
