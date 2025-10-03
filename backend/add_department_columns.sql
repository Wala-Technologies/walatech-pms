-- Add department_id columns to remaining tables
ALTER TABLE `tabsales order` ADD COLUMN department_id varchar(36) NULL;
ALTER TABLE `tabsales order item` ADD COLUMN department_id varchar(36) NULL;

-- Add foreign key constraints
ALTER TABLE items ADD CONSTRAINT FK_items_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);
ALTER TABLE acc_accounts ADD CONSTRAINT FK_acc_accounts_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);
ALTER TABLE acc_journal_entries ADD CONSTRAINT FK_acc_journal_entries_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);
ALTER TABLE acc_journal_entry_lines ADD CONSTRAINT FK_acc_journal_entry_lines_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);
ALTER TABLE tabcustomer ADD CONSTRAINT FK_tabcustomer_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);
ALTER TABLE `tabsales order` ADD CONSTRAINT FK_tabsales_order_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);
ALTER TABLE `tabsales order item` ADD CONSTRAINT FK_tabsales_order_item_department FOREIGN KEY (department_id) REFERENCES tabdepartment(id);