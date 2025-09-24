# WalaTech CRUD Operations Guide

This document provides detailed CRUD (Create, Read, Update, Delete) operation examples for WalaTech core modules.

## Table of Contents
1. [Sales Module](#sales-module)
2. [Purchase Module](#purchase-module)
3. [Inventory Module](#inventory-module)
4. [Accounting Module](#accounting-module)
5. [Manufacturing Module](#manufacturing-module)
6. [HR Module](#hr-module)

## Sales Module

### Sales Order

#### Create
```python
def create_sales_order(customer, items, delivery_date, company, **kwargs):
    """
    Create a new Sales Order
    
    Args:
        customer (str): Customer ID
        items (list): List of dicts with item details
        delivery_date (str): Expected delivery date (YYYY-MM-DD)
        company (str): Company name
        **kwargs: Additional fields (status, payment_terms, etc.)
    """
    so = frappe.new_doc("Sales Order")
    so.customer = customer
    so.delivery_date = delivery_date
    so.company = company
    
    # Set additional fields if provided
    for field, value in kwargs.items():
        if hasattr(so, field):
            setattr(so, field, value)
    
    # Add items
    for item in items:
        so.append("items", {
            "item_code": item.get("item_code"),
            "qty": item.get("qty", 1),
            "rate": item.get("rate"),
            "warehouse": item.get("warehouse"),
            "uom": item.get("uom"),
            "conversion_factor": item.get("conversion_factor", 1)
        })
    
    so.insert(ignore_permissions=True)
    return so.name
```

#### Read
```python
def get_sales_order(order_id, fields=None):
    """
    Get Sales Order details
    
    Args:
        order_id (str): Sales Order ID
        fields (list, optional): List of fields to return
    """
    if not fields:
        fields = ["name", "customer", "status", "grand_total", "delivery_date"]
    
    return frappe.get_doc("Sales Order", order_id).as_dict()
```

### Sales Invoice

#### Create from Delivery Note
```python
def create_sales_invoice_from_dn(delivery_note):
    """
    Create Sales Invoice from Delivery Note
    
    Args:
        delivery_note (str): Delivery Note ID
    """
    dn = frappe.get_doc("Delivery Note", delivery_note)
    
    si = frappe.new_doc("Sales Invoice")
    si.customer = dn.customer
    si.due_date = frappe.utils.add_days(dn.posting_date, 30)  # 30 days credit
    si.update_stock = 0
    
    # Copy items
    for item in dn.items:
        si.append("items", {
            "item_code": item.item_code,
            "qty": item.qty,
            "rate": item.rate,
            "amount": item.amount,
            "warehouse": item.warehouse,
            "dn_detail": item.name,
            "sales_order": item.against_sales_order
        })
    
    si.insert(ignore_permissions=True)
    return si.name
```

## Purchase Module

### Purchase Order

#### Create
```python
def create_purchase_order(supplier, items, schedule_date, company, **kwargs):
    """
    Create a new Purchase Order
    
    Args:
        supplier (str): Supplier ID
        items (list): List of dicts with item details
        schedule_date (str): Expected delivery date (YYYY-MM-DD)
        company (str): Company name
        **kwargs: Additional fields (status, payment_terms, etc.)
    """
    po = frappe.new_doc("Purchase Order")
    po.supplier = supplier
    po.schedule_date = schedule_date
    po.company = company
    
    # Set additional fields if provided
    for field, value in kwargs.items():
        if hasattr(po, field):
            setattr(po, field, value)
    
    # Add items
    for item in items:
        po.append("items", {
            "item_code": item.get("item_code"),
            "qty": item.get("qty", 1),
            "rate": item.get("rate"),
            "warehouse": item.get("warehouse"),
            "uom": item.get("uom"),
            "conversion_factor": item.get("conversion_factor", 1),
            "schedule_date": item.get("schedule_date", schedule_date)
        })
    
    po.insert(ignore_permissions=True)
    return po.name
```

## Inventory Module

### Stock Entry

#### Create Stock Transfer
```python
def create_stock_transfer(items, from_warehouse, to_warehouse, purpose="Material Transfer", **kwargs):
    """
    Create a Stock Entry for material transfer
    
    Args:
        items (list): List of dicts with item details
        from_warehouse (str): Source warehouse
        to_warehouse (str): Target warehouse
        purpose (str): Purpose of stock entry
        **kwargs: Additional fields (posting_date, company, etc.)
    """
    se = frappe.new_doc("Stock Entry")
    se.stock_entry_type = purpose
    se.from_warehouse = from_warehouse
    se.to_warehouse = to_warehouse
    
    # Set additional fields if provided
    for field, value in kwargs.items():
        if hasattr(se, field):
            setattr(se, field, value)
    
    # Add items
    for item in items:
        se.append("items", {
            "item_code": item.get("item_code"),
            "qty": item.get("qty"),
            "s_warehouse": from_warehouse,
            "t_warehouse": to_warehouse,
            "basic_rate": item.get("rate"),
            "conversion_factor": item.get("conversion_factor", 1)
        })
    
    se.insert(ignore_permissions=True)
    se.submit()
    return se.name
```

## Accounting Module

### Journal Entry

#### Create
```python
def create_journal_entry(
    accounts,
    posting_date=None,
    company=None,
    voucher_type="Journal Entry",
    **kwargs
):
    """
    Create a Journal Entry
    
    Args:
        accounts (list): List of dicts with account entries
        posting_date (str, optional): Posting date (default: today)
        company (str, optional): Company name
        voucher_type (str, optional): Type of voucher
        **kwargs: Additional fields (reference_no, reference_date, etc.)
    """
    if not posting_date:
        posting_date = frappe.utils.today()
    
    je = frappe.new_doc("Journal Entry")
    je.posting_date = posting_date
    je.voucher_type = voucher_type
    je.company = company or frappe.defaults.get_user_default("Company")
    
    # Set additional fields if provided
    for field, value in kwargs.items():
        if hasattr(je, field):
            setattr(je, field, value)
    
    # Add accounts
    for acc in accounts:
        je.append("accounts", {
            "account": acc.get("account"),
            "debit_in_account_currency": acc.get("debit", 0),
            "credit_in_account_currency": acc.get("credit", 0),
            "party_type": acc.get("party_type"),
            "party": acc.get("party"),
            "cost_center": acc.get("cost_center"),
            "project": acc.get("project")
        })
    
    je.insert(ignore_permissions=True)
    return je.name
```

## Manufacturing Module

### Work Order

#### Create
```python
def create_work_order(
    production_item,
    qty,
    company,
    planned_start_date=None,
    **kwargs
):
    """
    Create a Work Order
    
    Args:
        production_item (str): Item to be produced
        qty (float): Quantity to produce
        company (str): Company name
        planned_start_date (str, optional): Planned start date
        **kwargs: Additional fields (bom_no, wip_warehouse, etc.)
    """
    if not planned_start_date:
        planned_start_date = frappe.utils.today()
    
    wo = frappe.new_doc("Work Order")
    wo.production_item = production_item
    wo.qty = qty
    wo.company = company
    wo.planned_start_date = planned_start_date
    
    # Set additional fields if provided
    for field, value in kwargs.items():
        if hasattr(wo, field):
            setattr(wo, field, value)
    
    # If BOM not provided, get default BOM for the item
    if not wo.get("bom_no"):
        wo.bom_no = frappe.get_value("BOM", {
            "item": production_item,
            "is_active": 1,
            "is_default": 1
        }, "name")
    
    wo.insert(ignore_permissions=True)
    return wo.name
```

## HR Module

### Employee

#### Create
```python
def create_employee(
    first_name,
    last_name,
    company,
    date_of_joining,
    **kwargs
):
    """
    Create a new Employee
    
    Args:
        first_name (str): First name
        last_name (str): Last name
        company (str): Company name
        date_of_joining (str): Date of joining (YYYY-MM-DD)
        **kwargs: Additional fields (gender, department, designation, etc.)
    """
    emp = frappe.new_doc("Employee")
    emp.first_name = first_name
    emp.last_name = last_name
    emp.company = company
    emp.date_of_joining = date_of_joining
    
    # Set additional fields if provided
    for field, value in kwargs.items():
        if hasattr(emp, field):
            setattr(emp, field, value)
    
    emp.insert(ignore_permissions=True)
    return emp.name
```

## Common Utility Functions

### Get Document Status
```python
def get_document_status(doctype, docname):
    """Get the status of a document"""
    return frappe.get_value(doctype, docname, "status")
```

### Cancel Document
```python
def cancel_document(doctype, docname):
    """Cancel a document"""
    doc = frappe.get_doc(doctype, docname)
    doc.cancel()
    return f"{doctype} {docname} has been cancelled"
```

### Submit Document
```python
def submit_document(doctype, docname):
    """Submit a document"""
    doc = frappe.get_doc(doctype, docname)
    doc.submit()
    return f"{doctype} {docname} has been submitted"
```
