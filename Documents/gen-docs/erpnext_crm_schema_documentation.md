# WalaTech CRM Module - Database Schema Documentation

## Table of Contents
- [1. Overview](#1-overview)
- [2. Core Tables](#2-core-tables)
  - [2.1 Lead](#21-lead)
  - [2.2 Opportunity](#22-opportunity)
  - [2.3 Campaign](#23-campaign)
  - [2.4 Customer](#24-customer)
  - [2.5 Competitor](#25-competitor)
  - [2.6 Appointment](#26-appointment)
- [3. Sales Pipeline](#3-sales-pipeline)
  - [3.1 Sales Stages](#31-sales-stages)
  - [3.2 Opportunity Items](#32-opportunity-items)
  - [3.3 Lost Reasons](#33-lost-reasons)
- [4. Marketing Automation](#4-marketing-automation)
  - [4.1 Email Campaigns](#41-email-campaigns)
  - [4.2 Campaign Response](#42-campaign-response)
  - [4.3 Lead Scoring](#43-lead-scoring)
- [5. Key Relationships](#5-key-relationships)
- [6. Example Queries](#6-example-queries)
- [7. Integration Points](#7-integration-points)
- [8. Performance Considerations](#8-performance-considerations)
- [9. Common Issues and Solutions](#9-common-issues-and-solutions)
- [10. Best Practices](#10-best-practices)

## 1. Overview

The CRM (Customer Relationship Management) module in WalaTech helps businesses manage customer interactions, track leads and opportunities, and automate marketing campaigns. This document provides a comprehensive guide to the database schema, relationships, and usage patterns of the CRM module.

## 2. Core Tables

### 2.1 Lead

**Table Name:** `tabLead`

**Description:** Tracks potential customers who have shown interest but haven't been qualified yet.

#### 2.1.1 Key Fields

- `name` (PK): Primary key
- `lead_name`: Full name
- `email_id`: Email address
- `phone`: Primary phone number
- `mobile_no`: Mobile number
- `status`: Lead status (Open, Contacted, Opportunity, Quotation, Lost, Interested, Not Interested, Converted)
- `company_name`: Company name
- `source`: Lead source (Advertisement, Customer Event, Employee Referral, External Referral, Other, Partner, Public Relations, Website, Social Media, Direct Mail, Conference, Word of mouth, Email, Cold Call)
- `territory`: Geographic territory
- `industry`: Industry type
- `market_segment`: Market segment
- `website`: Company website
- `lead_owner`: Owner of the lead
- `converted`: Whether lead is converted to customer/opportunity (0/1)
- `converted_date`: Date of conversion
- `converted_by`: User who converted the lead
- `converted_opportunity`: Reference to created Opportunity
- `converted_customer`: Reference to created Customer

#### 2.1.2 Indexes

- `idx_lead_name` (lead_name)
- `idx_email_id` (email_id)
- `idx_company_name` (company_name)
- `idx_status` (status)
- `idx_lead_owner` (lead_owner)
- `idx_modified` (modified)
- `idx_creation` (creation)

#### 2.1.3 Foreign Key Constraints

- `fk_lead_territory` (territory → tabTerritory)
- `fk_lead_lead_owner` (lead_owner → tabUser)
- `fk_lead_converted_by` (converted_by → tabUser)
- `fk_lead_converted_opportunity` (converted_opportunity → tabOpportunity)
- `fk_lead_converted_customer` (converted_customer → tabCustomer)


### 2.2 Opportunity

**Table Name:** `tabOpportunity`

**Description:** Tracks potential sales deals and their progress through the sales pipeline.

#### 2.2.1 Key Fields

- `name` (PK): Primary key
- `opportunity_from`: Type (Lead/Customer)
- `party_name`: Reference to Lead/Customer
- `contact_display`: Contact person name
- `contact_mobile`: Contact's mobile number
- `contact_email`: Contact's email
- `status`: Sales stage (Prospecting,Qualification,Needs Analysis,Proposal,Closed Won,Closed Lost)
- `sales_stage`: Current sales stage
- `opportunity_amount`: Potential deal value
- `probability`: Win probability (%)
- `expected_closing`: Expected close date
- `territory`: Geographic territory
- `source`: Lead source
- `opportunity_owner`: Owner of the opportunity
- `company`: Company
- `conversion_rate`: Currency conversion rate
- `base_opportunity_amount`: Amount in company currency
- `contact_by`: Next contact date
- `contact_person`: Reference to Contact
- `campaign`: Reference to Campaign
- `lost_reason`: Reason if opportunity is lost
- `order_lost_reason`: More details about lost reason
- `lost_reasons_table`: Child table for multiple lost reasons
- `won_status`: Whether won (Won,Lost,In Process)
- `with_items`: Whether items are included (0/1)
- `total`: Total amount
- `base_total`: Total in company currency
- `total_ordered_qty`: Total quantity ordered
- `total_qty`: Total quantity

#### 2.2.2 Indexes

- `idx_opportunity_name` (name)
- `idx_opportunity_owner` (opportunity_owner)
- `idx_opportunity_status` (status)
- `idx_opportunity_from` (opportunity_from, party_name)
- `idx_expected_closing` (expected_closing)
- `idx_company` (company)
- `idx_modified` (modified)
- `idx_creation` (creation)

#### 2.2.3 Foreign Key Constraints

- `fk_opportunity_company` (company → tabCompany)
- `fk_opportunity_territory` (territory → tabTerritory)
- `fk_opportunity_opportunity_owner` (opportunity_owner → tabUser)
- `fk_opportunity_contact_person` (contact_person → tabContact)
- `fk_opportunity_campaign` (campaign → tabCampaign)

### 2.3 Campaign

**Table Name:** `tabCampaign`

**Description:** Tracks marketing campaigns and their effectiveness.

#### 2.3.1 Key Fields

- `name` (PK): Campaign ID
- `campaign_name`: Display name
- `campaign_owner`: Owner of the campaign
- `campaign_type`: Type of campaign (Email,Social,Print,Web,TV,Radio,Other)
- `status`: Campaign status (Planning,In Progress,Completed,Cancelled)
- `start_date`: Campaign start date
- `end_date`: Campaign end date
- `budget`: Total budget
- `expected_revenue`: Expected revenue
- `expected_sales_count`: Expected number of sales
- `actual_sales_count`: Actual number of sales
- `expected_response`: Expected response rate (%)
- `expected_response_count`: Expected number of responses
- `actual_response_count`: Actual number of responses
- `total_impressions`: Total impressions
- `total_clicks`: Total clicks
- `total_leads`: Total leads generated
- `total_opportunities`: Total opportunities created
- `total_quotes`: Total quotes generated
- `total_orders`: Total orders placed
- `total_revenue`: Total revenue generated
- `roi`: Return on investment (%)
- `description`: Campaign description
- `company`: Company

#### 2.3.2 Indexes

- `idx_campaign_name` (campaign_name)
- `idx_campaign_owner` (campaign_owner)
- `idx_campaign_status` (status)
- `idx_campaign_type` (campaign_type)
- `idx_start_date` (start_date)
- `idx_end_date` (end_date)
- `idx_company` (company)
- `idx_modified` (modified)
- `idx_creation` (creation)

#### 2.3.3 Foreign Key Constraints

- `fk_campaign_company` (company → tabCompany)
- `fk_campaign_campaign_owner` (campaign_owner → tabUser)

### 2.4 Customer

**Table Name:** `tabCustomer`

**Description:** Stores information about customers and their details.

#### 2.4.1 Key Fields

- `name` (PK): Primary key
- `customer_name`: Customer name
- `customer_type`: Type of customer (Company/Individual)
- `customer_group`: Customer group
- `territory`: Geographic territory
- `website`: Website URL
- `market_segment`: Market segment
- `industry`: Industry type
- `tax_id`: Tax ID/VATIN
- `tax_category`: Tax category
- `tax_withholding_category`: Tax withholding category
- `payment_terms`: Default payment terms
- `default_price_list`: Default price list
- `default_currency`: Default currency
- `default_bank_account`: Default bank account
- `credit_limit`: Credit limit
- `customer_primary_contact`: Primary contact person
- `customer_primary_address`: Primary address
- `customer_pos_id`: POS ID

#### 2.4.2 Indexes

- `idx_customer_name` (customer_name)
- `idx_customer_group` (customer_group)
- `idx_territory` (territory)
- `idx_company` (company)
- `idx_modified` (modified)
- `idx_creation` (creation)

#### 2.4.3 Foreign Key Constraints

- `fk_customer_company` (company → tabCompany)
- `fk_customer_territory` (territory → tabTerritory)
- `fk_customer_default_price_list` (default_price_list → tabPrice List)
- `fk_customer_default_currency` (default_currency → tabCurrency)
- `fk_customer_default_bank_account` (default_bank_account → tabAccount)
- `fk_customer_customer_primary_contact` (customer_primary_contact → tabContact)
- `fk_customer_customer_primary_address` (customer_primary_address → tabAddress)

### 2.5 Competitor

**Table Name:** `tabCompetitor`

**Description:** Tracks information about business competitors for competitive analysis.

#### 2.5.1 Key Fields

- `name` (PK): Primary key
- `competitor_name`: Name of the competitor
- `website`: Competitor's website
- `company`: Company
- `description`: Description of the competitor
- `competitive_advantage`: Key competitive advantages
- `weaknesses`: Known weaknesses
- `market_share`: Estimated market share
- `annual_revenue`: Annual revenue
- `territory`: Geographic territory
- `industry`: Industry type
- `competitor_details`: Additional details in JSON format

#### 2.5.2 Indexes

- `idx_competitor_name` (competitor_name)
- `idx_company` (company)
- `idx_territory` (territory)
- `idx_modified` (modified)
- `idx_creation` (creation)

#### 2.5.3 Foreign Key Constraints

- `fk_competitor_company` (company → tabCompany)
- `fk_competitor_territory` (territory → tabTerritory)

### 2.6 Appointment

**Table Name:** `tabAppointment`

**Description:** Manages scheduled appointments and meetings with leads, opportunities, and customers.

#### 2.6.1 Key Fields

- `name` (PK): Primary key
- `appointment_type`: Type of appointment (Meeting, Call, Email, Other)
- `scheduled_time`: Scheduled date and time
- `duration`: Duration in minutes
- `status`: Status (Open, Scheduled, Completed, Cancelled, No Show)
- `party_type`: Type of party (Lead, Opportunity, Customer, etc.)
- `party_name`: Name of the party
- `calendar_event`: Link to calendar event
- `description`: Appointment details
- `contact_display`: Contact person name
- `contact_mobile`: Contact's mobile number
- `contact_email`: Contact's email
- `customer_name`: Customer name
- `opportunity`: Related opportunity
- `lead`: Related lead
- `company`: Company
- `sales_person`: Assigned sales person
- `reminder_sent`: Whether reminder was sent
- `reminder_minutes_before`: Minutes before to send reminder

#### 2.6.2 Indexes

- `idx_scheduled_time` (scheduled_time)
- `idx_status` (status)
- `idx_party` (party_type, party_name)
- `idx_company` (company)
- `idx_modified` (modified)
- `idx_creation` (creation)

#### 2.6.3 Foreign Key Constraints

- `fk_appointment_company` (company → tabCompany)
- `fk_appointment_customer` (customer_name → tabCustomer)
- `fk_appointment_opportunity` (opportunity → tabOpportunity)
- `fk_appointment_lead` (lead → tabLead)
- `fk_appointment_sales_person` (sales_person → tabSales Person)

## 3. Sales Pipeline

### 3.1 Sales Stages

The sales pipeline in WalaTech CRM is managed through various stages that a lead or opportunity progresses through. The standard stages include:

1. **Lead** - Initial contact or inquiry
2. **Open** - Opportunity has been created
3. **Replied** - Initial response sent
4. **Opportunity** - Potential deal identified
5. **Quotation** - Proposal sent
6. **Negotiation** - Terms being discussed
7. **Won** - Deal closed successfully
8. **Lost** - Deal lost to competition or other reasons

### 3.2 Opportunity Items

Opportunities can contain multiple items, each representing a product or service being quoted. Key fields include:

- `item_code`: Product/Service code
- `item_name`: Name of the product/service
- `description`: Detailed description
- `qty`: Quantity
- `rate`: Unit price
- `amount`: Total amount (qty × rate)
- `uom`: Unit of Measure
- `conversion_factor`: For unit conversions
- `warehouse`: Source warehouse

### 3.3 Lost Reasons

When an opportunity is marked as lost, a reason can be specified:

- **Common Lost Reasons**:
  - Price too high
  - Lost to competitor
  - No decision
  - No response
  - Product not suitable
  - Other (with custom notes)

## 4. Marketing Automation

### 4.1 Email Campaigns

Email campaigns can be created to send bulk emails to leads or customers. Features include:

- Email templates with dynamic fields
- Scheduling capabilities
- A/B testing
- Click and open tracking
- Unsubscribe management
- Performance analytics

### 4.2 Campaign Response

Tracks responses to marketing campaigns:

- Response type (Email opened, Link clicked, Form submitted, etc.)
- Response time
- Related lead/contact
- Campaign source
- Conversion details

### 4.3 Lead Scoring

Automated lead scoring based on various parameters:

- Email engagement
- Website visits
- Content downloads
- Form submissions
- Event attendance
- Social media interactions

## 5. Key Relationships

### 5.1 Lead to Customer Flow
1. Lead is created from various sources
2. Lead is qualified and converted to an Opportunity
3. Opportunity progresses through sales stages
4. Upon success, Customer and Contact records are created

### 5.2 Campaign to Opportunity
1. Campaign is created and executed
2. Leads are generated from campaign responses
3. Qualified leads become Opportunities
4. Opportunities are tracked back to the original campaign

### 5.3 Customer to Sales
1. Customer record is the central entity
2. Multiple Contacts can be linked
3. Multiple Opportunities can be tracked
4. Sales orders and invoices are linked to the customer

## 6. Example Queries

### 6.1 Find High-Value Opportunities
```sql
SELECT 
    o.name, o.opportunity_owner, o.expected_closing,
    o.opportunity_amount, o.contact_person
FROM 
    `tabOpportunity` o
WHERE 
    o.status = 'Open'
    AND o.opportunity_amount > 10000
ORDER BY 
    o.expected_closing ASC;
```

### 6.2 Campaign Performance
```sql
SELECT 
    c.campaign_name,
    COUNT(DISTINCT l.name) as leads_generated,
    COUNT(DISTINCT o.name) as opportunities_created,
    SUM(IFNULL(o.opportunity_amount, 0)) as total_opportunity_value
FROM 
    `tabCampaign` c
LEFT JOIN 
    `tabLead` l ON c.name = l.campaign_name
LEFT JOIN 
    `tabOpportunity` o ON c.name = o.campaign
GROUP BY 
    c.name, c.campaign_name;
```

## 7. Integration Points

### 7.1 WalaTech Modules
- **Selling**: Quotes, Sales Orders, and Invoices
- **Buying**: Supplier Quotations and Purchase Orders
- **Projects**: Project tracking and billing
- **Support**: Issue tracking and resolution
- **Accounts**: Payments and financial tracking

### 7.2 External Integrations
- Email services (Gmail, Outlook)
- Calendar services (Google Calendar, Outlook Calendar)
- Telephony systems (Twilio, Exotel)
- Marketing automation (Mailchimp, SendGrid)
- CRM tools (Zapier, Pipedrive)

## 8. Performance Considerations

### 8.1 Indexing Strategy
- Ensure proper indexes on frequently queried fields
- Composite indexes for common filter combinations
- Regular index maintenance and optimization

### 8.2 Data Archiving
- Archive old leads and opportunities
- Move historical data to separate tables
- Implement data retention policies

### 8.3 Caching
- Enable query caching for reports
- Cache frequently accessed customer data
- Use Redis for session management

## 9. Common Issues and Solutions

### 9.1 Performance Bottlenecks
- **Issue**: Slow lead import/export
  **Solution**: Use bulk operations and background jobs

- **Issue**: Reports timing out
  **Solution**: Optimize queries and add appropriate indexes

### 9.2 Data Integrity
- **Issue**: Duplicate leads
  **Solution**: Implement deduplication rules

- **Issue**: Inconsistent customer data
  **Solution**: Enforce data validation rules

## 10. Best Practices

### 10.1 Data Management
- Regular data cleaning and deduplication
- Consistent naming conventions
- Proper categorization and tagging

### 10.2 Process Automation
- Automate lead assignment
- Set up email notifications
- Create workflow rules for common processes

### 10.3 Security
- Role-based access control
- Regular permission reviews
- Audit logging for sensitive operations

## 11. Conclusion

This documentation provides a comprehensive overview of the WalaTech CRM module's database schema, including detailed information about the core tables, their relationships, and key fields. The CRM module is designed to help businesses manage their customer relationships effectively, from initial lead capture to opportunity management and customer retention.

Key features covered in this documentation include:

- Lead management and qualification
- Opportunity tracking and sales pipeline management
- Campaign management for marketing automation
- Customer information management
- Integration with other business processes

For more detailed information about specific features or configurations, please refer to the official WalaTech documentation or consult with your system administrator.
