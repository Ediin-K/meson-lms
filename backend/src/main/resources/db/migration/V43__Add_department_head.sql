ALTER TABLE departments ADD COLUMN head_user_id BIGINT NULL;
ALTER TABLE departments ADD CONSTRAINT fk_departments_head FOREIGN KEY (head_user_id) REFERENCES users(id);
